'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiShield, FiCloud, FiMusic, FiUsers } from 'react-icons/fi';
import styles from './about.module.css';

export default function About() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>About AudioCloud</h1>
          <p className={styles.subtitle}>
            Our mission is to provide musicians and audio professionals with the most secure
            and reliable cloud storage solution for their creative work.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <h2>Our Story</h2>
          <div className={styles.storyContent}>
            <div className={styles.storyText}>
              <p>
                AudioCloud was founded in 2024 by a team of musicians and software engineers who 
                were frustrated with the lack of quality cloud storage options specifically designed for audio files.
              </p>
              <p>
                As musicians ourselves, we understood the unique needs of audio professionals. General cloud storage 
                services often compress audio files, don't support professional audio formats, or make it difficult 
                to share large files with collaborators.
              </p>
              <p>
                We set out to create a platform that would address these challenges and provide a seamless experience 
                for storing, organizing, and sharing high-quality audio files. Our goal was simple: build the storage 
                platform we wished existed.
              </p>
              <p>
                Today, AudioCloud serves thousands of musicians, podcasters, sound engineers, and audio enthusiasts 
                who trust us with their valuable creative work. We remain committed to our original mission of providing 
                the most secure and reliable audio storage solution in the cloud.
              </p>
            </div>
            <div className={styles.storyImage}>
              <div className={styles.imagePlaceholder}>
                {/* Replace with actual founder image */}
                <Image src="/team-image.jpg" alt="AudioCloud Team" width={400} height={300} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <h2>Our Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <FiShield size={32} />
              </div>
              <h3>Security First</h3>
              <p>
                We prioritize the security of your audio files above all else. Your creative work 
                deserves the highest level of protection, and we employ industry-leading encryption 
                and secure storage practices to keep your files safe.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <FiMusic size={32} />
              </div>
              <h3>Audio Quality</h3>
              <p>
                We understand the importance of maintaining the original quality of your audio files. 
                Unlike general cloud storage services, we never compress your files or alter them in any way.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <FiCloud size={32} />
              </div>
              <h3>Reliability</h3>
              <p>
                Your files should be available whenever you need them. We've built our infrastructure 
                on AWS S3 technology to ensure 99.99% uptime and redundant storage across multiple locations.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <FiUsers size={32} />
              </div>
              <h3>Community</h3>
              <p>
                We believe in supporting the audio creator community. We regularly host educational webinars, 
                share resources, and sponsor audio-focused events to give back to the community we serve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Technology Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <h2>Our Technology</h2>
          <div className={styles.technologyContent}>
            <p>
              AudioCloud is built on modern, scalable cloud technology to provide the best experience 
              for audio professionals. Our platform utilizes AWS S3 storage technology, which provides 
              industry-leading reliability, security, and performance.
            </p>
            <p>
              Key features of our technology include:
            </p>
            <ul className={styles.featuresList}>
              <li>
                <strong>End-to-end encryption</strong> – Your files are encrypted during transfer and 
                at rest to ensure maximum security.
              </li>
              <li>
                <strong>Multi-region redundancy</strong> – We store multiple copies of your files 
                across different geographic regions to prevent data loss.
              </li>
              <li>
                <strong>Lossless storage</strong> – We preserve the original quality of your audio 
                files without any compression or modification.
              </li>
              <li>
                <strong>Secure file sharing</strong> – Generate unique, time-limited links to share 
                your audio files with collaborators or clients.
              </li>
              <li>
                <strong>Support for all major audio formats</strong> – We support WAV, MP3, AAC, OGG, 
                and many other professional audio formats.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <h2>Meet Our Team</h2>
          <div className={styles.teamGrid}>
            <div className={styles.teamMember}>
              <div className={styles.memberImage}>
                {/* Replace with actual team member image */}
                <div className={styles.imagePlaceholder}></div>
              </div>
              <h3>Camilo Gomez</h3>
              <p className={styles.memberTitle}>Founder & CEO</p>
              <p className={styles.memberBio}>
                Camilo is a software engineer and amateur musician with over 10 years of experience 
                in cloud technologies. He founded AudioCloud to solve the storage challenges he faced 
                with his own audio projects.
              </p>
            </div>
            <div className={styles.teamMember}>
              <div className={styles.memberImage}>
                {/* Replace with actual team member image */}
                <div className={styles.imagePlaceholder}></div>
              </div>
              <h3>Maria Rodriguez</h3>
              <p className={styles.memberTitle}>Chief Technology Officer</p>
              <p className={styles.memberBio}>
                Maria brings 15 years of experience in building secure and scalable cloud infrastructure. 
                She leads our engineering team and ensures that AudioCloud meets the highest standards 
                of security and reliability.
              </p>
            </div>
            <div className={styles.teamMember}>
              <div className={styles.memberImage}>
                {/* Replace with actual team member image */}
                <div className={styles.imagePlaceholder}></div>
              </div>
              <h3>David Chen</h3>
              <p className={styles.memberTitle}>Head of User Experience</p>
              <p className={styles.memberBio}>
                David is a UX designer with a background in audio engineering. He ensures that AudioCloud 
                provides an intuitive and seamless experience for audio professionals of all technical levels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2>Join thousands of audio professionals who trust AudioCloud</h2>
        <p>Start storing your audio files securely today.</p>
        <div className={styles.ctaButtons}>
          <Link href="/#upload-section" className={styles.primaryButton}>
            Upload Your First File <FiArrowRight className={styles.buttonIcon} />
          </Link>
          <Link href="/contact" className={styles.secondaryButton}>
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}