import Link from 'next/link';
import Image from 'next/image';
import { Server, Zap, Shield, Clock, ArrowRight, CalendarCheck, FileSearch, RefreshCw } from 'lucide-react';
import { Container } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui';
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
        ...(host.overallRating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: host.overallRating,
            bestRating: 5,
            worstRating: 1,
          },
        }),
        ...(host.monthlyPrice && {
          offers: {
            '@type': 'Offer',
            price: host.monthlyPrice,
            priceCurrency: 'USD',
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border-subtle bg-gradient-to-b from-bg-secondary to-background py-16 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <Badge variant="accent" className="mb-4">
                {hosts.length} Hosts Compared
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Find Your Perfect{' '}
                <span className="text-accent">Web Host</span>
              </h1>
              <p className="mt-6 text-lg text-text-secondary">
                Compare {hosts.length} web hosting providers across 355+ data points.
                Real pricing, honest reviews, no BS.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="#compare">
                  <Button size="lg">Compare All Hosts</Button>
                </Link>
                <Link href="/quiz">
                  <Button variant="outline" size="lg">
                    Take the Quiz
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-none animate-float">
                <Image
                  src="/hero.jpeg"
                  alt="Web hosting comparison illustration"
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl shadow-accent/10"
                  priority
                />
                {/* Animated streaks and lightning around image */}
                <div className="hero-streaks">
                  {/* Orbiting streaks */}
                  <div className="hero-streak hero-streak-1" />
                  <div className="hero-streak hero-streak-2" />
                  <div className="hero-streak hero-streak-3" />
                  <div className="hero-streak hero-streak-4" />
                  {/* Lightning flashes */}
                  <div className="hero-lightning hero-lightning-1" />
                  <div className="hero-lightning hero-lightning-2" />
                  <div className="hero-lightning hero-lightning-3" />
                  {/* Floating sparks */}
                  <div className="hero-spark hero-spark-1" />
                  <div className="hero-spark hero-spark-2" />
                  <div className="hero-spark hero-spark-3" />
                </div>
              </div>
            </div>
          </div>
        </Container>

        {/* Background decoration */}
        <div className="absolute -top-24 right-0 -z-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-24 left-0 -z-10 h-96 w-96 rounded-full bg-accent-secondary/10 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </section>

      {/* Stats Section */}
      <section className="border-b border-border-subtle py-8">
        <Container>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: hosts.length.toString(), label: 'Hosting Providers' },
              { value: '355+', label: 'Data Points' },
              { value: '220+', label: 'Comparisons' },
              { value: `$${lowestPrice.toFixed(2)}`, label: 'Lowest Price' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-accent sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-text-secondary sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
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

      {/* Features Section */}
      <section className="py-16">
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Why Use HostCompare?</h2>
            <p className="mt-3 text-text-secondary">
              We go beyond the surface to give you the data that actually matters.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Server,
                title: 'Real Renewal Prices',
                description:
                  'We show you both promo AND renewal pricing. No surprises after year one.',
              },
              {
                icon: Shield,
                title: 'Hidden Fees Exposed',
                description:
                  'Backup restore fees, SSL costs, migration charges - we document it all.',
              },
              {
                icon: Clock,
                title: 'Uptime Tracking',
                description:
                  'Actual uptime guarantees and SLA credits, not just marketing promises.',
              },
              {
                icon: Zap,
                title: 'Smart Comparisons',
                description:
                  'Head-to-head comparisons within categories. Apples to apples, not oranges.',
              },
            ].map((feature) => (
              <Card key={feature.title} hover>
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-accent" />
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Trust Indicators Section */}
      <section className="border-y border-border-subtle bg-bg-secondary py-12">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-lg border border-border-subtle bg-background/50 p-4">
              <div className="rounded-full bg-accent/10 p-3">
                <CalendarCheck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Data Updated</p>
                <p className="text-sm text-text-secondary">January 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-border-subtle bg-background/50 p-4">
              <div className="rounded-full bg-accent/10 p-3">
                <FileSearch className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Methodology</p>
                <Link href="/methodology" className="text-sm text-accent hover:underline">
                  See how we review
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-border-subtle bg-background/50 p-4">
              <div className="rounded-full bg-accent/10 p-3">
                <RefreshCw className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Verified Pricing</p>
                <p className="text-sm text-text-secondary">Direct from providers</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Comparison Table Section */}
      <section id="compare" className="scroll-mt-20 border-t border-border-subtle bg-bg-secondary py-16">
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Compare All {hosts.length} Hosts
            </h2>
            <p className="mt-3 text-text-secondary">
              Search, filter, and sort to find your perfect match.
            </p>
          </div>
          <HomeComparisonSection hosts={hosts} hostingTypeCounts={hostingTypeCounts} />
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
