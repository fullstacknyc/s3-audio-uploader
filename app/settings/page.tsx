"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiLock,
  FiMail,
  FiCreditCard,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import styles from "./settings.module.css";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formStatus, setFormStatus] = useState({
    success: false,
    error: false,
    message: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Set initial form values when user data is available
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Handle profile form input changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle password form input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset form status
    setFormStatus({
      success: false,
      error: false,
      message: "",
    });

    try {
      // In a real app, you would update the user's profile via an API call here
      // For now, we'll just simulate success

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message
      setFormStatus({
        success: true,
        error: false,
        message: "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      setFormStatus({
        success: false,
        error: true,
        message: "Failed to update profile. Please try again.",
      });
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset form status
    setFormStatus({
      success: false,
      error: false,
      message: "",
    });

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFormStatus({
        success: false,
        error: true,
        message: "New passwords do not match.",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setFormStatus({
        success: false,
        error: true,
        message: "New password must be at least 8 characters long.",
      });
      return;
    }

    try {
      // In a real app, you would update the user's password via an API call here
      // For now, we'll just simulate success

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset password form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Show success message
      setFormStatus({
        success: true,
        error: false,
        message: "Password updated successfully!",
      });
    } catch (error) {
      console.error("Password update error:", error);
      setFormStatus({
        success: false,
        error: true,
        message: "Failed to update password. Please try again.",
      });
    }
  };

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
      <div className={styles.settingsHeader}>
        <h1 className={styles.settingsTitle}>Account Settings</h1>
        <p className={styles.settingsSubtitle}>
          Manage your account preferences and information
        </p>
      </div>

      <div className={styles.settingsContent}>
        <div className={styles.settingsTabs}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "profile" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <FiUser className={styles.tabIcon} />
            <span>Profile</span>
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "security" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("security")}
          >
            <FiLock className={styles.tabIcon} />
            <span>Security</span>
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "notifications" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            <FiMail className={styles.tabIcon} />
            <span>Notifications</span>
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "billing" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("billing")}
          >
            <FiCreditCard className={styles.tabIcon} />
            <span>Billing</span>
          </button>
        </div>

        <div className={styles.settingsPanel}>
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className={styles.panelContent}>
              <h2 className={styles.panelTitle}>Profile Information</h2>

              {formStatus.success && (
                <div className={styles.successAlert}>
                  <FiCheckCircle className={styles.alertIcon} />
                  <span>{formStatus.message}</span>
                </div>
              )}

              {formStatus.error && (
                <div className={styles.errorAlert}>
                  <FiAlertCircle className={styles.alertIcon} />
                  <span>{formStatus.message}</span>
                </div>
              )}

              <form
                onSubmit={handleProfileSubmit}
                className={styles.settingsForm}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className={styles.formInput}
                    placeholder="Your full name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className={styles.formInput}
                    placeholder="Your email address"
                    disabled
                  />
                  <p className={styles.formHelp}>
                    Email address cannot be changed. Contact support if you need
                    to update your email.
                  </p>
                </div>

                <button type="submit" className={styles.submitButton}>
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className={styles.panelContent}>
              <h2 className={styles.panelTitle}>Security Settings</h2>

              {formStatus.success && (
                <div className={styles.successAlert}>
                  <FiCheckCircle className={styles.alertIcon} />
                  <span>{formStatus.message}</span>
                </div>
              )}

              {formStatus.error && (
                <div className={styles.errorAlert}>
                  <FiAlertCircle className={styles.alertIcon} />
                  <span>{formStatus.message}</span>
                </div>
              )}

              <h3 className={styles.sectionTitle}>Change Password</h3>
              <form
                onSubmit={handlePasswordSubmit}
                className={styles.settingsForm}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="currentPassword" className={styles.formLabel}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className={styles.formInput}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="newPassword" className={styles.formLabel}>
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className={styles.formInput}
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.formLabel}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className={styles.formInput}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <button type="submit" className={styles.submitButton}>
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className={styles.panelContent}>
              <h2 className={styles.panelTitle}>Notification Preferences</h2>
              <p className={styles.comingSoon}>
                Notification settings will be available soon.
              </p>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className={styles.panelContent}>
              <h2 className={styles.panelTitle}>Billing Information</h2>

              <div className={styles.billingInfo}>
                <div className={styles.currentPlan}>
                  <h3 className={styles.sectionTitle}>Current Plan</h3>
                  <div className={styles.planCard}>
                    <div className={styles.planHeader}>
                      <span className={styles.planName}>
                        {user.tier === "free"
                          ? "Free Plan"
                          : user.tier === "pro"
                          ? "Pro Plan"
                          : "Studio Plan"}
                      </span>
                      {user.tier !== "free" && (
                        <span className={styles.planPrice}>
                          {user.tier === "pro" ? "$12.99" : "$29.99"}/month
                        </span>
                      )}
                    </div>
                    <div className={styles.planFeatures}>
                      <p>
                        {user.tier === "free"
                          ? "5GB storage"
                          : user.tier === "pro"
                          ? "100GB storage"
                          : "1TB storage"}
                      </p>
                    </div>
                    {user.tier === "free" ? (
                      <Link
                        href="/paid-plans"
                        className={styles.upgradePlanButton}
                      >
                        Upgrade Plan
                      </Link>
                    ) : (
                      <button className={styles.managePlanButton}>
                        Manage Subscription
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
