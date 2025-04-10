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
      setError(`Unsupported format. We accept: ${FORMATS.join(', ').replace(/audio\//g, '').toUpperCase()}`);
      return;
    }
    if (selectedFile.size > MAX_SIZE) {
      setError(`File too large (${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB). Max 100MB allowed.`);
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
        body: JSON.stringify({ filename: file.name, filetype: file.type }),
      });

      const { uploadUrl, downloadUrl } = await res.json();
      setDownloadUrl(downloadUrl);

      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Audio File (Max 100MB)</label>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="file"
              accept={FORMATS.join(',')}
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="audio-upload"
            />
            <div className="flex items-center justify-end px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
              {file && (
                <span className="truncate max-w-xs mr-auto">
                  {file.name}
                </span>
              )}
              <FiUpload className="text-gray-500 text-lg" />
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {status === 'uploading' ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {file && <div className="text-sm text-gray-600">{file.type.split('/')[1].toUpperCase()} • {(file.size / (1024 * 1024)).toFixed(2)}MB</div>}
      </div>

      {status === 'uploading' && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '50%' }} />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <FiCheckCircle className="text-green-500 text-xl" />
            <h3 className="font-medium text-green-800">Upload Successful!</h3>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Download link (expires in 7 days):</p>
            <div className="flex gap-2">
              <input type="text" value={downloadUrl} readOnly className="flex-1 px-3 py-2 text-sm border rounded-lg truncate" />
              <button onClick={() => navigator.clipboard.writeText(downloadUrl)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg" title="Copy link">
                <FiCopy />
              </button>
              <a href={downloadUrl} download className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg" title="Download now">
                <FiDownload />
              </a>
            </div>
          </div>
        </div>
      )}

      {(status === 'error' || error) && (
        <div className="p-4 flex items-center gap-3 bg-red-50 text-red-800 rounded-lg border border-red-200">
          <FiAlertCircle className="text-red-500 text-xl" />
          <div>
            <p className="font-medium">Upload failed</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
        <p className="font-medium">Supported formats:</p>
        <ul className="list-disc list-inside mt-1">
          {FORMATS.map(f => <li key={f}>{f.replace('audio/', '').toUpperCase()} (up to 100MB)</li>)}
        </ul>
      </div>
    </div>
  );
}