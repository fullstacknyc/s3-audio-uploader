import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiDownload } from 'react-icons/fi';

export default function DownloadPage() {
  const router = useRouter();
  const { fileUrl } = router.query;
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    if (fileUrl) {
      setDownloadUrl(fileUrl as string);
    }
  }, [fileUrl]);

  if (!downloadUrl) {
    return <div>Loading...</div>;
  }

  return (
    <div className="download-page">
      <h1>Your Download is Ready!</h1>
      <p>Thank you for using our service. Your file is ready to be downloaded.</p>
      <a href={downloadUrl} download className="download-button">
        <FiDownload className="download-icon" />
        Download Now
      </a>
      <style jsx>{`
        .download-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          padding: 0 2rem;
        }
        .download-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          text-decoration: none;
        }
        .download-button:hover {
          background-color: var(--primary-hover);
        }
        .download-icon {
          width: 1.25rem;
          height: 1.25rem;
        }
      `}</style>
    </div>
  );
}
