"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FiCheckCircle,
  FiArrowRight,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import Link from "next/link";
import styles from "./payment-success.module.css";
import { useAuth } from "@/lib/context/AuthContext";
import { PLAN_FEATURES } from "@/lib/constants/plans";

interface VerificationResponse {
  success: boolean;
  verified: boolean;
  message: string;
  tier?: string;
  subscriptionId?: string;
  customerPortalUrl?: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refreshAuthState } = useAuth();

  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<VerificationResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  // Redirect if no auth
  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Poll the verification endpoint until subscription is confirmed
  useEffect(() => {
    const planParam = searchParams.get("plan");
    const sessionId = searchParams.get("session_id");

    if (!planParam || !sessionId) {
      setError("Missing plan or session information");
      setLoading(false);
      return;
    }

    setPlan(planParam);

    const pollVerification = async () => {
      try {
        // Build the verification URL with proper parameters
        const verificationUrl = `/api/verify-subscription?plan=${encodeURIComponent(
          planParam
        )}&session_id=${encodeURIComponent(sessionId)}`;

        const response = await fetch(verificationUrl);
        if (!response.ok) {
          throw new Error(`Verification request failed: ${response.status}`);
        }

        const data = (await response.json()) as VerificationResponse;
        setVerification(data);

        if (data.success) {
          if (data.verified) {
            // Subscription is verified - update auth state to reflect new tier
            await refreshAuthState();
            setLoading(false);
          } else if (pollCount < 5) {
            // Not verified yet, but we haven't reached max poll attempts
            // Wait and try again (exponential backoff)
            const delay = Math.pow(2, pollCount) * 1000; // 1s, 2s, 4s, 8s, 16s
            setTimeout(() => {
              setPollCount((count) => count + 1);
            }, delay);
          } else {
            // Reached max poll attempts
            setLoading(false);
            // Still show success even if verification polling times out
            // The webhook will eventually update the tier
          }
        } else {
          throw new Error(data.message || "Verification failed");
        }
      } catch (err) {
        console.error("Error verifying subscription:", err);
        setError(
          err instanceof Error ? err.message : "Error verifying subscription"
        );
        setLoading(false);
      }
    };

    if (planParam && sessionId && pollCount < 6) {
      pollVerification();
    }
  }, [searchParams, pollCount, refreshAuthState]);

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <div className={styles.iconContainer}>
            <FiAlertCircle className={styles.errorIcon} />
          </div>
          <h1>Subscription Verification Error</h1>
          <p className={styles.message}>{error}</p>
          <p className={styles.subMessage}>
            Don’t worry - if your payment was successful, your account will be
            upgraded shortly. You can check your account settings or contact
            support if you need assistance.
          </p>
          <div className={styles.buttons}>
            <Link href="/dashboard" className={styles.primaryButton}>
              Go to Dashboard <FiArrowRight />
            </Link>
            <Link href="/contact" className={styles.secondaryButton}>
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingSpinner}>
            <FiLoader className={styles.spinnerIcon} />
          </div>
          <h1>Confirming Your Subscription</h1>
          <p className={styles.message}>
            {"We're processing your "}
            {plan && plan.charAt(0).toUpperCase() + plan.slice(1)} plan
            subscription. This should only take a few moments...
          </p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min((pollCount / 5) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Format plan name for display
  const planName = plan
    ? plan.charAt(0).toUpperCase() + plan.slice(1)
    : "Premium";

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.iconContainer}>
          <FiCheckCircle className={styles.successIcon} />
        </div>

        <h1>Welcome to AudioCloud {planName}!</h1>

        <p className={styles.message}>
          {verification?.verified
            ? `Your subscription has been successfully activated. You now have access to all the ${planName} features and benefits.`
            : `Your payment has been processed. Your account is being upgraded to ${planName} and will be fully activated shortly.`}
        </p>

        <div className={styles.planDetails}>
          <div className={styles.planDetail}>
            <span className={styles.detailLabel}>Account</span>
            <span className={styles.detailValue}>{user?.email}</span>
          </div>

          <div className={styles.planDetail}>
            <span className={styles.detailLabel}>Current Plan</span>
            <span className={styles.detailValue}>
              {verification?.tier
                ? verification.tier.charAt(0).toUpperCase() +
                  verification.tier.slice(1)
                : user?.tier || "Loading..."}
            </span>
          </div>

          {verification?.subscriptionId && (
            <div className={styles.planDetail}>
              <span className={styles.detailLabel}>Subscription ID</span>
              <span className={styles.detailValue}>
                {verification.subscriptionId}
              </span>
            </div>
          )}
        </div>

        <div className={styles.featuresContainer}>
          <h2>What’s included in your plan:</h2>
          <ul className={styles.featuresList}>
            {plan === "pro" ? (
              <>
                {PLAN_FEATURES.pro.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </>
            ) : plan === "studio" ? (
              <>
                {PLAN_FEATURES.pro.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </>
            ) : (
              <li>Enhanced features and storage</li>
            )}
          </ul>
        </div>

        <div className={styles.nextSteps}>
          <h2>Next Steps:</h2>
          <p>Start uploading your audio files or explore your new features.</p>

          <div className={styles.buttons}>
            <Link href="/dashboard" className={styles.primaryButton}>
              Go to Dashboard <FiArrowRight />
            </Link>
            <Link href="/#upload-section" className={styles.secondaryButton}>
              Upload Audio
            </Link>
          </div>

          {verification?.customerPortalUrl && (
            <div className={styles.manageSubscription}>
              <a
                href={verification.customerPortalUrl}
                className={styles.portalLink}
              >
                Manage your subscription
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
