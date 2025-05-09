"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiChevronDown, FiUser, FiLogOut } from "react-icons/fi";
import styles from "./Navbar.module.css";
import { useAuth } from "@/lib/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
      window.location.href = "/"; // Force a complete page refresh
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isUserMenuOpen &&
        !(event.target as Element).closest(`.${styles.userDropdown}`)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

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

        <div
          className={`${styles.navLinks} ${isMenuOpen ? styles.active : ""}`}
        >
          <Link
            href="/"
            className={`${styles.navLink} ${
              pathname === "/" ? styles.active : ""
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`${styles.navLink} ${
              pathname === "/about" ? styles.active : ""
            }`}
          >
            About
          </Link>
          <div className={styles.dropdown}>
            <button className={styles.dropdownButton}>
              Resources
              <FiChevronDown size={16} />
            </button>
            <div className={styles.dropdownContent}>
              <Link href="/blog" className={styles.dropdownItem}>
                Blog
              </Link>
              <Link href="/faq" className={styles.dropdownItem}>
                FAQ
              </Link>
              <Link href="/tutorials" className={styles.dropdownItem}>
                Tutorials
              </Link>
            </div>
          </div>
          <Link
            href="/paid-plans"
            className={`${styles.navLink} ${
              pathname === "/paid-plans" ? styles.active : ""
            }`}
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className={`${styles.navLink} ${
              pathname === "/contact" ? styles.active : ""
            }`}
          >
            Contact
          </Link>
        </div>

        <div className={styles.authButtons}>
          {isLoading ? (
            // Loading state
            <div className={styles.skeleton}></div>
          ) : isAuthenticated && user ? (
            // Logged in - show user menu
            <div className={styles.userDropdown}>
              <button
                onClick={toggleUserMenu}
                className={styles.userButton}
                aria-label="User menu"
                aria-expanded={isUserMenuOpen}
              >
                <span className={styles.welcomeText}>
                  Welcome,{" "}
                  <span className={styles.userName}>
                    {user.name.split(" ")[0]}
                  </span>
                </span>
                <div className={styles.userAvatar}>
                  <FiUser size={18} />
                </div>
                <FiChevronDown size={16} className={styles.userDropdownIcon} />
              </button>

              {isUserMenuOpen && (
                <div className={styles.userDropdownContent}>
                  <div className={styles.userInfo}>
                    <div className={styles.userFullName}>{user.name}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                    <div className={styles.userTier}>
                      <span className={styles.tierBadge}>{user.tier}</span>
                    </div>
                  </div>

                  <div className={styles.userDropdownDivider}></div>

                  <Link href="/dashboard" className={styles.userDropdownItem}>
                    Dashboard
                  </Link>
                  <Link href="/settings" className={styles.userDropdownItem}>
                    Account Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`${styles.userDropdownItem} ${styles.logoutButton}`}
                  >
                    <FiLogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Not logged in - show login/signup buttons
            <>
              <Link href="/login" className={styles.loginButton}>
                Log In
              </Link>
              <Link href="/signup" className={styles.signupButton}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
