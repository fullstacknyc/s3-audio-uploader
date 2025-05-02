"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiVideo,
  FiFileText,
  FiArrowRight,
  FiChevronDown,
  FiPlayCircle,
} from "react-icons/fi";
import styles from "./tutorials.module.css";

// Tutorial data - In a real app, this would come from a CMS or database
const tutorialCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    description:
      "Learn the basics of AudioCloud and how to get up and running quickly.",
    icon: <FiVideo size={24} />,
  },
  {
    id: "advanced-features",
    title: "Advanced Features",
    description:
      "Dive deeper into AudioCloud's powerful features for audio professionals.",
    icon: <FiVideo size={24} />,
  },
  {
    id: "collaboration",
    title: "Collaboration Tools",
    description:
      "Learn how to share and collaborate on audio projects with team members.",
    icon: <FiVideo size={24} />,
  },
  {
    id: "guides",
    title: "Written Guides",
    description: "Step-by-step guides for specific workflows and techniques.",
    icon: <FiFileText size={24} />,
  },
];

const tutorials = [
  {
    id: "uploading-first-file",
    title: "Uploading Your First Audio File",
    category: "getting-started",
    duration: "3:45",
    difficulty: "Beginner",
    thumbnail: "/tutorials/upload-tutorial.jpg",
    description:
      "Learn how to quickly upload and securely store your first audio file with AudioCloud.",
    videoId: "abc123",
    popular: true,
  },
  {
    id: "organizing-files",
    title: "Organizing Your Audio Library",
    category: "getting-started",
    duration: "5:20",
    difficulty: "Beginner",
    thumbnail: "/tutorials/organize-tutorial.jpg",
    description:
      "Discover how to create folders, add tags, and keep your audio files neatly organized.",
    videoId: "def456",
    popular: true,
  },
  {
    id: "secure-sharing",
    title: "Secure Sharing with Collaborators",
    category: "collaboration",
    duration: "4:15",
    difficulty: "Intermediate",
    thumbnail: "/tutorials/sharing-tutorial.jpg",
    description:
      "Learn how to securely share your audio projects with band members, producers, and clients.",
    videoId: "ghi789",
    popular: true,
  },
  {
    id: "version-control",
    title: "Audio Version Control",
    category: "advanced-features",
    duration: "6:30",
    difficulty: "Advanced",
    thumbnail: "/tutorials/version-tutorial.jpg",
    description:
      "Master the art of tracking different versions of your audio projects with our powerful tools.",
    videoId: "jkl012",
    popular: false,
  },
  {
    id: "metadata-management",
    title: "Audio Metadata Management",
    category: "advanced-features",
    duration: "7:45",
    difficulty: "Advanced",
    thumbnail: "/tutorials/metadata-tutorial.jpg",
    description:
      "Learn how to add, edit, and leverage metadata to better organize and find your audio files.",
    videoId: "mno345",
    popular: false,
  },
  {
    id: "collaboration-workflow",
    title: "Setting Up a Collaboration Workflow",
    category: "collaboration",
    duration: "8:20",
    difficulty: "Intermediate",
    thumbnail: "/tutorials/workflow-tutorial.jpg",
    description:
      "Create an efficient workflow for collaborating with musicians and producers around the world.",
    videoId: "pqr678",
    popular: true,
  },
  {
    id: "audio-formats",
    title: "Understanding Audio File Formats",
    category: "guides",
    duration: "10:00",
    difficulty: "Intermediate",
    thumbnail: "/tutorials/formats-tutorial.jpg",
    description:
      "A comprehensive guide to audio file formats and when to use each for optimal quality and compatibility.",
    videoId: "stu901",
    popular: false,
  },
  {
    id: "backup-strategies",
    title: "Audio Backup Strategies",
    category: "guides",
    duration: "5:50",
    difficulty: "Beginner",
    thumbnail: "/tutorials/backup-tutorial.jpg",
    description:
      "Essential strategies for keeping your audio files safe with proper backup procedures.",
    videoId: "vwx234",
    popular: true,
  },
];

const faqs = [
  {
    question: "How often are new tutorials added?",
    answer:
      "We add new tutorials every week, focusing on the features and workflows our users request most frequently. Be sure to subscribe to our newsletter to get notified when new content is published.",
  },
  {
    question: "Are the tutorials available offline?",
    answer:
      "Yes, all of our written guides can be downloaded as PDFs for offline reference. Video tutorials can be accessed offline through our mobile app if you're a Pro or Studio subscription member.",
  },
  {
    question: "I'm new to audio production. Where should I start?",
    answer:
      'We recommend beginning with our "Getting Started" series, particularly the "Uploading Your First Audio File" and "Organizing Your Audio Library" tutorials. These will give you a solid foundation before moving on to more advanced topics.',
  },
  {
    question: "Can I request a tutorial on a specific topic?",
    answer:
      "Absolutely! We love hearing what our users want to learn. You can submit tutorial requests through our contact form or by emailing tutorials@audiocloud.com.",
  },
];

