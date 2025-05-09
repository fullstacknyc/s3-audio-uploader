"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FiUser,
  FiMail,
  FiLock,
  FiAlertCircle,
  FiCheck,
  FiLoader,
} from "react-icons/fi";
import styles from "./auth.module.css";
import { useAuth } from "@/lib/context/AuthContext";

// Create a loading component for Suspense fallback
function SignupLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.loadingContainer}>
          <FiLoader className={styles.loadingSpinner} />
          <h2>Loading Signup Form...</h2>
        </div>
      </div>
    </div>
  );
}

// Main component that uses search params
function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, isAuthenticated } = useAuth();

  // Get plan from URL if available
  const planParam = searchParams.get("plan");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const [redirectingToStripe, setRedirectingToStripe] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

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
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "Full name is required";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!validate()) return;

    setIsLoading(true);

    try {
      // Use the signup function from useAuth hook
      const result = await signup(
        formData.name,
        formData.email,
        formData.password
      );

      // Store the userId for later use with Stripe checkout
      if (result?.userId) {
        setRegisteredUserId(result.userId);
      }

      // Store email for verification phase
      setVerificationEmail(formData.email);

      // Show verification code input
      setVerificationSent(true);
    } catch (error) {
      console.error("Registration error:", error);
      setGeneralError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError("");

    if (!verificationCode) {
      setVerificationError(
        "Please enter the verification code from your email"
      );
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationEmail,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      // Show success message
      setVerificationSuccess(true);

      // If a plan was selected and we have the user ID, redirect to Stripe checkout
      if (
        planParam &&
        registeredUserId &&
        ["pro", "studio"].includes(planParam)
      ) {
        setRedirectingToStripe(true);

        try {
          // First attempt to login with the new credentials
          const loginResponse = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: verificationEmail,
              password: formData.password,
            }),
          });

          if (!loginResponse.ok) {
            throw new Error("Login failed after email verification");
          }

          // Wait a moment for the session to be fully established
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Now create a payment link
          const paymentLinkResponse = await fetch(
            "/api/stripe/create-payment-link",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ plan: planParam }),
            }
          );

          if (!paymentLinkResponse.ok) {
            throw new Error("Failed to create payment link");
          }

          const paymentLinkData = await paymentLinkResponse.json();

          if (paymentLinkData.success && paymentLinkData.checkoutUrl) {
            // Redirect after a delay
            setTimeout(() => {
              window.location.href = paymentLinkData.checkoutUrl;
            }, 2000);

            return;
          } else {
            throw new Error("No checkout URL received");
          }
        } catch (error) {
          console.error("Error with payment process:", error);
          // Continue with normal login redirect if payment process fails
        }
      }

      // Redirect to login after a delay if not going to Stripe
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationError(
        error instanceof Error
          ? error.message
          : "Verification failed. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setVerificationError("");
    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend code");
      }

      // Show success message
      setVerificationError("Verification code has been resent to your email");
    } catch (error) {
      console.error("Resend code error:", error);
      setVerificationError(
        error instanceof Error
          ? error.message
          : "Failed to resend code. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Final success screen after reset is complete
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
              Your email has been verified successfully.
              {redirectingToStripe
                ? "You'll now be redirected to complete your plan subscription."
                : "You can now log in to your account."}
            </p>
            <p className={styles.successHint}>
              {redirectingToStripe
                ? "Redirecting to checkout page..."
                : "Redirecting to login page..."}
            </p>
            {!redirectingToStripe && (
              <Link href="/login" className={styles.backToLogin}>
                Go to Login
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Initial success screen with reset form
  if (verificationSent) {
    return (
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Verify Your Email</h1>
          <p className={styles.subtitle}>
            {"We've sent a verification code to "}
            <strong>{verificationEmail}</strong>. Please check your email and
            enter the code below.
          </p>

          {verificationError && (
            <div className={styles.errorAlert}>
              <FiAlertCircle />
              <span>{verificationError}</span>
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
            <Link href="/login" className={styles.textLink}>
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Initial signup form
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Create Your Account</h1>
        <p className={styles.subtitle}>
          Join AudioCloud to store and share your audio files securely
          {planParam && ["pro", "studio"].includes(planParam) && (
            <>
              {" "}
              with the {planParam.charAt(0).toUpperCase() +
                planParam.slice(1)}{" "}
              plan
            </>
          )}
        </p>

        {generalError && (
          <div className={styles.errorAlert}>
            <FiAlertCircle />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Full Name
            </label>
            <div className={styles.inputContainer}>
              <FiUser className={styles.inputIcon} />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.name ? styles.inputError : ""
                }`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className={styles.errorText}>{errors.name}</p>}
          </div>

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
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
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

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <div className={styles.inputContainer}>
              <FiLock className={styles.inputIcon} />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.confirmPassword ? styles.inputError : ""
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className={styles.errorText}>{errors.confirmPassword}</p>
            )}
          </div>

          <div className={styles.terms}>
            By creating an account, you agree to our{" "}
            <Link href="/terms" className={styles.termsLink}>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className={styles.termsLink}>
              Privacy Policy
            </Link>
            .
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <p className={styles.switchText}>
          Already have an account?{" "}
          <Link href="/login" className={styles.switchLink}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

// Main component that wraps the content in Suspense
export default function SignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupContent />
    </Suspense>
  );
}
