import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { BlogMeta } from './BlogMeta';
import type { BlogPostMeta } from '@/types/blog';

interface BlogCardProps {
  post: BlogPostMeta;
  variant?: 'default' | 'featured' | 'compact';
}

export function BlogCard({ post, variant = 'default' }: BlogCardProps) {
  if (variant === 'featured') {
    return (
      <Link href={`/blog/${post.slug}`}>
        <Card hover className="group overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6">
            {post.image && (
              <div className="relative aspect-video md:aspect-auto md:h-full overflow-hidden rounded-lg bg-bg-secondary">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            {!post.image && (
              <div className="relative aspect-video md:aspect-auto md:h-full overflow-hidden rounded-lg bg-gradient-to-br from-accent/20 to-cyan-500/20 flex items-center justify-center">
                <span className="text-6xl font-bold text-accent/30">
                  {post.title.charAt(0)}
                </span>
              </div>
            )}
            <CardContent className="flex flex-col justify-center p-6">
              <div className="mb-3">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-accent/20 text-accent">
                  Featured
                </span>
              </div>
              <BlogMeta
                date={post.date}
                readingTime={post.readingTime}
                category={post.category}
              />
              <h2 className="mt-3 text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-text-secondary line-clamp-3">
                {post.description}
              </p>
              <div className="mt-4 flex items-center text-accent font-medium">
                Read article
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/blog/${post.slug}`}>
        <Card hover className="group h-full">
          <CardContent className="p-4">
            <BlogMeta
              date={post.date}
              readingTime={post.readingTime}
              category={post.category}
              showCategory={false}
            />
            <h3 className="mt-2 font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
              {post.title}
            </h3>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card hover className="group h-full overflow-hidden">
        {post.image && (
          <div className="relative aspect-video overflow-hidden bg-bg-secondary">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        {!post.image && (
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-accent/10 to-cyan-500/10 flex items-center justify-center">
            <span className="text-5xl font-bold text-accent/20">
              {post.title.charAt(0)}
            </span>
          </div>
        )}
        <CardContent className="p-5">
          <BlogMeta
            date={post.date}
            readingTime={post.readingTime}
            category={post.category}
          />
          <h3 className="mt-3 text-lg font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-2 text-sm text-text-secondary line-clamp-2">
            {post.description}
          </p>
          <div className="mt-4 flex items-center text-sm text-accent font-medium">
            Read more
            <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
