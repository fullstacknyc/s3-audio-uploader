'use client';
import { useState } from 'react';

export default function AudioUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
  
    setIsUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          filetype: file.type,
        }),
      });
  
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get upload URL');
      }
  
      const uploadResponse = await fetch(result.url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
  
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }
  
      alert('Upload successful!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={isUploading}
      />
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isUploading ? 'Uploading...' : 'Upload Audio'}
      </button>
    </div>
  );
}