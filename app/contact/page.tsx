"use client";

import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import styles from "./contact.module.css";
import {
  FiMail,
  FiMapPin,
  FiPhone,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import ReCAPTCHA from "react-google-recaptcha";
import emailjs from "@emailjs/browser";

declare global {
  interface Window {
    grecaptcha?: {
      reset: () => void;
    };
  }
}

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

  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when the component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);

    // Initialize EmailJS
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey);
    }
  }, []);

  // Sanitize user input before validation or submission
  const sanitizeInput = (input: string): string => {
    // Use DOMPurify to sanitize the input
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [], // No HTML attributes allowed
    }).trim();
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    const sanitizedName = sanitizeInput(formData.name);
    const sanitizedEmail = sanitizeInput(formData.email);
    const sanitizedMessage = sanitizeInput(formData.message);

    if (!sanitizedName) {
      errors.name = "Name is required";
    } else if (sanitizedName.length > 100) {
      errors.name = "Name is too long (maximum 100 characters)";
    }

    if (!sanitizedEmail) {
      errors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(sanitizedEmail)
    ) {
      errors.email = "Please enter a valid email address";
    }

    if (!sanitizedMessage) {
      errors.message = "Message is required";
    } else if (sanitizedMessage.length > 1000) {
      errors.message = "Message is too long (maximum 1000 characters)";
    }

    if (!recaptchaToken) {
      errors.recaptcha = "Please complete the reCAPTCHA verification";
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

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    if (token) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated.recaptcha;
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
      // Sanitize all inputs before submission
      const sanitizedFormData = {
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email),
        subject: sanitizeInput(formData.subject || "Contact Form Submission"),
        message: sanitizeInput(formData.message),
      };

      // Verify reCAPTCHA first
      const recaptchaResponse = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recaptchaToken }),
      });

      const recaptchaData = await recaptchaResponse.json();

      if (!recaptchaResponse.ok) {
        throw new Error(recaptchaData.error || "reCAPTCHA verification failed");
      }

      // Send email using EmailJS with sanitized data
      const templateParams = {
        from_name: sanitizedFormData.name,
        from_email: sanitizedFormData.email,
        subject: sanitizedFormData.subject,
        message: sanitizedFormData.message,
      };

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "",
        templateParams
      );

      // Success
      setFormStatus({
        submitted: true,
        submitting: false,
        error: false,
        message: "Thank you for your message! We will get back to you shortly.",
      });

      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Reset reCAPTCHA
      setRecaptchaToken(null);
      if (typeof window !== "undefined" && window.grecaptcha) {
        window.grecaptcha.reset();
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
                <p>+1 (551)900-3455</p>
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
                <ReCAPTCHA
                  sitekey={
                    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
                    "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  } // Default is Google's test key
                  onChange={handleRecaptchaChange}
                />
              )}
              {validationErrors.recaptcha && (
                <p className={styles.fieldError}>
                  {validationErrors.recaptcha}
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
