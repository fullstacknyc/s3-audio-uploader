"use client";
import { useState, useCallback, useEffect } from "react";
import styles from "./AudioUploader.module.css";
import {
  MAX_FILE_SIZE,
  SUPPORTED_AUDIO_FORMATS,
  AUDIO_FORMAT_LABELS,
} from "@/lib/constants/plans";
import { formatBytes } from "@/lib/utils/formatUtils";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}
import {
  FiUpload,
  FiCheckCircle,
  FiAlertCircle,
  FiCopy,
  FiDownload,
} from "react-icons/fi";
import { getSupportedFormatLabels } from "@/lib/utils/audioFormatUtils";

export default function AudioUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [adCompleted, setAdCompleted] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setError("");
      if (!SUPPORTED_AUDIO_FORMATS.includes(selectedFile.type)) {
        setError(
          `Unsupported format. We accept: ${getSupportedFormatLabels().join(
            ", "
          )}`
        );
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(
          `File too large (${formatBytes(
            selectedFile.size
          )}). Max ${formatBytes(MAX_FILE_SIZE)} allowed.`
        );
        return;
      }
      setFile(selectedFile);
    },
    []
  );

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setError("");

    try {
      // First get the presigned URL
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          filetype: file.type,
          filesize: file.size,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const { uploadUrl, downloadUrl, storageKey } = await res.json();

      // Then upload the file directly to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload to storage failed");
      }

      // Create a shortlink
      const shortlinkResponse = await fetch("/api/shortlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: downloadUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          storageKey: storageKey, // Pass the storage key for future deletion
        }),
      });

      if (!shortlinkResponse.ok) {
        const errorData = await shortlinkResponse.json();
        throw new Error(errorData.error || "Failed to create shortlink");
      }

      const shortlinkData = await shortlinkResponse.json();
      setShortUrl(shortlinkData.shortUrl);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
      if (retryCount < 3) {
        setRetryCount((prev) => prev + 1);
        handleUpload(); // Retry upload
      }
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined" && window.adsbygoogle) {
      const adElements = document.querySelectorAll(".adsbygoogle");
      adElements.forEach((adElement) => {
        if (!adElement.hasAttribute("data-adsbygoogle-status")) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      });
    }
  }, []);

  const handleAdInteraction = () => {
    // Simulate ad interaction completion
    setAdCompleted(true);
    // Track ad interaction for analytics
    console.log("Ad interaction completed");
  };

  const handleDownload = () => {
    if (shortUrl) {
      window.open(shortUrl, "_blank");
    }
  };

  return (
    <div className={styles.uploader}>
      <div className={styles.fileDropzone}>
        <input
          type="file"
          accept={SUPPORTED_AUDIO_FORMATS.join(",")}
          onChange={handleFileChange}
          className={styles.fileInput}
          id="audio-upload"
        />
        <label htmlFor="audio-upload" className={styles.dropzoneLabel}>
          <FiUpload className={styles.uploadIcon} />
          <p className={styles.dropzoneText}>
            {file
              ? file.name
              : "Drag & drop your audio file or click to browse"}
          </p>
          {file && (
            <p className={styles.fileInfo}>
              {AUDIO_FORMAT_LABELS[file.type] ||
                file.type.split("/")[1].toUpperCase()}{" "}
              • {formatBytes(file.size)}
            </p>
          )}
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || status === "uploading"}
        className={styles.uploadButton}
      >
        {status === "uploading" ? (
          <span className={styles.uploadingIndicator}>Uploading...</span>
        ) : (
          "Upload to Cloud"
        )}
      </button>

      {status === "uploading" && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar} />
        </div>
      )}

      {status === "success" && shortUrl && (
        <div className={styles.successCard}>
          <div className={styles.successHeader}>
            <FiCheckCircle className={styles.successIcon} />
            <h3 className={styles.successTitle}>Upload Complete!</h3>
          </div>
          <div className={styles.adSection}>
            <p className={styles.adPrompt}>
              Please interact with the ad below to unlock your download link:
            </p>
            <div className="adContainer">
              {isClient && (
                <ins
                  style={{ display: "block" }}
                  data-ad-client="ca-pub-XXXXXXXXXXXXXXX"
                  data-ad-slot="1234567890"
                  data-ad-format="auto"
                  className="adsbygoogle"
                  onClick={handleAdInteraction}
                ></ins>
              )}
            </div>
          </div>
          <div className={styles.downloadSection}>
            <p className={styles.downloadText}>
              Your file is ready to download:
            </p>
            <div className={styles.urlContainer}>
              <input
                type="text"
                value={shortUrl}
                readOnly
                className={styles.urlInput}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shortUrl);
                  alert("Link copied to clipboard!");
                }}
                className={styles.copyButton}
                disabled={!adCompleted}
              >
                <FiCopy />
              </button>
            </div>
            <button onClick={handleDownload} className={styles.downloadButton}>
              <FiDownload className={styles.downloadIcon} />
              Download Now
            </button>
          </div>
        </div>
      )}

      {status === "error" && <p className={styles.errorMessage}>{error}</p>}

      {error && (
        <div className={styles.errorCard}>
          <FiAlertCircle className={styles.errorIcon} />
          <div className={styles.errorContent}>
            <h4 className={styles.errorTitle}>Upload Error</h4>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        </div>
      )}

      <div className={styles.supportedFormats}>
        <p className={styles.formatsTitle}>Supported Formats:</p>
        <ul className={styles.formatsList}>
          {getSupportedFormatLabels().map((format) => (
            <li key={format} className={styles.formatItem}>
              {format}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.adContainer}>
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
    </div>
  );
}
