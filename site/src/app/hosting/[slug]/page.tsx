import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCompanyById, getTableRowById, getAllCompanyIds, getAllTableRows } from '@/lib/data';
import { Container } from '@/components/layout';
import { DataDisclaimer } from '@/components/ui';
import { SITE_NAME, SITE_DOMAIN, HOSTING_TYPES, type HostingType } from '@/lib/constants';
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
import type { Company, CompanyTableRow } from '@/types';

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
  const description = `${name} review and comparison. See pricing, features, performance ratings, and compare with alternatives. ${company.comparisonData.uniqueSellingPoint || ''}`;

  return {
    title: `${name} Review - ${hostingType}`,
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
      title: `${name} Review - ${hostingType} | ${SITE_NAME}`,
      description,
      type: 'website',
      url: `${SITE_DOMAIN}/hosting/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} Review | ${SITE_NAME}`,
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
