'use client';
import { useState, useCallback, useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}
import { FiUpload, FiCheckCircle, FiAlertCircle, FiCopy, FiDownload } from 'react-icons/fi';

const MAX_SIZE = 100 * 1024 * 1024; // 100MB
const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/x-m4a', 'audio/ogg'];

export default function AudioUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError('');
    if (!SUPPORTED_FORMATS.includes(selectedFile.type)) {
      setError(`Unsupported format. We accept: ${SUPPORTED_FORMATS.map(f => f.split('/')[1].toUpperCase()).join(', ')}`);
      return;
    }
    if (selectedFile.size > MAX_SIZE) {
      setError(`File too large (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). Max 100MB allowed.`);
      return;
    }
    setFile(selectedFile);
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setError('');

    try {
      // First get the presigned URL
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filename: file.name, 
          filetype: file.type,
          filesize: file.size 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { uploadUrl, downloadUrl } = await res.json();
      setDownloadUrl(downloadUrl);

      // Then upload the file directly to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload to storage failed');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
      if (retryCount < 3) {
        setRetryCount(retryCount + 1);
        handleUpload(); // Retry upload
      }
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      const adElements = document.querySelectorAll('.adsbygoogle');
      adElements.forEach((adElement) => {
        if (!adElement.hasAttribute('data-adsbygoogle-status')) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      });
    }
  }, []);

  return (
    <div className="uploader">
      <div className="fileDropzone">
        <input
          type="file"
          accept={SUPPORTED_FORMATS.join(',')}
          onChange={handleFileChange}
          className="fileInput"
          id="audio-upload"
        />
        <label htmlFor="audio-upload" className="dropzoneLabel">
          <FiUpload className="uploadIcon" />
          <p className="dropzoneText">
            {file ? file.name : 'Drag & drop your audio file or click to browse'}
          </p>
          {file && (
            <p className="fileInfo">
              {file.type.split('/')[1].toUpperCase()} • {(file.size / (1024 * 1024)).toFixed(1)}MB
            </p>
          )}
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className="uploadButton"
      >
        {status === 'uploading' ? (
          <span className="uploadingIndicator">Uploading...</span>
        ) : (
          'Upload to Cloud'
        )}
      </button>

      {status === 'uploading' && (
        <div className="progressContainer">
          <div className="progressBar" />
        </div>
      )}

      {status === 'success' && downloadUrl && (
        <div className="successCard">
          <div className="successHeader">
            <FiCheckCircle className="successIcon" />
            <h3 className="successTitle">Upload Complete!</h3>
          </div>
          <div className="downloadSection">
            <p className="downloadText">Your file is ready to download:</p>
            <div className="urlContainer">
              <input
                type="text"
                value={downloadUrl}
                readOnly
                className="urlInput"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(downloadUrl);
                  alert('Link copied to clipboard!');
                }}
                className="copyButton"
              >
                <FiCopy />
              </button>
            </div>
            <a
              href={downloadUrl}
              download
              className="downloadButton"
            >
              <FiDownload className="downloadIcon" />
              Download Now
            </a>
          </div>
        </div>
      )}

      {status === 'error' && <p className="errorMessage">{error}</p>}

      {error && (
        <div className="errorCard">
          <FiAlertCircle className="errorIcon" />
          <div className="errorContent">
            <h4 className="errorTitle">Upload Error</h4>
            <p className="errorMessage">{error}</p>
          </div>
        </div>
      )}

      <div className="supportedFormats">
        <p className="formatsTitle">Supported Formats:</p>
        <ul className="formatsList">
          {SUPPORTED_FORMATS.map(format => (
            <li key={format} className="formatItem">
              {format.split('/')[1].toUpperCase()}
            </li>
          ))}
        </ul>
      </div>

      <div className="adContainer">
        {isClient && (
          <ins
            style={{ display: "block" }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXX"
            data-ad-slot="1234567890"
            data-ad-format="auto"
            className="adsbygoogle"
          ></ins>
        )}
      </div>

      <style jsx>{`
        .uploader {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
        }

        .fileDropzone {
          position: relative;
          border: 2px dashed var(--border);
          border-radius: var(--radius);
          padding: 2.5rem 1.5rem;
          transition: var(--transition);
        }

        .fileDropzone:hover {
          border-color: var(--primary);
        }

        .fileInput {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .dropzoneLabel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          text-align: center;
        }

        .uploadIcon {
          width: 2.5rem;
          height: 2.5rem;
          color: var(--text-muted);
        }

        .dropzoneText {
          font-size: 1rem;
          color: var(--text);
          font-weight: 500;
        }

        .fileInfo {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .uploadButton {
          width: 100%;
          padding: 1rem;
          background-color: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }

        .uploadButton:hover:not(:disabled) {
          background-color: var(--primary-hover);
        }

        .uploadButton:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .uploadingIndicator {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .progressContainer {
          width: 100%;
          height: 0.375rem;
          background-color: var(--border);
          border-radius: 9999px;
          overflow: hidden;
        }

        .progressBar {
          width: 50%;
          height: 100%;
          background-color: var(--primary);
          border-radius: inherit;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .successCard {
          background-color: var(--success-bg);
          border: 1px solid var(--success);
          border-radius: var(--radius);
          padding: 1.25rem;
        }

        .successHeader {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .successIcon {
          width: 1.5rem;
          height: 1.5rem;
          color: var(--success);
        }

        .successTitle {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text);
        }

        .downloadSection {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .downloadText {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .urlContainer {
          display: flex;
          gap: 0.5rem;
        }

        .urlInput {
          flex: 1;
          padding: 0.625rem;
          font-size: 0.875rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background-color: var(--card-bg);
          color: var(--text);
        }

        .copyButton {
          padding: 0 1rem;
          background-color: var(--border);
          border: none;
          border-radius: var(--radius);
          cursor: pointer;
          transition: var(--transition);
        }

        .copyButton:hover {
          background-color: var(--border-dark);
        }

        .downloadButton {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: color-mix(in srgb, var(--primary) 10%, transparent);
          color: var(--primary);
          border: none;
          border-radius: var(--radius);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }

        .downloadButton:hover {
          background-color: color-mix(in srgb, var(--primary) 20%, transparent);
        }

        .downloadIcon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .errorCard {
          display: flex;
          gap: 0.75rem;
          background-color: var(--error-bg);
          border: 1px solid var(--error);
          border-radius: var(--radius);
          padding: 1rem;
        }

        .errorIcon {
          width: 1.25rem;
          height: 1.25rem;
          color: var(--error);
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .errorContent {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .errorTitle {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
        }

        .errorMessage {
          font-size: 0.875rem;
          color: var(--text);
        }

        .supportedFormats {
          font-size: 0.875rem;
          color: var (--text-muted);
        }

        .formatsTitle {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .formatsList {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 1rem;
          list-style: none;
        }

        .formatItem {
          position: relative;
          padding-left: 1rem;
        }

        .formatItem::before {
          content: '•';
          position: absolute;
          left: 0;
        }

        .adContainer {
          margin-top: 2rem;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 640px) {
          .fileDropzone {
            padding: 1.5rem 1rem;
          }
          
          .dropzoneText {
            font-size: 0.875rem;
          }
          
          .uploadButton {
            padding: 0.875rem;
            font-size: 0.9375rem;
          }
        }
      `}</style>
    </div>
  );
}