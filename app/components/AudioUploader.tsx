'use client';
import { useState, useCallback } from 'react';
import { FiUpload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function AudioUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('audio/')) {
        setError('Please select an audio file');
        return;
      }
      
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setStatus('idle');
      setError(null);
    }
  }, []);

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
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(xhr.response);
            } else {
              reject(new Error('Upload failed'));
            }
          }
        };
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
          Audio File
        </label>
        
        <div className="flex items-center gap-4">
          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
              id="audio-upload"
            />
            <div className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              <span className="truncate">
                {file ? file.name : 'Select a file...'}
              </span>
              <FiUpload className="text-gray-500" />
            </div>
          </label>
          
          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload
          </button>
        </div>
        
        {file && (
          <div className="text-xs text-gray-500">
            {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
          </div>
        )}
      </div>

      {status === 'uploading' && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-600">
            Uploading... {progress}%
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="p-3 flex items-center gap-2 bg-green-50 text-green-800 rounded-md">
          <FiCheckCircle className="text-green-500" />
          <span>Upload successful!</span>
        </div>
      )}

      {(status === 'error' || error) && (
        <div className="p-3 flex items-center gap-2 bg-red-50 text-red-800 rounded-md">
          <FiAlertCircle className="text-red-500" />
          <span>{error || 'Upload failed'}</span>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Supported formats: MP3, WAV, AAC (Max 10MB)
      </div>
    </div>
  );
}