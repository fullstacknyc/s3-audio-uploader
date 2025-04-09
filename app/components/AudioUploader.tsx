'use client';
import { useState, useCallback, useMemo } from 'react';
import { FiUpload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function AudioUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Memoize constants to prevent recreation on every render
  const MAX_FILE_SIZE = useMemo(() => 100 * 1024 * 1024, []); // 100MB
  const SUPPORTED_FORMATS = useMemo(() => [
    'audio/mpeg', // MP3
    'audio/wav',  // WAV
    'audio/aac',  // AAC
    'audio/x-m4a', // M4A
    'audio/ogg'   // OGG
  ], []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Reset previous state
    setError(null);
    setStatus('idle');

    // Validate file type
    if (!SUPPORTED_FORMATS.includes(selectedFile.type)) {
      setError(`Unsupported format: ${selectedFile.type}. We accept MP3, WAV, AAC, M4A, OGG`);
      return;
    }
    
    // Validate file size (100MB max)
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File too large (${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB). Max 100MB allowed.`);
      return;
    }

    setFile(selectedFile);
  }, [MAX_FILE_SIZE, SUPPORTED_FORMATS]); // Added dependencies here

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setError(null);
    setProgress(0);

    try {
      // Step 1: Get pre-signed URL
      const apiResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          filetype: file.type,
          filesize: file.size
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'Failed to prepare upload');
      }

      const { url } = await apiResponse.json();

      // Step 2: Upload to S3 with progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.open('PUT', url, true);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      setStatus('success');
      setProgress(100);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
      console.error('Upload error:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Audio File (Max 100MB)
        </label>
        
        <div className="flex items-center gap-4">
          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              accept={SUPPORTED_FORMATS.join(',')}
              onChange={handleFileChange}
              className="hidden"
              id="audio-upload"
            />
            <div className="flex items-center justify-between px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
              <span className="truncate max-w-xs">
                {file ? file.name : 'Click to select audio...'}
              </span>
              <FiUpload className="text-gray-500 text-lg" />
            </div>
          </label>
          
          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {status === 'uploading' ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        
        {file && (
          <div className="text-sm text-gray-600">
            {file.type.split('/')[1].toUpperCase()} • {(file.size / (1024 * 1024)).toFixed(2)}MB
          </div>
        )}
      </div>

      {status === 'uploading' && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="p-4 flex items-center gap-3 bg-green-50 text-green-800 rounded-lg border border-green-200">
          <FiCheckCircle className="text-green-500 text-xl flex-shrink-0" />
          <div>
            <p className="font-medium">Upload successful!</p>
            <p className="text-sm">Your audio is now being processed.</p>
          </div>
        </div>
      )}

      {(status === 'error' || error) && (
        <div className="p-4 flex items-center gap-3 bg-red-50 text-red-800 rounded-lg border border-red-200">
          <FiAlertCircle className="text-red-500 text-xl flex-shrink-0" />
          <div>
            <p className="font-medium">Upload failed</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
        <p className="font-medium">Supported formats:</p>
        <ul className="list-disc list-inside mt-1">
          <li>MP3 (up to 100MB)</li>
          <li>WAV (up to 100MB)</li>
          <li>AAC/M4A (up to 100MB)</li>
          <li>OGG (up to 100MB)</li>
        </ul>
      </div>
    </div>
  );
}