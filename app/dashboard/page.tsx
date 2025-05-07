"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiHardDrive, FiUpload, FiShare2, FiActivity } from "react-icons/fi";
import styles from "./dashboard.module.css";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Only render if authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Dashboard</h1>
        <p className={styles.welcomeMessage}>
          Welcome back, <span className={styles.userName}>{user.name}</span>
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconContainer}>
            <FiHardDrive className={styles.statIcon} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Storage Used</h3>
            <p className={styles.statValue}>0 MB</p>
            <div className={styles.progressContainer}>
              <div className={styles.progressBar} style={{ width: "0%" }}></div>
            </div>
            <p className={styles.statCaption}>
              0% of{" "}
              {user.tier === "free"
                ? "5 GB"
                : user.tier === "pro"
                ? "100 GB"
                : "1 TB"}
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
              {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
            </p>
            {user.tier === "free" && (
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
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>
            {"You haven't uploaded any files yet."}
          </p>
          <Link href="/#upload-section" className={styles.emptyStateButton}>
            Upload Your First File
          </Link>
        </div>
      </div>
    </div>
  );
}
