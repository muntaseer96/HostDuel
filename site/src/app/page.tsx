import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout';
import { Button } from '@/components/ui';
import { HomeComparisonSection } from '@/components/comparison';
import { BestForCards, TopPicks } from '@/components/home';
import { getAllTableRows, getHostingTypeCounts } from '@/lib/data';

// Generate ItemList JSON-LD schema for hosts
function generateHostListSchema(hosts: { id: string; name: string; overallRating: number | null; monthlyPrice: number | null }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Web Hosting Comparison',
    description: 'Compare web hosting providers with ratings, pricing, and features',
    numberOfItems: hosts.length,
    itemListElement: hosts.slice(0, 50).map((host, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: host.name,
        url: `https://hostduel.com/hosting/${host.id}`,
        image: 'https://hostduel.com/logo.png',
        ...(host.overallRating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: host.overallRating,
            bestRating: 5,
            worstRating: 1,
            ratingCount: 1,
          },
        }),
        ...(host.monthlyPrice && {
          offers: {
            '@type': 'Offer',
            price: host.monthlyPrice,
            priceCurrency: 'USD',
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            availability: 'https://schema.org/InStock',
          },
        }),
      },
    })),
  };
}

export default async function Home() {
  // Fetch data server-side
  const [hosts, hostingTypeCounts] = await Promise.all([
    getAllTableRows(),
    getHostingTypeCounts(),
  ]);

  // Generate JSON-LD schema
  const hostListSchema = generateHostListSchema(hosts);

  // Get top picks for shared hosting (sorted by rating)
  const sharedHosts = hosts
    .filter((h) => h.hostingType === 'shared')
    .sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0));

  const managedWpHosts = hosts
    .filter((h) => h.hostingType === 'managed-wordpress')
    .sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0));

  // Calculate stats
  const lowestPrice = Math.min(
    ...hosts.filter((h) => h.monthlyPrice !== null).map((h) => h.monthlyPrice as number)
  );

  return (
    <>
      {/* JSON-LD Structured Data for Host List */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hostListSchema) }}
      />

      {/* Hero + Comparison Table — the table is the product, so it leads. */}
      <section
        id="compare"
        className="relative overflow-hidden scroll-mt-20 border-b border-border-subtle bg-gradient-to-b from-bg-secondary to-background py-12 lg:py-16"
      >
        <Container>
          {/* Hero header */}
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Find Your Perfect{' '}
              <span className="text-accent">Web Host</span>
            </h1>
            <p className="mt-5 text-lg text-text-secondary">
              Compare {hosts.length} hosting providers across 355+ data points — real promo
              AND renewal pricing, honest ratings, no BS. Search, filter, and sort below.
            </p>

            {/* Compact trust strip */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-text-secondary">
              <span>
                <strong className="text-accent">{hosts.length}</strong> providers
              </span>
              <span className="text-border-subtle">•</span>
              <span>
                <strong className="text-accent">355+</strong> data points
              </span>
              <span className="text-border-subtle">•</span>
              <span>
                from <strong className="text-accent">${lowestPrice.toFixed(2)}</strong>/mo
              </span>
              <span className="text-border-subtle">•</span>
              <Link href="/quiz" className="font-medium text-accent hover:underline">
                Not sure? Take the quiz →
              </Link>
            </div>
          </div>

          {/* The main product: the comparison table with filters */}
          <HomeComparisonSection hosts={hosts} hostingTypeCounts={hostingTypeCounts} />
        </Container>

        {/* Background decoration */}
        <div className="absolute -top-24 right-0 -z-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-24 left-0 -z-10 h-96 w-96 rounded-full bg-accent-secondary/10 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </section>

      {/* Best For Section */}
      <section className="py-16">
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Best Hosting For...</h2>
            <p className="mt-3 text-text-secondary">
              Find the perfect match for your specific needs.
            </p>
          </div>
          <BestForCards />
        </Container>
      </section>

      {/* Top Picks Section */}
      <section className="border-y border-border-subtle bg-bg-secondary py-16">
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Top Rated Hosts</h2>
            <p className="mt-3 text-text-secondary">
              Our highest-rated picks in each category.
            </p>
          </div>
          <div className="space-y-12">
            <TopPicks hosts={sharedHosts} category="shared" categoryLabel="Best Shared Hosting" />
            <TopPicks
              hosts={managedWpHosts}
              category="managed-wordpress"
              categoryLabel="Best Managed WordPress"
            />
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <Container size="md">
          <div className="rounded-2xl bg-gradient-to-r from-accent/20 to-accent-secondary/20 p-8 text-center lg:p-12">
            <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
              Not Sure Where to Start?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-text-secondary">
              Take our 2-minute quiz to get personalized hosting recommendations based on your
              specific needs.
            </p>
            <Link href="/quiz">
              <Button size="lg" className="mt-6">
                Find My Perfect Host
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
