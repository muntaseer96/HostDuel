import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { BlogPost, BlogPostMeta, BlogCategory, BlogPostFrontmatter } from '@/types/blog';

const BLOG_DIRECTORY = path.join(process.cwd(), 'src/content/blog');

/**
 * Get all blog post slugs
 */
export function getAllPostSlugs(): string[] {
  try {
    const files = fs.readdirSync(BLOG_DIRECTORY);
    return files
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => file.replace(/\.mdx$/, ''));
  } catch {
    return [];
  }
}

/**
 * Get a single blog post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(BLOG_DIRECTORY, `${slug}.mdx`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const frontmatter = data as BlogPostFrontmatter;
    const stats = readingTime(content);

    return {
      slug,
      content,
      readingTime: Math.ceil(stats.minutes),
      ...frontmatter,
    };
  } catch {
    return null;
  }
}

/**
 * Get all blog posts with metadata (for listing pages)
 */
export async function getAllPosts(): Promise<BlogPostMeta[]> {
  const slugs = getAllPostSlugs();
  const posts: BlogPostMeta[] = [];

  for (const slug of slugs) {
    const post = await getPostBySlug(slug);
    if (post) {
      posts.push({
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        category: post.category,
        tags: post.tags,
        readingTime: post.readingTime,
        featured: post.featured,
        image: post.image,
        author: post.author,
      });
    }
  }

  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(category: BlogCategory): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.category === category);
}

/**
 * Get featured posts
 */
export async function getFeaturedPosts(): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.featured);
}

/**
 * Get related posts based on category and tags
 */
export async function getRelatedPosts(
  currentSlug: string,
  category: BlogCategory,
  tags: string[] = [],
  limit = 3
): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts();

  // Filter out current post
  const otherPosts = allPosts.filter((post) => post.slug !== currentSlug);

  // Ensure tags is an array
  const safeTags = tags || [];

  // Score posts by relevance
  const scoredPosts = otherPosts.map((post) => {
    let score = 0;

    // Same category gets 2 points
    if (post.category === category) {
      score += 2;
    }

    // Each matching tag gets 1 point
    const postTags = post.tags || [];
    const matchingTags = postTags.filter((tag) => safeTags.includes(tag));
    score += matchingTags.length;

    return { post, score };
  });

  // Sort by score and return top posts
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);
}

/**
 * Get all unique tags from all posts
 */
export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts();
  const tags = new Set<string>();

  allPosts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(tag: string): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.tags.includes(tag));
}
