import { MetadataRoute } from 'next';
import { getAllCompanyIds } from '@/lib/data';
import { generateComparisonPairs, getComparisonSlug } from '@/lib/comparisons';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [hostIds, comparisonPairs] = await Promise.all([
    getAllCompanyIds(),
    generateComparisonPairs(),
  ]);

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
      url: `${baseUrl}/methodology`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

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

  return [...staticPages, ...hostPages, ...comparisonPages];
}
