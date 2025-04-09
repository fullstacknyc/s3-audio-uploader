'use client';
import { useState } from 'react';

export default function AudioUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    
    setStatus('uploading');
    setError(null);

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
        throw new Error('Failed to prepare upload');
      }

      const { url } = await apiResponse.json();

      // Step 2: Upload to S3
      const s3Response = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!s3Response.ok) {
        throw new Error('Storage service rejected file');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
      console.error('Upload error:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setStatus('idle');
          }}
          disabled={status === 'uploading'}
          className="hidden"
          id="audio-upload"
        />
        <label
          htmlFor="audio-upload"
          className="cursor-pointer block p-4 hover:bg-gray-50 rounded"
        >
          {file ? file.name : 'Select audio file'}
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'uploading' ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">↻</span> Uploading...
          </span>
        ) : (
          'Upload Audio'
        )}
      </button>

      {status === 'success' && (
        <div className="p-3 bg-green-100 text-green-800 rounded">
          Upload successful!
        </div>
      )}

      {status === 'error' && error && (
        <div className="p-3 bg-red-100 text-red-800 rounded">
          Error: {error}
        </div>
      )}
    </div>
  );
}