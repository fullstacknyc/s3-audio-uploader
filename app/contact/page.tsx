"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./contact.module.css";
import {
  FiMail,
  FiMapPin,
  FiPhone,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    submitting: false,
    error: false,
    message: "",
  });

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isClient, setIsClient] = useState(false);

  // Reference to turnstile container
  const turnstileRef = useRef<HTMLDivElement>(null);
  // Reference to turnstile widget
  const widgetIdRef = useRef<string | null>(null);

  // Initialize Turnstile when component mounts
  useEffect(() => {
    setIsClient(true);

    // Load Turnstile script if it hasn't been loaded yet
    if (typeof window !== "undefined" && !window.turnstile) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = renderTurnstile;

      return () => {
        document.body.removeChild(script);
      };
    } else if (typeof window !== "undefined" && window.turnstile) {
      renderTurnstile();
    }
  }, []);

  // Render Turnstile widget
  const renderTurnstile = () => {
    if (!turnstileRef.current || !window.turnstile) return;

    // Reset any existing widget
    if (widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
    }

    // Render new widget
    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey:
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
        "1x00000000000000000000AA",
      callback: function (token: string) {
        setTurnstileToken(token);
        // Clear validation error when token is received
        setValidationErrors((prev) => {
          const updated = { ...prev };
          delete updated.turnstile;
          return updated;
        });
      },
      "expired-callback": function () {
        setTurnstileToken(null);
        setValidationErrors((prev) => ({
          ...prev,
          turnstile: "Verification expired. Please verify again.",
        }));
      },
    });
  };

  // Validate form client-side before submission
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    const nameValue = formData.name.trim();
    const emailValue = formData.email.trim();
    const messageValue = formData.message.trim();

    if (!nameValue) {
      errors.name = "Name is required";
    } else if (nameValue.length > 100) {
      errors.name = "Name is too long (maximum 100 characters)";
    }

    if (!emailValue) {
      errors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailValue)
    ) {
      errors.email = "Please enter a valid email address";
    }

    if (!messageValue) {
      errors.message = "Message is required";
    } else if (messageValue.length > 1000) {
      errors.message = "Message is too long (maximum 1000 characters)";
    }

    if (!turnstileToken) {
      errors.turnstile = "Please complete the verification challenge";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Prevent extremely long inputs that could be used for DoS
    if (value.length > 2000) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field when typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setFormStatus({
      submitted: false,
      submitting: true,
      error: false,
      message: "",
    });

    try {
      // Submit form data to our server-side API endpoint
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim() || "Contact Form Submission",
          message: formData.message.trim(),
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Success
      setFormStatus({
        submitted: true,
        submitting: false,
        error: false,
        message:
          data.message ||
          "Thank you for your message! We will get back to you shortly.",
      });

      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Reset Turnstile
      setTurnstileToken(null);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    } catch (error) {
      // Error handling
      console.error("Contact Form Error:", error);
      setFormStatus({
        submitted: true,
        submitting: false,
        error: true,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.contactInfo}>
          <h1>Contact Us</h1>
          <p className={styles.subtitle}>
            Have questions about AudioCloud? We’re here to help! Fill out the
            form below or use one of our direct contact methods to get in touch
            with our team.
          </p>

          <div className={styles.contactMethods}>
            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <FiMail />
              </div>
              <div className={styles.contactText}>
                <h3>Email</h3>
                <p>jcgomezvale@gmail.com</p>
              </div>
            </div>

            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <FiPhone />
              </div>
              <div className={styles.contactText}>
                <h3>Phone</h3>
                <p>+1 (551) 900-3455</p>
              </div>
            </div>

            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <FiMapPin />
              </div>
              <div className={styles.contactText}>
                <h3>Address</h3>
                <p>
                  20 W 34th St.
                  <br />
                  New York, NY 10001
                </p>
              </div>
            </div>
          </div>

          <div className={styles.supportHours}>
            <h3>Support Hours</h3>
            <p>Monday - Friday: 9:00 AM - 6:00 PM ET</p>
            <p>Saturday: 10:00 AM - 4:00 PM ET</p>
            <p>Sunday: Closed</p>
          </div>
        </div>

        <div className={styles.contactForm}>
          <h2>Send Us a Message</h2>

          {formStatus.submitted && !formStatus.error && (
            <div className={styles.successMessage}>
              <FiCheckCircle className={styles.successIcon} />
              <p>{formStatus.message}</p>
            </div>
          )}

          {formStatus.submitted && formStatus.error && (
            <div className={styles.errorMessage}>
              <FiAlertCircle className={styles.errorIcon} />
              <p>{formStatus.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Your Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={validationErrors.name ? styles.inputError : ""}
                maxLength={100}
                aria-required="true"
                aria-invalid={!!validationErrors.name}
                aria-describedby={
                  validationErrors.name ? "name-error" : undefined
                }
              />
              {validationErrors.name && (
                <p className={styles.fieldError} id="name-error">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={validationErrors.email ? styles.inputError : ""}
                maxLength={100}
                aria-required="true"
                aria-invalid={!!validationErrors.email}
                aria-describedby={
                  validationErrors.email ? "email-error" : undefined
                }
              />
              {validationErrors.email && (
                <p className={styles.fieldError} id="email-error">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                maxLength={200}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                className={validationErrors.message ? styles.inputError : ""}
                maxLength={1000}
                aria-required="true"
                aria-invalid={!!validationErrors.message}
                aria-describedby={
                  validationErrors.message ? "message-error" : undefined
                }
              ></textarea>
              {validationErrors.message && (
                <p className={styles.fieldError} id="message-error">
                  {validationErrors.message}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              {isClient && (
                <div
                  ref={turnstileRef}
                  className={styles.turnstileContainer}
                ></div>
              )}
              {validationErrors.turnstile && (
                <p className={styles.fieldError}>
                  {validationErrors.turnstile}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={formStatus.submitting}
              aria-disabled={formStatus.submitting}
            >
              {formStatus.submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
