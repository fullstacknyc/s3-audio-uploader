'use client';
import { useState } from 'react';
import { FiUpload, FiCheckCircle, FiAlertCircle, FiCopy, FiDownload } from 'react-icons/fi';

const MAX_SIZE = 100 * 1024 * 1024;
const FORMATS = ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/x-m4a', 'audio/ogg'];

export default function AudioUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError('');
    if (!FORMATS.includes(selectedFile.type)) {
      setError(`Unsupported format. Supported: ${FORMATS.map(f => f.split('/')[1].toUpperCase()).join(', ')}`);
      return;
    }
    if (selectedFile.size > MAX_SIZE) {
      setError(`File too large (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). Max 100MB allowed.`);
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filename: file.name, 
          filetype: file.type,
          filesize: file.size 
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const { uploadUrl, downloadUrl } = await res.json();
      setDownloadUrl(downloadUrl);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audio Uploader</h1>
        <p className="mt-1 text-gray-600">Upload files to S3 with secure links</p>
      </div>

      <div className="space-y-4">
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept={FORMATS.join(',')}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center text-center">
            <FiUpload className="text-gray-400 text-2xl mb-2" />
            <p className="text-sm text-gray-600">
              {file ? file.name : 'Drag & drop or click to select'}
            </p>
            {file && (
              <p className="text-xs text-gray-500 mt-1">
                {file.type.split('/')[1].toUpperCase()} • {(file.size / (1024 * 1024)).toFixed(1)}MB
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || status === 'uploading'}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'uploading' ? 'Uploading...' : 'Upload File'}
        </button>

        {status === 'uploading' && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '50%' }} />
          </div>
        )}

        {status === 'success' && downloadUrl && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <FiCheckCircle className="text-green-500" />
              <h3 className="font-medium text-green-800">Upload Successful</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={downloadUrl}
                readOnly
                className="flex-1 px-3 py-2 text-xs border rounded truncate"
              />
              <button
                onClick={() => navigator.clipboard.writeText(downloadUrl)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                <FiCopy />
              </button>
            </div>
            <a
              href={downloadUrl}
              download
              className="mt-2 w-full block text-center py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded"
            >
              <FiDownload className="inline mr-1" /> Download
            </a>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-800 rounded-lg border border-red-200 flex items-start gap-2">
            <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>Supported formats: {FORMATS.map(f => f.split('/')[1].toUpperCase()).join(', ')}</p>
          <p>Max file size: 100MB</p>
        </div>
      </div>
    </div>
  );
}