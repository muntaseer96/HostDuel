export interface Author {
  name: string;
  avatar?: string;
  bio?: string;
  twitter?: string;
}

export type BlogCategory = 'guides' | 'comparisons' | 'tutorials' | 'news';

export interface BlogPostFrontmatter {
  title: string;
  description: string;
  date: string;
  updatedDate?: string;
  author: Author;
  category: BlogCategory;
  tags: string[];
  image?: string;
  featured?: boolean;
}

export interface BlogPost extends BlogPostFrontmatter {
  slug: string;
  content: string;
  readingTime: number;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: BlogCategory;
  tags: string[];
  readingTime: number;
  featured?: boolean;
  image?: string;
  author: Author;
}

export interface TOCItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export const BLOG_CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: 'guides', label: 'Guides' },
  { value: 'comparisons', label: 'Comparisons' },
  { value: 'tutorials', label: 'Tutorials' },
  { value: 'news', label: 'News' },
];

export const CATEGORY_COLORS: Record<BlogCategory, string> = {
  guides: 'bg-accent/20 text-accent',
  comparisons: 'bg-cyan-500/20 text-cyan-400',
  tutorials: 'bg-purple-500/20 text-purple-400',
  news: 'bg-amber-500/20 text-amber-400',
};
