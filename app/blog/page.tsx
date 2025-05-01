// app/blog/page.tsx - Main blog listing page
import Link from 'next/link';
import styles from './blog.module.css';

// Blog post data - In a real app, this would come from a CMS or database
const blogPosts = [
  {
    id: 'why-audio-cloud-storage-matters',
    title: 'Why Audio Cloud Storage Matters in 2025',
    date: 'May 1, 2025',
    excerpt: 'With the increasing amount of digital audio content being created daily, secure and reliable cloud storage has become more important than ever for musicians and content creators.',
    imageUrl: '/blog/audio-cloud-storage.jpg',
  },
  {
    id: 'secure-audio-sharing',
    title: 'How to Store and Share High-Quality Audio Safely',
    date: 'April 28, 2025',
    excerpt: 'Sharing high-quality audio files securely is essential for professionals. Learn the best practices to keep your audio files protected while maintaining quality.',
    imageUrl: '/blog/secure-sharing.jpg',
  },
  {
    id: 'top-5-tools-for-musicians',
    title: 'Top 5 Tools for Musicians to Store Their Files',
    date: 'April 22, 2025',
    excerpt: 'From cloud storage services to specialized platforms, discover the best tools available for musicians to store and organize their audio files efficiently.',
    imageUrl: '/blog/music-tools.jpg',
  },
];

export default function BlogPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>AudioCloud Blog</h1>
        <p className={styles.subtitle}>
          Insights, tips, and best practices for audio storage and management
        </p>
      </header>
      
      <section className={styles.postsGrid}>
        {blogPosts.map((post) => (
          <article key={post.id} className={styles.postCard}>
            <div className={styles.imageContainer}>
              {/* <img 
                src={post.imageUrl} 
                alt={post.title}
                className={styles.postImage}
                // Use a placeholder image in case the image doesn't exist yet
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/600x400?text=AudioCloud+Blog";
                }}
              /> */}
            </div>
            <div className={styles.postContent}>
              <time className={styles.postDate}>{post.date}</time>
              <h2 className={styles.postTitle}>
                <Link href={`/blog/${post.id}`}>{post.title}</Link>
              </h2>
              <p className={styles.postExcerpt}>{post.excerpt}</p>
              <Link href={`/blog/${post.id}`} className={styles.readMore}>
                Read More →
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}