import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyById, getTableRowById, getAllCompanyIds, getAllTableRows } from '@/lib/data';
import { getRelatedComparisons } from '@/lib/comparisons';
import { TOP_HOSTS } from '@/lib/programmatic';
import { Container } from '@/components/layout';
import { DataDisclaimer } from '@/components/ui';
import { SITE_NAME, SITE_DOMAIN, HOSTING_TYPES } from '@/lib/constants';
import {
  Breadcrumbs,
  HostHero,
  PricingCards,
  ProsCons,
  RatingsBreakdown,
  SpecsGrid,
  HostFAQ,
  AlternativeHosts,
} from '@/components/host';
import type { Company } from '@/types';

interface HostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all hosts
export async function generateStaticParams() {
  const ids = await getAllCompanyIds();
  return ids.map((slug) => ({ slug }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: HostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyById(slug);

  if (!company) {
    return { title: 'Host Not Found' };
  }

  const name = company.basicInfo.companyName;
  const hostingType = company.basicInfo.hostingType
    ? HOSTING_TYPES[company.basicInfo.hostingType]
    : 'Web Hosting';
  const year = new Date().getFullYear();
  // Front-load "<Name> <Type>" so exact queries like "bluehost shared hosting"
  // match the title, and add the year as a freshness signal.
  const description = `${name} ${hostingType} reviewed for ${year}: promo vs renewal pricing, real pros and cons, uptime, support, and how it compares to alternatives.`;

  return {
    title: `${name} ${hostingType} Review (${year})`,
    description,
    alternates: {
      canonical: `/hosting/${slug}`,
    },
    keywords: [
      name,
      `${name} review`,
      `${name} hosting`,
      hostingType,
      'hosting comparison',
      'web hosting',
    ],
    openGraph: {
      title: `${name} ${hostingType} Review (${year}) | ${SITE_NAME}`,
      description,
      type: 'website',
      url: `${SITE_DOMAIN}/hosting/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} ${hostingType} Review (${year}) | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function HostPage({ params }: HostPageProps) {
  const { slug } = await params;

  // Fetch both Company (full data) and TableRow (simplified)
  const [company, tableRow] = await Promise.all([
    getCompanyById(slug),
    getTableRowById(slug),
  ]);

  if (!company || !tableRow) {
    notFound();
  }

  // Get alternative hosts (same hosting type, excluding current)
  const allHosts = await getAllTableRows();
  const alternatives = allHosts
    .filter(
      (h) =>
        h.id !== slug &&
        h.hostingType === company.basicInfo.hostingType
    )
    .sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0))
    .slice(0, 4);

  // Head-to-head comparisons for this host — internal links into the /compare
  // cluster (funnels crawl depth + link equity to those pages). Names are
  // resolved from allHosts so this adds no extra data reads.
  const nameById = new Map(allHosts.map((h) => [h.id, h.name] as const));
  const hostComparisons = (await getRelatedComparisons(slug, '', 8)).map((c) => ({
    slug: c.slug,
    otherName: nameById.get(c.hostA === slug ? c.hostB : c.hostA) ?? null,
  }));

  // Build FAQ items from faqContent
  const faqItems = buildFaqItems(company);

  // JSON-LD Structured Data
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: company.basicInfo.companyName,
    description: company.comparisonData.uniqueSellingPoint || company.editorial.bestFor,
    url: company.basicInfo.websiteUrl,
    image: 'https://hostduel.com/logo.png',
    aggregateRating: company.ratings.overallRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: company.ratings.overallRating,
          bestRating: 5,
          worstRating: 1,
          reviewCount: company.reputation.trustpilotReviewsCount || 1,
        }
      : undefined,
    offers: tableRow.monthlyPrice
      ? {
          '@type': 'Offer',
          price: tableRow.monthlyPrice,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
        }
      : undefined,
    brand: {
      '@type': 'Brand',
      name: company.basicInfo.companyName,
    },
  };

  const faqSchema =
    faqItems.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }
      : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_DOMAIN,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Compare Hosts',
        item: `${SITE_DOMAIN}/#compare`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: company.basicInfo.companyName,
        item: `${SITE_DOMAIN}/hosting/${slug}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumbs */}
      <section className="border-b border-border-subtle bg-bg-secondary">
        <Container>
          <div className="py-4">
            <Breadcrumbs hostName={company.basicInfo.companyName} />
          </div>
        </Container>
      </section>

      {/* Hero Section */}
      <HostHero company={company} tableRow={tableRow} />

      {/* Pricing Cards */}
      <PricingCards company={company} />

      {/* Pros/Cons + Ratings */}
      <section className="py-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <ProsCons company={company} />
            <RatingsBreakdown company={company} />
          </div>
        </Container>
      </section>

      {/* Specs Grid */}
      <SpecsGrid company={company} tableRow={tableRow} />

      {/* Data Disclaimer */}
      <section className="pb-8">
        <Container>
          <DataDisclaimer />
        </Container>
      </section>

      {/* FAQ */}
      {faqItems.length > 0 && <HostFAQ items={faqItems} hostName={company.basicInfo.companyName} />}

      {/* Alternative Hosts */}
      {alternatives.length > 0 && (
        <AlternativeHosts hosts={alternatives} currentHostName={company.basicInfo.companyName} />
      )}

      {/* Head-to-head comparisons — internal links into the /compare cluster */}
      {hostComparisons.length > 0 && (
        <section className="pb-12">
          <Container>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {company.basicInfo.companyName} head-to-head comparisons
            </h2>
            <p className="text-sm text-text-secondary mb-5 max-w-2xl">
              See how {company.basicInfo.companyName} stacks up against other hosts
              on pricing, performance, and features:
            </p>
            <div className="flex flex-wrap gap-2.5">
              {hostComparisons
                .filter((c) => c.otherName)
                .map((c) => (
                  <Link
                    key={c.slug}
                    href={`/compare/${c.slug}`}
                    className="inline-flex items-center rounded-lg border border-border-subtle bg-bg-secondary px-3.5 py-2 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
                  >
                    {company.basicInfo.companyName} vs {c.otherName}
                  </Link>
                ))}
            </div>
          </Container>
        </section>
      )}

      {/* Link to the dedicated, ranked alternatives breakdown (curated hosts only) */}
      {(TOP_HOSTS as readonly string[]).includes(slug) && (
        <section className="pb-12">
          <Container>
            <Link
              href={`/alternatives/${slug}`}
              className="inline-flex items-center gap-1 text-accent font-medium hover:underline"
            >
              See the full ranked breakdown of {company.basicInfo.companyName} alternatives →
            </Link>
          </Container>
        </section>
      )}
    </>
  );
}

// Helper to build FAQ items from faqContent
function buildFaqItems(company: Company): Array<{ question: string; answer: string }> {
  const faq = company.faqContent;
  const items: Array<{ question: string; answer: string }> = [];
  const name = company.basicInfo.companyName;

  if (faq.faqIsThisHostGood) {
    items.push({ question: `Is ${name} a good web host?`, answer: faq.faqIsThisHostGood });
  }
  if (faq.faqWhoOwnsThisHost) {
    items.push({ question: `Who owns ${name}?`, answer: faq.faqWhoOwnsThisHost });
  }
  if (faq.faqHowMuchDoesItCost) {
    items.push({ question: `How much does ${name} cost?`, answer: faq.faqHowMuchDoesItCost });
  }
  if (faq.faqIsItBeginnerFriendly) {
    items.push({ question: `Is ${name} beginner-friendly?`, answer: faq.faqIsItBeginnerFriendly });
  }
  if (faq.faqDoesItIncludeEmail) {
    items.push({ question: `Does ${name} include email hosting?`, answer: faq.faqDoesItIncludeEmail });
  }
  if (faq.faqCanIHostWordPress) {
    items.push({ question: `Can I host WordPress on ${name}?`, answer: faq.faqCanIHostWordPress });
  }
  if (faq.faqWhatsTheUptime) {
    items.push({ question: `What is ${name}'s uptime guarantee?`, answer: faq.faqWhatsTheUptime });
  }
  if (faq.faqCanICancelAnytime) {
    items.push({ question: `Can I cancel ${name} anytime?`, answer: faq.faqCanICancelAnytime });
  }

  return items;
}
