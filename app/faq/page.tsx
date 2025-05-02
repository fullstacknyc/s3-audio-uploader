'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiMinus, FiSearch, FiExternalLink } from 'react-icons/fi';
import styles from './faq.module.css';

// FAQ data - In a real app, this would come from a CMS or database
const faqCategories = [
  {
    id: 'general',
    title: 'General Questions',
    icon: '❓',
  },
  {
    id: 'account',
    title: 'Account & Billing',
    icon: '💳',
  },
  {
    id: 'uploads',
    title: 'Uploads & Storage',
    icon: '🔄',
  },
  {
    id: 'sharing',
    title: 'Sharing & Collaboration',
    icon: '🔗',
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    icon: '🔒',
  },
  {
    id: 'technical',
    title: 'Technical Support',
    icon: '🛠️',
  },
];

const faqs = [
  {
    id: 'what-is-audiocloud',
    question: 'What is AudioCloud?',
    answer: 'AudioCloud is a secure cloud storage service specifically designed for musicians, producers, and audio professionals. We provide specialized features for storing, organizing, and sharing audio files while maintaining their original quality.',
    category: 'general',
  },
  {
    id: 'free-vs-paid',
    question: 'What\'s the difference between free and paid plans?',
    answer: 'Our free plan includes 5GB of storage, basic file organization, and support for common audio formats. Paid plans (Pro and Studio) offer additional storage (100GB-1TB), advanced features like version control, wider format support, collaboration tools, priority support, and more. You can compare plans in detail on our Pricing page.',
    category: 'general',
  },
  {
    id: 'format-support',
    question: 'What audio formats does AudioCloud support?',
    answer: 'AudioCloud supports all major audio formats including WAV, MP3, FLAC, AIFF, AAC, OGG, and more. Our Pro and Studio plans support lossless formats with no compression or quality degradation.',
    category: 'uploads',
  },
  {
    id: 'file-size',
    question: 'Is there a limit to file size?',
    answer: 'Free accounts have a 100MB per file limit. Pro accounts can upload files up to 1GB, and Studio accounts can upload files up to 10GB. These limits ensure optimal performance for all users.',
    category: 'uploads',
  },
  {
    id: 'share-files',
    question: 'How do I share my audio files with collaborators?',
    answer: 'You can create secure share links with various permission levels. Options include view-only (streaming only), download enabled, time-limited links, and password protection. Pro and Studio plans have additional collaboration features like shared workspaces and direct invitations.',
    category: 'sharing',
  },
  {
    id: 'security-measures',
    question: 'How does AudioCloud keep my files secure?',
    answer: 'We use industry-standard encryption for all stored files (AES-256), secure transfer protocols (TLS), and regular security audits. Your files are stored redundantly across multiple secure data centers. Pro and Studio plans include additional security features like activity logs and custom access controls.',
    category: 'security',
  },
  {
    id: 'cancel-subscription',
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel your subscription at any time from your Account Settings. Navigate to Billing > Subscription and click "Cancel Subscription." Your account will remain active until the end of your current billing period, after which it will revert to a free account. Note that if your storage exceeds the free limit, you\'ll need to remove files to upload new content.',
    category: 'account',
  },
  {
    id: 'download-all',
    question: 'Can I download all my files at once?',
    answer: 'Yes. In your library view, you can select multiple files or use the "Select All" option, then click the Download button. For large libraries, we offer a bulk export feature that creates a compressed archive of your files for download.',
    category: 'uploads',
  },
  {
    id: 'audio-preview',
    question: 'Can listeners preview my audio without downloading it?',
    answer: 'Yes, AudioCloud includes a built-in audio player for all shared files. Recipients can stream your audio directly in their browser without downloading it. Pro and Studio plans include waveform visualization and enhanced playback controls.',
    category: 'sharing',
  },
  {
    id: 'data-retention',
    question: 'How long do you keep my files?',
    answer: 'As long as your account is active, we retain all your files indefinitely. If you delete a file, it moves to a trash folder for 30 days before permanent deletion. If you cancel a paid subscription, your files remain accessible but you won\'t be able to upload new content until you reduce your storage below the free tier limit.',
    category: 'security',
  },
  {
    id: 'supported-browsers',
    question: 'Which browsers are supported?',
    answer: 'AudioCloud works with all modern browsers including Chrome, Firefox, Safari, and Edge (latest versions). For the best experience, we recommend using Chrome or Firefox. Internet Explorer is not supported.',
    category: 'technical',
  },
  {
    id: 'mobile-access',
    question: 'Can I access AudioCloud on mobile devices?',
    answer: 'Yes, our website is fully responsive and works on smartphones and tablets. Pro and Studio subscribers also have access to our dedicated mobile apps for iOS and Android, which include offline listening and enhanced mobile features.',
    category: 'technical',
  },
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and Apple Pay. For Studio plans with annual billing, we also offer invoicing options for businesses.',
    category: 'account',
  },
  {
    id: 'copyright-infringement',
    question: 'What is your policy on copyright infringement?',
    answer: 'AudioCloud respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA). We promptly respond to legitimate copyright infringement notices and have a repeat infringer policy. For more details, please see our Terms of Service.',
    category: 'security',
  },
  {
    id: 'offline-access',
    question: 'Can I access my files offline?',
    answer: 'Pro and Studio subscribers can mark files for offline access in our mobile apps. These files will be available even without an internet connection. On desktop, you\'ll need to download files for offline access.',
    category: 'technical',
  },
  {
    id: 'band-discounts',
    question: 'Do you offer discounts for bands or music schools?',
    answer: 'Yes, we offer special pricing for bands, music schools, and production studios. Contact our sales team at sales@audiocloud.com for details on our group rates and educational discounts.',
    category: 'account',
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  // Filter FAQs based on search query and selected category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Frequently Asked Questions</h1>
        <p className={styles.subtitle}>
          Find answers to common questions about AudioCloud. If you can’t find what you’re looking for, please <Link href="/contact">contact our support team</Link>.
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
          className={`${styles.categoryButton} ${selectedCategory === null ? styles.active : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        {faqCategories.map(category => (
          <button
            key={category.id}
            className={`${styles.categoryButton} ${selectedCategory === category.id ? styles.active : ''}`}
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
          filteredFaqs.map(faq => (
            <div
              key={faq.id}
              className={`${styles.faqItem} ${expandedItems[faq.id] ? styles.expanded : ''}`}
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
        <p>Our support team is ready to help with any questions not covered in our FAQ.</p>
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