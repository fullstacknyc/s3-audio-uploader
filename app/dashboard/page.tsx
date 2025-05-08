"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiHardDrive,
  FiUpload,
  FiShare2,
  FiActivity,
  FiMusic,
  FiFile,
  FiDownload,
  FiClock,
  FiAlertCircle,
  FiTrash2,
} from "react-icons/fi";
import styles from "./dashboard.module.css";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import { formatBytes } from "@/lib/constants/plans";
import type { PlanTier } from "@/lib/constants/plans";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";

interface File {
  id: string;
  shortCode: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  downloadCount: number;
}

interface DashboardData {
  user: {
    id: string;
    email: string;
    name: string;
    tier: PlanTier;
  };
  storage: {
    used: number;
    limit: number;
    percentage: number;
  };
  recentFiles: File[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // File deletion state
  const [fileToDelete, setFileToDelete] = useState<File | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch dashboard data when component mounts
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/dashboard");

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized, redirect to login
          router.push("/login");
          return;
        }

        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening the delete confirmation dialog
  const handleDeleteClick = (file: File) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
    setDeleteError(null);
  };

  // Handle confirming file deletion
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      setIsDeletingFile(true);
      setDeleteError(null);

      const response = await fetch("/api/files/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shortCode: fileToDelete.shortCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete file");
      }

      // Show success state briefly
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
        // Close the dialog
        setIsDeleteDialogOpen(false);
        setFileToDelete(null);

        // Refresh the dashboard data to update file list and storage usage
        fetchDashboardData();
      }, 1500);
    } catch (err) {
      console.error("File deletion error:", err);
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete file"
      );
    } finally {
      setIsDeletingFile(false);
    }
  };

  // Format date to human-readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("audio")) {
      return <FiMusic className={styles.fileIcon} />;
    }
    return <FiFile className={styles.fileIcon} />;
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <FiAlertCircle className={styles.errorIcon} />
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Only render if authenticated and data is loaded
  if (!isAuthenticated || !user) {
    return null;
  }

  // Get user's tier (fallback to data from auth context if API data is not available)
  const userTier = (dashboardData?.user?.tier || user.tier) as PlanTier;

  return (
    <div className={styles.container}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Dashboard</h1>
        <p className={styles.welcomeMessage}>
          {"Welcome back, "}
          <span className={styles.userName}>
            {dashboardData?.user?.name || user.name}
          </span>
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconContainer}>
            <FiHardDrive className={styles.statIcon} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Storage Used</h3>
            <p className={styles.statValue}>
              {dashboardData?.storage
                ? formatBytes(dashboardData.storage.used)
                : "0 MB"}
            </p>
            <div className={styles.progressContainer}>
              <div
                className={styles.progressBar}
                style={{
                  width: `${dashboardData?.storage?.percentage || 0}%`,
                }}
              ></div>
            </div>
            <p className={styles.statCaption}>
              {dashboardData?.storage
                ? `${Math.round(
                    dashboardData.storage.percentage
                  )}% of ${formatBytes(dashboardData.storage.limit)}`
                : `0% of ${formatBytes(dashboardData?.storage?.limit || 0)}`}
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconContainer}>
            <FiActivity className={styles.statIcon} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Account Status</h3>
            <p className={styles.statValue}>
              {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
            </p>
            {userTier === "free" && (
              <Link href="/paid-plans" className={styles.upgradeButton}>
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className={styles.actionsSection}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Link href="/#upload-section" className={styles.actionCard}>
            <div className={styles.actionIconContainer}>
              <FiUpload className={styles.actionIcon} />
            </div>
            <h3 className={styles.actionTitle}>Upload Audio</h3>
            <p className={styles.actionDescription}>
              Upload your audio files securely to your cloud storage
            </p>
          </Link>

          <div className={styles.actionCard}>
            <div className={styles.actionIconContainer}>
              <FiShare2 className={styles.actionIcon} />
            </div>
            <h3 className={styles.actionTitle}>Share Files</h3>
            <p className={styles.actionDescription}>
              Create secure links to share your audio files with others
            </p>
          </div>
        </div>
      </div>

      <div className={styles.recentFilesSection}>
        <h2 className={styles.sectionTitle}>Recent Files</h2>

        {dashboardData?.recentFiles && dashboardData.recentFiles.length > 0 ? (
          <div className={styles.filesList}>
            {dashboardData.recentFiles.map((file) => (
              <div key={file.id} className={styles.fileCard}>
                <div className={styles.fileIconContainer}>
                  {getFileIcon(file.fileType)}
                </div>
                <div className={styles.fileInfo}>
                  <h3 className={styles.fileName}>{file.fileName}</h3>
                  <div className={styles.fileDetails}>
                    <span className={styles.fileType}>{file.fileType}</span>
                    <span className={styles.fileSize}>
                      {formatBytes(file.fileSize)}
                    </span>
                    <span className={styles.fileDate}>
                      <FiClock className={styles.detailIcon} />
                      {formatDate(file.createdAt)}
                    </span>
                    <span className={styles.downloadCount}>
                      <FiDownload className={styles.detailIcon} />
                      {file.downloadCount}{" "}
                      {file.downloadCount === 1 ? "download" : "downloads"}
                    </span>
                  </div>
                </div>
                <div className={styles.fileActions}>
                  <Link
                    href={`/d/${file.shortCode}`}
                    target="_blank"
                    className={styles.fileActionButton}
                  >
                    <FiDownload />
                    <span>Download</span>
                  </Link>
                  <button
                    className={styles.fileActionButton}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/d/${file.shortCode}`
                      );
                      alert("Download link copied to clipboard!");
                    }}
                  >
                    <FiShare2 />
                    <span>Share</span>
                  </button>
                  <button
                    className={`${styles.fileActionButton} ${styles.deleteButton}`}
                    onClick={() => handleDeleteClick(file)}
                  >
                    <FiTrash2 />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>
              {"You haven't uploaded any files yet."}
            </p>
            <Link href="/#upload-section" className={styles.emptyStateButton}>
              Upload Your First File
            </Link>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for File Deletion */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title={deleteSuccess ? "File Deleted" : "Delete File?"}
        message={
          deleteSuccess
            ? "The file has been deleted successfully."
            : deleteError
            ? `Error: ${deleteError}`
            : `Are you sure you want to delete "${fileToDelete?.fileName}"? This action cannot be undone.`
        }
        confirmButtonText={deleteSuccess ? "Close" : "Delete File"}
        cancelButtonText="Cancel"
        onConfirm={
          deleteSuccess
            ? () => setIsDeleteDialogOpen(false)
            : handleConfirmDelete
        }
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={isDeletingFile}
      />
    </div>
  );
}
