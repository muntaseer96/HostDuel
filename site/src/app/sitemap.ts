import { MetadataRoute } from 'next';
import { getAllCompanyIds } from '@/lib/data';
import { generateComparisonPairs, getComparisonSlug } from '@/lib/comparisons';
import { getAllPostSlugs } from '@/lib/blog-data';
import { USE_CASES } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [hostIds, comparisonPairs] = await Promise.all([
    getAllCompanyIds(),
    generateComparisonPairs(),
  ]);

  const blogSlugs = getAllPostSlugs();

  const baseUrl = 'https://hostduel.com';
  const currentDate = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/methodology`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Best-for use case pages
  const bestForPages: MetadataRoute.Sitemap = USE_CASES.map((uc) => ({
    url: `${baseUrl}/best-for/${uc.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Category pages
  const categories = ['shared', 'vps', 'managed-wordpress', 'cloud-iaas', 'website-builder'];
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic host pages
  const hostPages: MetadataRoute.Sitemap = hostIds.map((id) => ({
    url: `${baseUrl}/hosting/${id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Comparison pages
  const comparisonPages: MetadataRoute.Sitemap = comparisonPairs.map(([a, b]) => ({
    url: `${baseUrl}/compare/${getComparisonSlug(a, b)}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...bestForPages,
    ...categoryPages,
    ...hostPages,
    ...comparisonPages,
    ...blogPages,
  ];
}
