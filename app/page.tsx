import { useEffect } from 'react';
import AudioUploader from './components/AudioUploader';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import styles from './page.module.css';

export default function Home() {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2330891452848767';
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>AudioCloud</h1>
        <p className={styles.subtitle}>Secure, high-quality audio storage</p>
      </header>

      <main className={styles.main}>
        <div className={styles.uploaderContainer}>
          <AudioUploader />
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.copyright}>© {new Date().getFullYear()} AudioCloud</p>
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
        </div>
      </footer>
    </div>
  );
}