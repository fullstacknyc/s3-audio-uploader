"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiAlertCircle, FiCheck } from "react-icons/fi";
import styles from "../signup/auth.module.css";

export default function VerifyAccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [step, setStep] = useState<"email" | "verification">("email");

  // Get email from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const emailParam = searchParams.get("email");

    if (emailParam) {
      setEmail(emailParam);
      setStep("verification");
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate email
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      // Request a new verification code
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code");
      }

      // Move to verification step
      setStep("verification");
      setSuccessMessage("A new verification code has been sent to your email");
    } catch (error) {
      console.error("Resend code error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!verificationCode) {
      setErrorMessage("Please enter the verification code");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      // Show success message
      setVerificationSuccess(true);

      // Redirect to login after a delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Verification error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Verification failed. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setErrorMessage("");
    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend code");
      }

      // Show success message
      setSuccessMessage("A new verification code has been sent to your email");
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      console.error("Resend code error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to resend code. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Success state
  if (verificationSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>
              <FiCheck />
            </div>
            <h2 className={styles.successTitle}>Account Verified!</h2>
            <p className={styles.successMessage}>
              Your email has been verified successfully. You can now log in to
              your account.
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

  // Email step form
  if (step === "email") {
    return (
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Verify Your Account</h1>
          <p className={styles.subtitle}>
            Enter your email address to receive a verification code
          </p>

          {errorMessage && (
            <div className={styles.errorAlert}>
              <FiAlertCircle />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className={styles.form}>
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
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <div className={styles.helperLinks}>
            <Link href="/login" className={styles.textLink}>
              Back to login
            </Link>
            <span className={styles.dividerDot}>•</span>
            <Link href="/signup" className={styles.textLink}>
              Create new account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Verification step form
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Verify Your Email</h1>
        <p className={styles.subtitle}>
          {"We've sent a verification code to "}
          <strong>{email}</strong>. Please check your email and enter the code
          below.
        </p>

        {errorMessage && (
          <div className={styles.errorAlert}>
            <FiAlertCircle />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className={styles.successAlert}>
            <FiCheck />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerificationSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="verificationCode" className={styles.label}>
              Verification Code
            </label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className={styles.input}
              placeholder="Enter 6-digit code"
              autoComplete="one-time-code"
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify Account"}
          </button>
        </form>

        <div className={styles.helperLinks}>
          <button
            onClick={handleResendCode}
            className={styles.textLink}
            disabled={isVerifying}
          >
            Resend verification code
          </button>
          <span className={styles.dividerDot}>•</span>
          <button onClick={() => setStep("email")} className={styles.textLink}>
            Change email
          </button>
          <span className={styles.dividerDot}>•</span>
          <Link href="/login" className={styles.textLink}>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
