"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import styles from "../signup/auth.module.css";
import { useAuth } from "@/lib/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Reset verification state and general error when changing inputs
    if (needsVerification) {
      setNeedsVerification(false);
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setNeedsVerification(false);

    if (!validate()) return;

    setIsLoading(true);

    try {
      // Use the login function from useAuth hook
      await login(formData.email, formData.password);

      // If login is successful, redirect to dashboard
      window.location.href = "/dashboard"; // Use window.location for a full page refresh
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Login error:", error);

      // Check if this is an unverified user error
      if (
        error.message?.includes("UserNotConfirmedException") ||
        error.message?.includes("not been verified")
      ) {
        setNeedsVerification(true);
        setGeneralError(
          "Your account has not been verified. Please check your email for a verification code or request a new one."
        );
      } else {
        setGeneralError(
          error instanceof Error
            ? error.message
            : "An error occurred. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setErrors({ email: "Email is required to resend verification code" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification code");
      }

      // Redirect to verification page with email
      router.push(
        `/verify-account?email=${encodeURIComponent(formData.email)}`
      );
    } catch (error) {
      console.error("Resend verification error:", error);
      setGeneralError(
        error instanceof Error
          ? error.message
          : "Failed to resend verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>
          Sign in to access your AudioCloud account
        </p>

        {generalError && (
          <div className={styles.errorAlert}>
            <FiAlertCircle />
            <span>{generalError}</span>

            {needsVerification && (
              <button
                onClick={handleResendVerification}
                className={styles.verificationButton}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Verify Now"}
              </button>
            )}
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.email ? styles.inputError : ""
                }`}
                placeholder="your@email.com"
              />
            </div>
            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <Link href="/forgot-password" className={styles.forgotPassword}>
                Forgot Password?
              </Link>
            </div>
            <div className={styles.inputContainer}>
              <FiLock className={styles.inputIcon} />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.password ? styles.inputError : ""
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className={styles.errorText}>{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <p className={styles.switchText}>
          {"Don't have an account? "}
          <Link href="/signup" className={styles.switchLink}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
