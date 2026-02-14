import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { BlogHero, BlogCard } from '@/components/blog';
import { getAllPosts, getFeaturedPosts } from '@/lib/blog-data';
import { SITE_NAME } from '@/lib/constants';
import { BLOG_CATEGORIES } from '@/types/blog';
import { ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description: `Expert web hosting guides, in-depth comparisons, and practical tips from ${SITE_NAME}. Learn how to choose the best hosting for your website with our comprehensive reviews and buying guides.`,
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description: `Expert web hosting guides, in-depth comparisons, and practical tips from ${SITE_NAME}. Learn how to choose the best hosting for your website.`,
    type: 'website',
  },
};

export default async function BlogPage() {
  const allPosts = await getAllPosts();
  const featuredPosts = await getFeaturedPosts();

  // Get the first featured post for the hero, rest go to the grid
  const heroPost = featuredPosts[0];
  const regularPosts = allPosts.filter((post) => post.slug !== heroPost?.slug);

  // If no posts yet, show a "coming soon" state with newsletter signup
  if (allPosts.length === 0) {
    return (
      <section className="py-16">
        <Container>
          <BlogHero />

          <div className="max-w-2xl mx-auto text-center">
            <div className="p-8 rounded-xl bg-bg-secondary border border-border-subtle">
              <BookOpen className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Our first articles are on the way
              </h2>
              <p className="text-text-secondary">
                We&apos;re writing in-depth hosting guides, comparison articles, and industry insights.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-bg-primary font-medium hover:bg-accent-light transition-colors"
              >
                Take the Hosting Quiz
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border-subtle text-foreground font-medium hover:bg-bg-secondary transition-colors"
              >
                Compare Hosts
              </Link>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-16">
      <Container>
        <BlogHero />

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <Link
            href="/blog"
            className="px-4 py-2 rounded-full text-sm font-medium bg-accent text-bg-primary"
          >
            All
          </Link>
          {BLOG_CATEGORIES.map((category) => (
            <Link
              key={category.value}
              href={`/blog/category/${category.value}`}
              className="px-4 py-2 rounded-full text-sm font-medium text-text-secondary hover:text-foreground hover:bg-bg-secondary transition-colors"
            >
              {category.label}
            </Link>
          ))}
        </div>

        {/* Featured Post */}
        {heroPost && (
          <div className="mb-12">
            <BlogCard post={heroPost} variant="featured" />
          </div>
        )}

        {/* Posts Grid */}
        {regularPosts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
