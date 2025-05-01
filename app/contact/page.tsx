'use client';

import { useState } from 'react';
import styles from './contact.module.css';
import { FiMail, FiMapPin, FiPhone, FiCheckCircle } from 'react-icons/fi';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        submitted: true,
        error: true,
        message: 'Please fill out all required fields.',
      });
      return;
    }

    // In a real implementation, you would send this data to your server
    // For demo purposes, we're just simulating a successful submission
    setTimeout(() => {
      setFormStatus({
        submitted: true,
        error: false,
        message: 'Thank you for your message! We will get back to you shortly.',
      });
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.contactInfo}>
          <h1>Contact Us</h1>
          <p className={styles.subtitle}>
            Have questions about AudioCloud? We're here to help! Fill out the form below or use one of our 
            direct contact methods to get in touch with our team.
          </p>
          
          <div className={styles.contactMethods}>
            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <FiMail />
              </div>
              <div className={styles.contactText}>
                <h3>Email</h3>
                <p>support@audiocloud.com</p>
              </div>
            </div>
            
            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <FiPhone />
              </div>
              <div className={styles.contactText}>
                <h3>Phone</h3>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            
            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <FiMapPin />
              </div>
              <div className={styles.contactText}>
                <h3>Address</h3>
                <p>123 Music Avenue, Suite 456<br />San Francisco, CA 94103</p>
              </div>
            </div>
          </div>
          
          <div className={styles.supportHours}>
            <h3>Support Hours</h3>
            <p>Monday - Friday: 9:00 AM - 6:00 PM PT</p>
            <p>Saturday: 10:00 AM - 4:00 PM PT</p>
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
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
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
                required
              ></textarea>
            </div>
            
            <button type="submit" className={styles.submitButton}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}