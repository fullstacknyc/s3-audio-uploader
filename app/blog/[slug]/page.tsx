// app/blog/[slug]/page.tsx
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import Image from "next/image";
import styles from "../blog.module.css";
import { getAllBlogSlugs, getBlogBySlug } from "@/lib/content/blogs";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Static page with revalidation
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();

  return slugs.map((slug) => ({
    slug,
  }));
}

// Generate metadata for each blog post
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog Post Not Found - AudioCloud",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${blog.title} - AudioCloud Blog`,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: "article",
      publishedTime: new Date(blog.date).toISOString(),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  // If blog not found, show 404 page
  if (!blog) {
    notFound();
  }

  // Calculate reading time (average reading speed: 200 words per minute)
  const wordCount = blog.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className={styles.container}>
      <article className={styles.singlePost}>
        <header className={styles.postHeader}>
          <div className={styles.postMeta}>
            <time>{blog.date}</time>
            {" • "}
            <span>{readingTime} min read</span>
          </div>
          <h1>{blog.title}</h1>
        </header>

        {blog.imageUrl && (
          <div className={styles.postFeaturedImageContainer}>
            <Image
              src={blog.imageUrl}
              alt={`Cover image for ${blog.title}`}
              className={styles.postFeaturedImage}
              width={800}
              height={450}
            />
          </div>
        )}

        <div
          className={styles.postBody}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        <Link href="/blog" className={styles.backToBlogs}>
          <FiArrowLeft /> Back to all articles
        </Link>
      </article>
    </div>
  );
}