export default function TutorialsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Filter tutorials based on selected category
  const filteredTutorials = selectedCategory
    ? tutorials.filter((tutorial) => tutorial.category === selectedCategory)
    : tutorials;

  // Popular tutorials for featured section
  const popularTutorials = tutorials.filter((tutorial) => tutorial.popular);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>AudioCloud Tutorials</h1>
        <p className={styles.subtitle}>
          Learn how to get the most out of AudioCloud with our comprehensive
          video tutorials and written guides
        </p>
      </header>

      {/* Featured Tutorials Section */}
      <section className={styles.featuredSection}>
        <h2 className={styles.sectionTitle}>Popular Tutorials</h2>
        <div className={styles.featuredGrid}>
          {popularTutorials.slice(0, 3).map((tutorial) => (
            <Link
              href={`/tutorials/${tutorial.id}`}
              key={tutorial.id}
              className={styles.featuredCard}
            >
              <div className={styles.thumbnailContainer}>
                <div className={styles.thumbnail}>
                  {/* Replace with actual thumbnail image */}
                  <div className={styles.thumbnailPlaceholder}>
                    <FiPlayCircle size={48} />
                  </div>
                </div>
                <span className={styles.duration}>{tutorial.duration}</span>
              </div>
              <div className={styles.featuredContent}>
                <span className={styles.difficulty}>{tutorial.difficulty}</span>
                <h3 className={styles.featuredTitle}>{tutorial.title}</h3>
                <p className={styles.featuredDescription}>
                  {tutorial.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>Browse By Category</h2>
        <div className={styles.categoryButtons}>
          <button
            className={`${styles.categoryButton} ${
              selectedCategory === null ? styles.active : ""
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            All Tutorials
          </button>
          {tutorialCategories.map((category) => (
            <button
              key={category.id}
              className={`${styles.categoryButton} ${
                selectedCategory === category.id ? styles.active : ""
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.title}
            </button>
          ))}
        </div>
      </section>

      {/* Tutorials Grid */}
      <section className={styles.tutorialsSection}>
        <div className={styles.tutorialsGrid}>
          {filteredTutorials.map((tutorial) => (
            <Link
              href={`/tutorials/${tutorial.id}`}
              key={tutorial.id}
              className={styles.tutorialCard}
            >
              <div className={styles.thumbnailContainer}>
                <div className={styles.thumbnail}>
                  {/* Replace with actual thumbnail image */}
                  <div className={styles.thumbnailPlaceholder}>
                    <FiPlayCircle size={32} />
                  </div>
                </div>
                <span className={styles.duration}>{tutorial.duration}</span>
              </div>
              <div className={styles.tutorialContent}>
                <span className={styles.difficulty}>{tutorial.difficulty}</span>
                <h3 className={styles.tutorialTitle}>{tutorial.title}</h3>
                <p className={styles.tutorialDescription}>
                  {tutorial.description}
                </p>
                <span className={styles.watchNow}>
                  Watch Tutorial <FiArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Category Sections */}
      <section className={styles.categoryDetailsSection}>
        {tutorialCategories.map((category) => (
          <div key={category.id} className={styles.categoryDetail}>
            <div className={styles.categoryIcon}>{category.icon}</div>
            <div className={styles.categoryContent}>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`${styles.faqItem} ${
                expandedFaq === index ? styles.expanded : ""
              }`}
            >
              <button
                className={styles.faqQuestion}
                onClick={() => toggleFaq(index)}
              >
                {faq.question}
                <FiChevronDown
                  className={`${styles.faqIcon} ${
                    expandedFaq === index ? styles.rotated : ""
                  }`}
                />
              </button>
              <div className={styles.faqAnswer}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2>Can’t find what you’re looking for?</h2>
        <p>
          Our support team is ready to help you with any questions about using
          AudioCloud.
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/contact" className={styles.primaryButton}>
            Contact Support
          </Link>
          <Link href="/faq" className={styles.secondaryButton}>
            Visit FAQ
          </Link>
        </div>
      </section>
    </div>
  );
}
