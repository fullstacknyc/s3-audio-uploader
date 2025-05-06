// lib/content/blogs/index.ts
import { Blog, BlogWithoutContent } from "./blog-types";

// Import all blog posts
import audioCloudStorage from "./why-audio-cloud-storage-matters";
import secureAudioSharing from "./secure-audio-sharing";
import topToolsForMusicians from "./top-5-tools-for-musicians";

// Create an array of all blogs
const blogs: Blog[] = [
  audioCloudStorage,
  secureAudioSharing,
  topToolsForMusicians,
];

// Function to get all blogs without content (for listing pages)
export function getAllBlogs(): BlogWithoutContent[] {
  return blogs
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ content, ...blogWithoutContent }) => blogWithoutContent)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Function to get a specific blog by slug
export function getBlogBySlug(slug: string): Blog | undefined {
  return blogs.find((blog) => blog.slug === slug);
}

// Function to get blog slugs (for static paths generation)
export function getAllBlogSlugs(): string[] {
  return blogs.map((blog) => blog.slug);
}
