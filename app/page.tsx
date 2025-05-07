// app/page.tsx
"use client";

import AudioUploader from "./components/AudioUploader";
import { FiArrowRight, FiCheck, FiLock, FiCloud } from "react-icons/fi";
import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>AudioCloud</h1>
          <p className={styles.subtitle}>
            Secure, high-quality audio storage for musicians and creators
          </p>
          <p className={styles.description}>
            Store, protect, and share your audio files with confidence.
            AudioCloud provides a reliable cloud storage solution specifically
            designed for audio professionals, musicians, and content creators.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="#upload-section" className={styles.primaryButton}>
              Upload Now <FiArrowRight className={styles.buttonIcon} />
            </Link>
            <Link href="/about" className={styles.secondaryButton}>
              Learn More
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.imagePlaceholder}>
            {/* Replace with actual image */}
            <Image
              src="/audio-wave.gif"
              alt="Audio Waveform"
              width={400}
              height={300}
              priority
              unoptimized
            />
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Why Choose AudioCloud</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiLock size={32} />
            </div>
            <h3>Secure Storage</h3>
            <p>
              Your audio files are encrypted and stored securely in the cloud,
              protecting your creative work.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiCloud size={32} />
            </div>
            <h3>High-Quality Preservation</h3>
            <p>
              We maintain the original quality of your audio files with no
              compression or quality loss.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiCheck size={32} />
            </div>
            <h3>Easy Sharing</h3>
            <p>
              Generate secure links to share your audio files with
              collaborators, clients, or friends.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.aboutSection}>
        <h2 className={styles.sectionTitle}>About AudioCloud</h2>
        <div className={styles.aboutContent}>
          <p>
            AudioCloud was created in 2024 to solve a common problem faced by
            musicians and audio professionals: the need for secure, reliable
            storage specifically optimized for audio files. Many general cloud
            storage services don’t adequately handle large audio files or
            maintain the quality standards needed by professionals.
          </p>
          <p>
            Our platform uses advanced AWS S3 technology to ensure your files
            are stored with the highest standards of security and reliability.
            Whether you’re a music producer storing master recordings, a podcast
            creator archiving episodes, or a sound designer saving your work,
            AudioCloud provides the perfect solution for your audio storage
            needs.
          </p>
          <p>
            With support for WAV, MP3, AAC, OGG, and other professional audio
            formats, we ensure that your creative work is preserved exactly as
            you intended it to be heard.
          </p>
          <Link href="/about" className={styles.textLink}>
            Read more about our mission{" "}
            <FiArrowRight className={styles.linkIcon} />
          </Link>
        </div>
      </section>

      {/* Uploader Section */}
      <section id="upload-section" className={styles.uploaderSection}>
        <h2 className={styles.sectionTitle}>Upload Your Audio</h2>
        <p className={styles.uploaderIntro}>
          Experience the simplicity of AudioCloud right now. Upload your audio
          file below, and we’ll generate a secure link that you can use to
          download or share your content.
        </p>
        <div className={styles.uploaderContainer}>
          <AudioUploader />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <h2 className={styles.sectionTitle}>What Our Users Say</h2>
        <div className={styles.testimonialGrid}>
          <div className={styles.testimonialCard}>
            <p className={styles.testimonialText}>
              “AudioCloud has been a game-changer for my music production
              workflow. I can quickly store and share high-quality files with
              clients and collaborators without worrying about quality loss.”
            </p>
            <p className={styles.testimonialAuthor}>
              - Alex Rodriguez, Music Producer
            </p>
          </div>
          <div className={styles.testimonialCard}>
            <p className={styles.testimonialText}>
              “I use AudioCloud to archive all my podcast episodes in their
              original quality. The security and reliability are exactly what I
              needed for my professional work.”
            </p>
            <p className={styles.testimonialAuthor}>
              - Sarah Chen, Podcast Creator
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2>Ready to secure your audio files?</h2>
        <p>
          Start uploading today with our free plan or explore our premium
          options for more storage.
        </p>
        <div className={styles.ctaButtons}>
          <Link href="#upload-section" className={styles.primaryButton}>
            Upload Now
          </Link>
          <Link href="/paid-plans" className={styles.secondaryButton}>
            View Plans
          </Link>
        </div>
      </section>
    </div>
  );
}
