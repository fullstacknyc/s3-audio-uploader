"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiDownload,
  FiAlertCircle,
  FiFile,
  FiClock,
  FiInfo,
  FiMusic,
} from "react-icons/fi";
import styles from "./download.module.css";
import {
  formatBytes,
  formatDate,
  formatDateTime,
  getDaysUntil,
} from "@/lib/utils/formatUtils";

interface ShortlinkData {
  shortCode: string;
  originalUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  expiresAt?: string;
}

export default function DownloadPage() {
  const { code } = useParams();
  const [data, setData] = useState<ShortlinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShortlinkData() {
      try {
        const response = await fetch(`/api/shortlink/${code}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch shortlink data");
        }

        const shortlinkData = await response.json();
        setData(shortlinkData);
      } catch (err) {
        console.error("Error fetching shortlink:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (code) {
      fetchShortlinkData();
    }
  }, [code]);

  const handleDownload = () => {
    if (data?.originalUrl) {
      window.location.href = data.originalUrl;
    }
  };

  // Utility functions are now imported from formatUtils

  // Calculate days until expiration
  const daysUntilExpiration = data?.expiresAt
    ? getDaysUntil(data.expiresAt)
    : null;

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("audio")) {
      return <FiMusic size={48} className={styles.fileTypeIcon} />;
    }
    return <FiFile size={48} className={styles.fileTypeIcon} />;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading file information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            <FiAlertCircle size={48} />
          </div>
          <h1 className={styles.errorTitle}>File Unavailable</h1>
          <p className={styles.errorMessage}>{error}</p>
          <Link href="/" className={styles.homeButton}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            <FiAlertCircle size={48} />
          </div>
          <h1 className={styles.errorTitle}>File Not Found</h1>
          <p className={styles.errorMessage}>
            {"The file you're looking for doesn't exist or has been removed."}
          </p>
          <Link href="/" className={styles.homeButton}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.downloadCard}>
        <div className={styles.fileInfo}>
          <div className={styles.fileIconContainer}>
            {getFileIcon(data.fileType)}
          </div>
          <div className={styles.fileDetails}>
            <h1 className={styles.fileName}>{data.fileName}</h1>
            <div className={styles.fileMetadata}>
              <span className={styles.fileType}>
                {data.fileType.split("/")[1].toUpperCase()}
              </span>
              <span className={styles.fileSize}>
                {formatBytes(data.fileSize)}
              </span>
            </div>
          </div>
        </div>

        <button onClick={handleDownload} className={styles.downloadButton}>
          <FiDownload className={styles.downloadIcon} />
          <span>Download File</span>
        </button>

        <div className={styles.infoSection}>
          <div className={styles.infoItem}>
            <FiClock className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <h3 className={styles.infoTitle}>Uploaded</h3>
              <p className={styles.infoValue}>{formatDate(data.createdAt)}</p>
            </div>
          </div>

          {data.expiresAt && (
            <div className={styles.infoItem}>
              <FiInfo className={styles.infoIcon} />
              <div className={styles.infoContent}>
                <h3 className={styles.infoTitle}>Availability</h3>
                <p className={styles.infoValue}>
                  {daysUntilExpiration && daysUntilExpiration > 0
                    ? `Expires in ${daysUntilExpiration} days`
                    : "Expires soon"}
                  <br />
                  <span className={styles.expirationDate}>
                    Available until: {formatDateTime(data.expiresAt)}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.footerLinks}>
        <Link href="/" className={styles.footerLink}>
          Home
        </Link>
        <span className={styles.divider}>•</span>
        <Link href="/privacy" className={styles.footerLink}>
          Privacy Policy
        </Link>
        <span className={styles.divider}>•</span>
        <Link href="/terms" className={styles.footerLink}>
          Terms of Service
        </Link>
      </div>
    </div>
  );
}
