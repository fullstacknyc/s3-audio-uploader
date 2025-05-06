// lib/content/blogs/blog-types.ts

export interface Blog {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  imageUrl?: string;
  content: string;
}

export type BlogWithoutContent = Omit<Blog, "content">;
