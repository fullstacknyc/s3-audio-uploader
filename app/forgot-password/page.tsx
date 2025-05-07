"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import styles from "../signup/auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error state
    setErrorMessage("");

    // Validate email
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, you would make an API call to send a password reset email
      // For now, we'll just simulate a successful request

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message
      setResetSent(true);
    } catch (error) {
      console.error("Password reset error:", error);
      setErrorMessage("Failed to send password reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (resetSent) {
    return (
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>
              <FiCheckCircle />
            </div>
            <h2 className={styles.successTitle}>Check Your Email</h2>
            <p className={styles.successMessage}>
              {"If an account exists for "}
              <strong>{email}</strong>
              {
                ", we've sent a link to reset your password. Please check your email and follow the instructions."
              }
            </p>
            <p className={styles.successHint}>
              {
                "If you don't see the email, check your spam folder or click the button below to try again."
              }
            </p>
            <button
              className={styles.resendButton}
              onClick={() => setResetSent(false)}
            >
              Try Again
            </button>
            <Link href="/login" className={styles.backToLogin}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Reset Your Password</h1>
        <p className={styles.subtitle}>
          {
            "Enter your email address and we'll send you a link to reset your password"
          }
        </p>

        {errorMessage && (
          <div className={styles.errorAlert}>
            <FiAlertCircle />
            <span>{errorMessage}</span>
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
            {isSubmitting ? "Sending..." : "Reset Password"}
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
