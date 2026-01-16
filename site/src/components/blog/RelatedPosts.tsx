import { BlogCard } from './BlogCard';
import type { BlogPostMeta } from '@/types/blog';

interface RelatedPostsProps {
  posts: BlogPostMeta[];
  title?: string;
}

export function RelatedPosts({ posts, title = 'Related Articles' }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-6">{title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} variant="compact" />
        ))}
      </div>
    </section>
  );
}
