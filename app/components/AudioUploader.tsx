"use client";

import { useState, useCallback } from "react";
import styles from "./AudioUploader.module.css";
import {
  MAX_FILE_SIZE,
  SUPPORTED_AUDIO_FORMATS,
  AUDIO_FORMAT_LABELS,
} from "@/lib/constants/plans";
import { formatBytes } from "@/lib/utils/formatUtils";
import { getSupportedFormatLabels } from "@/lib/utils/audioFormatUtils";
import AdUnit from "./Ads/AdUnit";
import { useAds } from "@/lib/context/AdContext";

import {
  FiUpload,
  FiCheckCircle,
  FiAlertCircle,
  FiCopy,
  FiDownload,
  FiLoader,
} from "react-icons/fi";

export default function AudioUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [, setRetryCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { publisherId, isAdBlockEnabled } = useAds();
  const showAds = !!publisherId && !isAdBlockEnabled;

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
      setRetryCount(0);
    },
    []
  );

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setError("");
    setUploadProgress(0);

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

      // Then upload the file directly to S3 with XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener("error", () => {
        throw new Error("Upload to storage failed: Network error");
      });

      xhr.addEventListener("abort", () => {
        throw new Error("Upload was aborted");
      });

      // Wait for the request to complete
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          }
        };
      });

      // Open and send the request
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);

      // Wait for upload to complete
      await uploadPromise;

      // Create a shortlink
      const shortlinkResponse = await fetch("/api/shortlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: downloadUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          storageKey: storageKey,
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
      // Use a functional update to get the latest retry count
      setRetryCount((currentRetryCount) => {
        // Check if we should retry
        if (currentRetryCount < 3) {
          // Schedule retry with the latest retry count
          setTimeout(() => {
            handleUpload(); // Retry upload with delay
          }, 1000);
          // Return incremented count
          return currentRetryCount + 1;
        }
        // If we've reached max retries, just return the current count
        return currentRetryCount;
      });
    }
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
          <span className={styles.uploadingIndicator}>
            <FiLoader className={styles.spinnerIcon} />
            {uploadProgress > 0
              ? `Uploading... ${uploadProgress}%`
              : "Uploading..."}
          </span>
        ) : (
          "Upload to Cloud"
        )}
      </button>

      {status === "uploading" && (
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {status === "success" && shortUrl && (
        <div className={styles.successCard}>
          <div className={styles.successHeader}>
            <FiCheckCircle className={styles.successIcon} />
            <h3 className={styles.successTitle}>Upload Complete!</h3>
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
              >
                <FiCopy />
              </button>
            </div>
            <button onClick={handleDownload} className={styles.downloadButton}>
              <FiDownload className={styles.downloadIcon} />
              Download Now
            </button>
          </div>

          {/* Display ad after successful upload */}
          {showAds && (
            <div className={styles.successAd}>
              <AdUnit
                adSlot={process.env.NEXT_PUBLIC_ADSENSE_MEDIUM_RECTANGLE_SLOT || ""}
                size="medium-rectangle"
              />
            </div>
          )}
        </div>
      )}

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

      {/* Display ad at the bottom of uploader */}
      {showAds && status !== "success" && (
        <div className={styles.uploaderBottomAd}>
          <AdUnit
            adSlot={process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT || ""}
            size="banner"
          />
        </div>
      )}
    </div>
  );
}
