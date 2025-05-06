// app/blog/page.tsx - Main blog listing page
import Link from "next/link";
import styles from "./blog.module.css";
import { getAllBlogs } from "@/lib/content/blogs";

// This is a server component with static generation
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata() {
  return {
    title: "AudioCloud Blog - Audio Storage Insights",
    description:
      "Insights, tips, and best practices for audio storage and management from AudioCloud experts.",
    keywords: "audio storage, cloud storage, music production, audio tips",
  };
}

export default function BlogPage() {
  // Fetch blogs from the database
  const blogPosts = getAllBlogs();

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
          <article key={post.slug} className={styles.postCard}>
            <div className={styles.imageContainer}>
              {post.imageUrl && (
                <div
                  className={styles.postImage}
                  style={{ backgroundImage: `url(${post.imageUrl})` }}
                  role="img"
                  aria-label={`Cover image for ${post.title}`}
                />
              )}
            </div>
            <div className={styles.postContent}>
              <time className={styles.postDate}>{post.date}</time>
              <h2 className={styles.postTitle}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className={styles.postExcerpt}>{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className={styles.readMore}>
                Read More →
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
