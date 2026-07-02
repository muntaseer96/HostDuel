import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout';
import { BlogHero, BlogCard, BlogPagination } from '@/components/blog';
import {
  getAllPosts,
  getFeaturedPosts,
  getNonEmptyCategories,
  BLOG_POSTS_PER_PAGE,
} from '@/lib/blog-data';
import { SITE_NAME } from '@/lib/constants';

interface PageProps {
  params: Promise<{ page: string }>;
}

/** Posts that appear in the paginated grid (all posts minus the page-1 hero). */
async function getGridPosts() {
  const [allPosts, featuredPosts] = await Promise.all([getAllPosts(), getFeaturedPosts()]);
  const heroSlug = featuredPosts[0]?.slug;
  return allPosts.filter((post) => post.slug !== heroSlug);
}

export async function generateStaticParams() {
  const regularPosts = await getGridPosts();
  const totalPages = Math.max(1, Math.ceil(regularPosts.length / BLOG_POSTS_PER_PAGE));
  // Page 1 lives at /blog; only generate 2..totalPages here.
  const pages: Array<{ page: string }> = [];
  for (let p = 2; p <= totalPages; p++) pages.push({ page: String(p) });
  return pages;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;
  const pageNum = Number(page);

  return {
    title: `Blog - Page ${pageNum}`,
    description: `Web hosting guides, comparisons, and tips from ${SITE_NAME} — page ${pageNum}.`,
    alternates: {
      canonical: `/blog/page/${pageNum}`,
    },
    // Deeper pages carry little standalone search value; keep them crawlable
    // (links followed) but out of the index to avoid thin paginated duplicates.
    robots: { index: false, follow: true },
  };
}

export default async function BlogPaginatedPage({ params }: PageProps) {
  const { page } = await params;
  const pageNum = Number(page);

  const regularPosts = await getGridPosts();
  const totalPages = Math.max(1, Math.ceil(regularPosts.length / BLOG_POSTS_PER_PAGE));

  // Reject non-integer, page 1 (canonical /blog), and out-of-range pages.
  if (!Number.isInteger(pageNum) || pageNum < 2 || pageNum > totalPages) {
    notFound();
  }

  const navCategories = await getNonEmptyCategories();
  const start = (pageNum - 1) * BLOG_POSTS_PER_PAGE;
  const pagePosts = regularPosts.slice(start, start + BLOG_POSTS_PER_PAGE);

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
          {navCategories.map((category) => (
            <Link
              key={category.value}
              href={`/blog/category/${category.value}`}
              className="px-4 py-2 rounded-full text-sm font-medium text-text-secondary hover:text-foreground hover:bg-bg-secondary transition-colors"
            >
              {category.label}
            </Link>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pagePosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        <BlogPagination currentPage={pageNum} totalPages={totalPages} />
      </Container>
    </section>
  );
}
