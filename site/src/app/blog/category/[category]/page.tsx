import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { BlogCard } from '@/components/blog';
import { getPostsByCategory } from '@/lib/blog-data';
import { SITE_NAME } from '@/lib/constants';
import { BLOG_CATEGORIES, type BlogCategory } from '@/types/blog';

interface PageProps {
  params: Promise<{ category: string }>;
}

const CATEGORY_DESCRIPTIONS: Record<BlogCategory, string> = {
  guides: `In-depth web hosting buying guides from ${SITE_NAME} — how to choose, what to look for, and which providers fit your needs.`,
  comparisons: `Head-to-head web hosting comparisons from ${SITE_NAME} — providers, plans, and platforms weighed side by side on the details that matter.`,
  tutorials: `Step-by-step web hosting tutorials from ${SITE_NAME} — practical how-tos for migrating, configuring, and getting more from your host.`,
  news: `Web hosting news and analysis from ${SITE_NAME} — pricing changes, acquisitions, and industry shifts you should know about.`,
};

function isBlogCategory(value: string): value is BlogCategory {
  return BLOG_CATEGORIES.some((c) => c.value === value);
}

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((c) => ({ category: c.value }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isBlogCategory(category)) {
    return { title: 'Category Not Found' };
  }
  const label = BLOG_CATEGORIES.find((c) => c.value === category)!.label;
  const description = CATEGORY_DESCRIPTIONS[category];

  return {
    title: `${label} — Hosting Blog`,
    description,
    alternates: {
      canonical: `/blog/category/${category}`,
    },
    openGraph: {
      title: `${label} | ${SITE_NAME} Blog`,
      description,
      type: 'website',
    },
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!isBlogCategory(category)) {
    notFound();
  }

  const label = BLOG_CATEGORIES.find((c) => c.value === category)!.label;
  const posts = await getPostsByCategory(category);

  return (
    <section className="py-16">
      <Container>
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{label}</h1>
          <p className="mt-3 text-text-secondary">{CATEGORY_DESCRIPTIONS[category]}</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <Link
            href="/blog"
            className="px-4 py-2 rounded-full text-sm font-medium text-text-secondary hover:text-foreground hover:bg-bg-secondary transition-colors"
          >
            All
          </Link>
          {BLOG_CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={`/blog/category/${c.value}`}
              className={
                c.value === category
                  ? 'px-4 py-2 rounded-full text-sm font-medium bg-accent text-bg-primary'
                  : 'px-4 py-2 rounded-full text-sm font-medium text-text-secondary hover:text-foreground hover:bg-bg-secondary transition-colors'
              }
            >
              {c.label}
            </Link>
          ))}
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-text-secondary">
            No posts in this category yet.{' '}
            <Link href="/blog" className="text-accent hover:underline">
              Browse all articles
            </Link>
            .
          </p>
        )}
      </Container>
    </section>
  );
}
