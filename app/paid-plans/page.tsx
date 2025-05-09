"use client";

import { useState } from "react";
import {
  FiCheckCircle,
  FiHelpCircle,
  FiMusic,
  FiShield,
  FiUsers,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import styles from "./paid-plans.module.css";
import { PLAN_FEATURES, PLAN_PRICES } from "@/lib/constants/plans";
import { useAuth } from "@/lib/context/AuthContext";

// Billing portal URL
const STRIPE_BILLING_URL =
  process.env.NEXT_PUBLIC_STRIPE_BILLING_URL ||
  "https://billing.stripe.com/p/login/aEUaIq8eS9OmaLmdQQ";

const PlansPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to handle premium plan selection
  const handlePlanSelection = async (plan: "pro" | "studio") => {
    // Reset error state
    setError(null);

    // Set processing state with the selected plan
    setIsProcessing(true);
    setProcessingPlan(plan);

    try {
      // Check if user is logged in
      if (isAuthenticated && user) {
        // Create a payment link via our API
        const response = await fetch("/api/stripe/create-payment-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan }),
        });

        // Check response status
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create payment link");
        }

        // Get the checkout URL from the response
        const data = await response.json();

        if (data.success && data.checkoutUrl) {
          // Redirect to the Stripe checkout page
          window.location.href = data.checkoutUrl;
        } else {
          throw new Error("No checkout URL received");
        }
      } else {
        // If not logged in, redirect to signup page with plan parameter
        window.location.href = `/signup?plan=${plan}`;
      }
    } catch (error) {
      console.error("Error handling plan selection:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
      // Reset processing state
      setIsProcessing(false);
      setProcessingPlan(null);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>AudioCloud Premium Plans</h1>
        <p className={styles.subtitle}>
          Secure, reliable audio storage built for musicians
        </p>
      </header>

      {error && (
        <div className={styles.errorAlert}>
          <FiAlertCircle className={styles.alertIcon} />
          <p>{error}</p>
        </div>
      )}

      <main className={styles.main}>
        <section className={styles.valueProposition}>
          <h2>Why Choose AudioCloud for Your Music</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <FiShield size={24} className={styles.icon} />
              <h3>Secure Storage</h3>
              <p>
                Your audio files are encrypted and protected with bank-level
                security standards. Your creative work stays private and
                protected.
              </p>
            </div>
            <div className={styles.featureItem}>
              <FiMusic size={24} className={styles.icon} />
              <h3>Audio Format Support</h3>
              <p>
                AudioCloud supports all major audio formats including WAV, MP3,
                FLAC, AIFF, AAC, and more - preserving your sound quality
                exactly as intended.
              </p>
            </div>
            <div className={styles.featureItem}>
              <FiUsers size={24} className={styles.icon} />
              <h3>Collaboration Ready</h3>
              <p>
                Share your audio files securely with collaborators, producers,
                and band members with custom access controls and expiring links.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.pricingPlans}>
          <h2>Choose Your Plan</h2>
          <div className={styles.plansContainer}>
            {/* Free Plan */}
            <div className={styles.planCard}>
              <div className={styles.planHeader}>
                <h3>Free</h3>
                <p className={styles.price}>
                  ${PLAN_PRICES.free}
                  <span>/month</span>
                </p>
              </div>
              <div className={styles.planFeatures}>
                <p className={styles.planDescription}>
                  Perfect for hobbyists or those just getting started
                </p>
                <ul>
                  {PLAN_FEATURES.free.map((feature, index) => (
                    <li key={index}>
                      <FiCheckCircle className={styles.icon} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className={styles.planButton}
                onClick={() => (window.location.href = "/signup")}
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className={`${styles.planCard} ${styles.highlighted}`}>
              <div className={styles.planHeader}>
                <h3>Pro</h3>
                <div className={styles.tag}>Most Popular</div>
                <p className={styles.price}>
                  ${PLAN_PRICES.pro}
                  <span>/month</span>
                </p>
              </div>
              <div className={styles.planFeatures}>
                <p className={styles.planDescription}>
                  For serious musicians and producers
                </p>
                <ul>
                  {PLAN_FEATURES.pro.map((feature, index) => (
                    <li key={index}>
                      <FiCheckCircle className={styles.icon} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className={`${styles.planButton} ${styles.pro}`}
                onClick={() => handlePlanSelection("pro")}
                disabled={isProcessing}
              >
                {isProcessing && processingPlan === "pro" ? (
                  <span className={styles.processingButton}>
                    <FiLoader className={styles.spinnerIcon} />
                    Processing...
                  </span>
                ) : (
                  "Start 14-Day Free Trial"
                )}
              </button>
            </div>

            {/* Studio Plan */}
            <div className={styles.planCard}>
              <div className={styles.planHeader}>
                <h3>Studio</h3>
                <p className={styles.price}>
                  ${PLAN_PRICES.studio}
                  <span>/month</span>
                </p>
              </div>
              <div className={styles.planFeatures}>
                <p className={styles.planDescription}>
                  Professional solution for studios and production teams
                </p>
                <ul>
                  {PLAN_FEATURES.studio.map((feature, index) => (
                    <li key={index}>
                      <FiCheckCircle className={styles.icon} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className={styles.planButton}
                onClick={() => handlePlanSelection("studio")}
                disabled={isProcessing}
              >
                {isProcessing && processingPlan === "studio" ? (
                  <span className={styles.processingButton}>
                    <FiLoader className={styles.spinnerIcon} />
                    Processing...
                  </span>
                ) : (
                  "Start 14-Day Free Trial"
                )}
              </button>
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqContainer}>
            <div className={styles.faqItem}>
              <h3>
                <FiHelpCircle className={styles.icon} /> What happens if I
                exceed my storage limit?
              </h3>
              <p>
                You’ll receive notifications when you’re approaching your
                storage limit. If you exceed your limit, you’ll still have
                access to your existing files but won’t be able to upload new
                content until you either upgrade your plan or free up some
                space.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>
                <FiHelpCircle className={styles.icon} /> Can I upgrade or
                downgrade my plan at any time?
              </h3>
              <p>
                Yes, you can change your subscription at any time. When
                upgrading, you’ll immediately gain access to additional
                features. When downgrading, the changes will take effect at the
                end of your current billing cycle.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>
                <FiHelpCircle className={styles.icon} /> Is my music protected
                and secure?
              </h3>
              <p>
                Absolutely. We use industry-standard encryption for all stored
                content, secure access controls, and regular security audits to
                ensure your creative work remains protected. Your intellectual
                property always remains yours.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>
                <FiHelpCircle className={styles.icon} /> Do you offer any
                discounts for bands or music schools?
              </h3>
              <p>
                Yes! We offer special pricing for music education institutions
                and professional organizations. Contact our sales team for
                details on our custom plans for music schools, studios, and
                production companies.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.testimonials}>
          <h2>What Music Professionals Say</h2>
          <div className={styles.testimonialGrid}>
            <div className={styles.testimonialCard}>
              <p>
                “AudioCloud has transformed how I store and share my music with
                collaborators. The security features give me peace of mind that
                my unreleased tracks are safe.”
              </p>
              <div className={styles.testimonialAuthor}>
                <strong>Sarah K.</strong>
                <span>Independent Producer</span>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <p>
                “The organization features and version control have saved me
                countless hours in the studio. I can easily track different
                mixes and find exactly what I need.”
              </p>
              <div className={styles.testimonialAuthor}>
                <strong>Mark J.</strong>
                <span>Studio Engineer</span>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <p>
                “As a music teacher, I needed a secure way to share practice
                tracks with students. AudioCloud’s sharing features are perfect
                for our needs.”
              </p>
              <div className={styles.testimonialAuthor}>
                <strong>Rachel T.</strong>
                <span>Music Educator</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <h2>Ready to Store Your Music Securely?</h2>
          <p>
            Join thousands of musicians who trust AudioCloud for their audio
            storage needs.
          </p>
          <div className={styles.ctaButtons}>
            <button
              className={styles.primaryButton}
              onClick={() => (window.location.href = "/signup")}
            >
              Get Started Free
            </button>
            <a href={STRIPE_BILLING_URL} className={styles.secondaryButton}>
              Compare Plans
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PlansPage;
