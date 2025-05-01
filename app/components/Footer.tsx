// app/page.tsx
"use client";

import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import styles from '../page.module.css';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <h3>AudioCloud</h3>
            <p>Secure audio storage solution</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerLinkColumn}>
              <h4>Site</h4>
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/paid-plans">Pricing</Link>
              <Link href="/blog">Blog</Link>
            </div>
            <div className={styles.footerLinkColumn}>
              <h4>Legal</h4>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
            <div className={styles.footerLinkColumn}>
              <h4>Contact</h4>
              <Link href="/contact">Contact Us</Link>
              <Link href="mailto:support@audiocloud.com">support@audiocloud.com</Link>
            </div>
          </div>
          <div className={styles.socialLinks}>
            <a href="https://github.com/fullstacknyc" target="_blank" rel="noopener noreferrer">
              <FiGithub className={styles.icon} />
            </a>
            <a href="https://linkedin.com/in/camilogomezvalencia" target="_blank" rel="noopener noreferrer">
              <FiLinkedin className={styles.icon} />
            </a>
            <a href="mailto:jgomezval@icloud.com">
              <FiMail className={styles.icon} />
            </a>
          </div>
          <p className={styles.copyright}>© {new Date().getFullYear()} AudioCloud. All rights reserved.</p>
        </div>
      </footer>
    )
}