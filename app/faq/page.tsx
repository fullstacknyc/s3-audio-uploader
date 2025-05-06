"use client";

import { useState } from "react";
import Link from "next/link";
import { FiPlus, FiMinus, FiSearch, FiExternalLink } from "react-icons/fi";
import styles from "./faq.module.css";
import { getAllFaqs, faqCategories } from "@/lib/content/faqs";

export default function FAQPage() {
  const faqs = getAllFaqs();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: boolean;
  }>({});

  // Filter FAQs based on search query and selected category
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === null || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Frequently Asked Questions</h1>
        <p className={styles.subtitle}>
          {
            "Find answers to common questions about AudioCloud. If you can't find what you're looking for, please "
          }
          <Link href="/contact">contact our support team</Link>.
        </p>
      </header>

      {/* Search and Filter */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className={styles.categoryFilters}>
        <button
          className={`${styles.categoryButton} ${
            selectedCategory === null ? styles.active : ""
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        {faqCategories.map((category) => (
          <button
            key={category.id}
            className={`${styles.categoryButton} ${
              selectedCategory === category.id ? styles.active : ""
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.icon} {category.title}
          </button>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className={styles.faqContainer}>
        {filteredFaqs.length === 0 ? (
          <div className={styles.noResults}>
            <h3>No results found</h3>
            <p>Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className={`${styles.faqItem} ${
                expandedItems[faq.id] ? styles.expanded : ""
              }`}
            >
              <button
                className={styles.faqQuestion}
                onClick={() => toggleItem(faq.id)}
              >
                <span>{faq.question}</span>
                {expandedItems[faq.id] ? (
                  <FiMinus className={styles.faqIcon} />
                ) : (
                  <FiPlus className={styles.faqIcon} />
                )}
              </button>
              <div className={styles.faqAnswer}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Still Have Questions Section */}
      <div className={styles.stillHaveQuestions}>
        <h2>Still Have Questions?</h2>
        <p>
          Our support team is ready to help with any questions not covered in
          our FAQ.
        </p>
        <div className={styles.actionButtons}>
          <Link href="/contact" className={styles.primaryButton}>
            Contact Support
          </Link>
          <Link href="/tutorials" className={styles.secondaryButton}>
            Browse Tutorials
          </Link>
        </div>
      </div>

      {/* Related Resources */}
      <div className={styles.relatedResources}>
        <h3>Related Resources</h3>
        <div className={styles.resourcesGrid}>
          <Link href="/tutorials" className={styles.resourceCard}>
            <div className={styles.resourceIcon}>🎓</div>
            <div className={styles.resourceContent}>
              <h4>Video Tutorials</h4>
              <p>Visual guides to using AudioCloud features</p>
            </div>
            <FiExternalLink className={styles.linkIcon} />
          </Link>

          <Link href="/blog" className={styles.resourceCard}>
            <div className={styles.resourceIcon}>📝</div>
            <div className={styles.resourceContent}>
              <h4>Blog Articles</h4>
              <p>Tips and best practices for audio storage</p>
            </div>
            <FiExternalLink className={styles.linkIcon} />
          </Link>

          <Link href="/terms" className={styles.resourceCard}>
            <div className={styles.resourceIcon}>📄</div>
            <div className={styles.resourceContent}>
              <h4>Terms of Service</h4>
              <p>Detailed information about our policies</p>
            </div>
            <FiExternalLink className={styles.linkIcon} />
          </Link>
        </div>
      </div>
    </div>
  );
}
