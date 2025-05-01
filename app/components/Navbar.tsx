'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          AudioCloud
        </Link>

        <button 
          className={styles.menuButton} 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <div className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/about" 
            className={`${styles.navLink} ${pathname === '/about' ? styles.active : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <div className={styles.dropdown}>
            <button className={styles.dropdownButton}>
              Resources
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className={styles.dropdownContent}>
              <Link 
                href="/blog" 
                className={styles.dropdownItem}
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/faq" 
                className={styles.dropdownItem}
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link 
                href="/tutorials" 
                className={styles.dropdownItem}
                onClick={() => setIsMenuOpen(false)}
              >
                Tutorials
              </Link>
            </div>
          </div>
          <Link 
            href="/paid-plans" 
            className={`${styles.navLink} ${pathname === '/paid-plans' ? styles.active : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link 
            href="/contact" 
            className={`${styles.navLink} ${pathname === '/contact' ? styles.active : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
        </div>

        <div className={styles.authButtons}>
          <Link href="/login" className={styles.loginButton}>
            Log In
          </Link>
          <Link href="/signup" className={styles.signupButton}>
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}