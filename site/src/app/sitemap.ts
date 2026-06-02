import { MetadataRoute } from 'next';
import { getAllCompanies } from '@/lib/data';
import { generateComparisonPairs, getComparisonSlug } from '@/lib/comparisons';
import { getAllPosts } from '@/lib/blog-data';
import { USE_CASES } from '@/lib/constants';
import { BLOG_CATEGORIES } from '@/types/blog';

const baseUrl = 'https://hostduel.com';

/** Parse a YYYY-MM-DD source date; fall back to the provided default if absent/invalid. */
function parseDate(value: string | null | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function maxDate(dates: Date[]): Date {
  return dates.reduce((a, b) => (b > a ? b : a), new Date(0));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [companies, comparisonPairs] = await Promise.all([
    getAllCompanies(),
    generateComparisonPairs(),
  ]);
  const posts = await getAllPosts();

  // Real source dates, not build time — so lastmod is a trustworthy freshness signal.
  const hostDate = new Map<string, Date>();
  for (const [id, company] of companies) {
    hostDate.set(id, parseDate(company.basicInfo.dataLastUpdated, new Date(0)));
  }

  const allHostDates = [...hostDate.values()];
  const allBlogDates = posts.map((p) => parseDate(p.date, new Date(0)));
  // Index/aggregate pages change whenever their underlying content does.
  const dataLastUpdated = maxDate([...allHostDates, ...allBlogDates]);
  const hostsLastUpdated = maxDate(allHostDates);
  const blogLastUpdated = maxDate(allBlogDates);

  // Static pages. Aggregate listings (home/compare/blog) track their underlying
  // content; legal/info pages use the site-wide content date — both honest signals,
  // and far better than stamping every URL with the build time.
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: dataLastUpdated, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/compare`, lastModified: hostsLastUpdated, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: blogLastUpdated, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/quiz`, lastModified: hostsLastUpdated, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: dataLastUpdated, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/methodology`, lastModified: dataLastUpdated, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/research`, lastModified: hostsLastUpdated, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/research/the-renewal-trap`, lastModified: hostsLastUpdated, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: dataLastUpdated, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: dataLastUpdated, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: dataLastUpdated, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Best-for use case pages (list hosts → freshness tracks host data)
  const bestForPages: MetadataRoute.Sitemap = USE_CASES.map((uc) => ({
    url: `${baseUrl}/best-for/${uc.id}`,
    lastModified: hostsLastUpdated,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Category pages
  const categories = ['shared', 'vps', 'managed-wordpress', 'cloud-iaas', 'website-builder'];
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: hostsLastUpdated,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Blog category pages — only those that actually have posts (no blank archives).
  const usedCategories = new Set(posts.map((p) => p.category));
  const blogCategoryPages: MetadataRoute.Sitemap = BLOG_CATEGORIES.filter((c) =>
    usedCategories.has(c.value)
  ).map((c) => ({
    url: `${baseUrl}/blog/category/${c.value}`,
    lastModified: blogLastUpdated,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  // Dynamic host pages — real per-host update date
  const hostPages: MetadataRoute.Sitemap = [...hostDate.entries()].map(([id, date]) => ({
    url: `${baseUrl}/hosting/${id}`,
    lastModified: date,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Comparison pages — newer of the two hosts' update dates
  const comparisonPages: MetadataRoute.Sitemap = comparisonPairs.map(([a, b]) => ({
    url: `${baseUrl}/compare/${getComparisonSlug(a, b)}`,
    lastModified: maxDate([hostDate.get(a) ?? hostsLastUpdated, hostDate.get(b) ?? hostsLastUpdated]),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Blog post pages — real frontmatter date
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: parseDate(post.date, blogLastUpdated),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...bestForPages,
    ...categoryPages,
    ...blogCategoryPages,
    ...hostPages,
    ...comparisonPages,
    ...blogPages,
  ];
}
