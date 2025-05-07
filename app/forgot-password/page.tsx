"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiAlertCircle, FiCheckCircle, FiLock } from "react-icons/fi";
import styles from "../signup/auth.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Reset code form
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error state
    setErrorMessage("");
    setSuccessMessage("");

    // Validate email
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code");
      }

      // Show success message
      setResetSent(true);
      setSuccessMessage(
        data.message ||
          "Verification code sent to your email. Please check your inbox for an email with the subject 'Verification Code'."
      );

      // Show the reset form after a brief delay
      setTimeout(() => {
        setShowResetForm(true);
      }, 2000);
    } catch (error) {
      console.error("Verification code request error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    // Validate inputs
    if (!resetCode) {
      setResetError("Please enter the verification code from your email");
      return;
    }

    if (!newPassword) {
      setResetError("Please enter your new password");
      return;
    }

    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match");
      return;
    }

    setIsResetting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: resetCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      // Show success message
      setResetSuccess(true);
      setSuccessMessage(data.message || "Password reset successful!");

      // Redirect to login after a delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);
      setResetError(
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again."
      );
    } finally {
      setIsResetting(false);
    }
  };

  // Final success screen after reset is complete
  if (resetSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>
              <FiCheckCircle />
            </div>
            <h2 className={styles.successTitle}>Password Reset Successful!</h2>
            <p className={styles.successMessage}>
              Your password has been reset successfully. You can now log in with
              your new password.
            </p>
            <p className={styles.successHint}>Redirecting to login page...</p>
            <Link href="/login" className={styles.backToLogin}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Initial success screen with reset form
  if (resetSent) {
    return (
      <div className={styles.container}>
        <div className={styles.formContainer}>
          {!showResetForm ? (
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>
                <FiCheckCircle />
              </div>
              <h2 className={styles.successTitle}>Check Your Email</h2>
              <p className={styles.successMessage}>
                {successMessage ||
                  `We've sent a verification code to ${email}. Please check your inbox (and spam folder) for an email with the subject "Verification Code".`}
              </p>
              <button
                className={styles.resendButton}
                onClick={() => setShowResetForm(true)}
              >
                Enter Verification Code
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => {
                  setResetSent(false);
                  setShowResetForm(false);
                  setEmail("");
                  setSuccessMessage("");
                }}
              >
                Try a Different Email
              </button>
              <Link href="/login" className={styles.backToLogin}>
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className={styles.title}>Reset Your Password</h1>
              <p className={styles.subtitle}>
                Enter the verification code from your email and choose a new
                password
              </p>

              {resetError && (
                <div className={styles.errorAlert}>
                  <FiAlertCircle />
                  <span>{resetError}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="resetCode" className={styles.label}>
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="resetCode"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className={styles.input}
                    placeholder="Enter code from your email"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="newPassword" className={styles.label}>
                    New Password
                  </label>
                  <div className={styles.inputContainer}>
                    <FiLock className={styles.inputIcon} />
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={styles.input}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Confirm Password
                  </label>
                  <div className={styles.inputContainer}>
                    <FiLock className={styles.inputIcon} />
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={styles.input}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isResetting}
                >
                  {isResetting ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <div className={styles.helperLinks}>
                <button
                  onClick={handleSubmit}
                  className={styles.textLink}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Resend verification code"}
                </button>
                <span className={styles.dividerDot}>•</span>
                <button
                  onClick={() => {
                    setResetSent(false);
                    setShowResetForm(false);
                    setSuccessMessage("");
                    setEmail("");
                  }}
                  className={styles.textLink}
                >
                  Try a different email
                </button>
                <span className={styles.dividerDot}>•</span>
                <Link href="/login" className={styles.textLink}>
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Initial form to request password reset
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Reset Your Password</h1>
        <p className={styles.subtitle}>
          {
            "Enter your email address and we'll send you a verification code to reset your password"
          }
        </p>

        {errorMessage && (
          <div className={styles.errorAlert}>
            <FiAlertCircle />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className={styles.successAlert}>
            <FiCheckCircle />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <div className={styles.inputContainer}>
              <FiMail className={styles.inputIcon} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Verification Code"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <p className={styles.switchText}>
          <Link href="/login" className={styles.switchLink}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
