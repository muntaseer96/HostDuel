import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout';
import { Card, Badge, Button } from '@/components/ui';
import { getTopByUseCase, companyToTableRow } from '@/lib/data';
import { SITE_NAME, SITE_DOMAIN } from '@/lib/constants';
import { Star, PenTool, ShoppingCart, Briefcase, Code, GraduationCap, Building, ExternalLink, ChevronRight } from 'lucide-react';

type UseCase = 'blogger' | 'ecommerce' | 'agency' | 'developer' | 'beginner' | 'enterprise';

const useCaseConfig: Record<UseCase, {
  name: string;
  title: string;
  description: string;
  metaDescription: string;
  keywords: string[];
  icon: typeof PenTool;
  color: string;
  bgColor: string;
}> = {
  blogger: {
    name: 'Bloggers',
    title: 'Best Web Hosting for Bloggers',
    description: 'These hosting providers excel at supporting blogs and content-driven websites. They offer WordPress optimization, fast loading times, and easy-to-use interfaces perfect for content creators.',
    metaDescription: 'Compare the best web hosting providers for bloggers in 2025. Find WordPress-optimized hosts with fast speeds, easy setup, and excellent support for content creators.',
    keywords: ['best hosting for bloggers', 'blogger hosting', 'WordPress hosting', 'blog hosting', 'content creator hosting', 'blogging platform'],
    icon: PenTool,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
  },
  ecommerce: {
    name: 'eCommerce',
    title: 'Best Web Hosting for eCommerce',
    description: 'These hosting providers are optimized for online stores. They offer WooCommerce support, SSL certificates, fast checkout speeds, and the reliability your store needs.',
    metaDescription: 'Compare the best web hosting providers for eCommerce and online stores in 2025. Find WooCommerce-optimized hosts with fast speeds, security, and reliability.',
    keywords: ['best ecommerce hosting', 'online store hosting', 'WooCommerce hosting', 'ecommerce web hosting', 'shop hosting', 'retail hosting'],
    icon: ShoppingCart,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  agency: {
    name: 'Agencies',
    title: 'Best Web Hosting for Agencies',
    description: 'These hosting providers make it easy to manage multiple client websites. They offer reseller features, white-label options, and the tools agencies need to scale.',
    metaDescription: 'Compare the best web hosting providers for agencies in 2025. Find hosts with reseller features, client management tools, and scalable infrastructure.',
    keywords: ['best hosting for agencies', 'agency hosting', 'reseller hosting', 'white label hosting', 'client hosting', 'web agency hosting'],
    icon: Briefcase,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  developer: {
    name: 'Developers',
    title: 'Best Web Hosting for Developers',
    description: 'These hosting providers offer the tools developers need: SSH access, Git deployment, staging environments, CLI access, and support for modern frameworks.',
    metaDescription: 'Compare the best web hosting providers for developers in 2025. Find hosts with SSH, Git, staging, CLI access, and support for Node.js, Python, and more.',
    keywords: ['best hosting for developers', 'developer hosting', 'SSH hosting', 'Git deployment hosting', 'Node.js hosting', 'Python hosting'],
    icon: Code,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  beginner: {
    name: 'Beginners',
    title: 'Best Web Hosting for Beginners',
    description: 'These hosting providers make getting started easy. They offer intuitive control panels, one-click installers, helpful tutorials, and responsive customer support.',
    metaDescription: 'Compare the best web hosting providers for beginners in 2025. Find easy-to-use hosts with great support, one-click installers, and beginner-friendly features.',
    keywords: ['best hosting for beginners', 'beginner web hosting', 'easy hosting', 'simple hosting', 'starter hosting', 'first website hosting'],
    icon: GraduationCap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  enterprise: {
    name: 'Enterprise',
    title: 'Best Web Hosting for Enterprise',
    description: 'These hosting providers meet enterprise requirements: compliance certifications, SLAs, dedicated support, advanced security, and the scalability large organizations need.',
    metaDescription: 'Compare the best web hosting providers for enterprise in 2025. Find hosts with compliance certifications, SLAs, dedicated support, and enterprise-grade security.',
    keywords: ['best enterprise hosting', 'enterprise web hosting', 'business hosting', 'corporate hosting', 'compliant hosting', 'SLA hosting'],
    icon: Building,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
};

const validUseCases = Object.keys(useCaseConfig) as UseCase[];

interface PageProps {
  params: Promise<{ useCase: string }>;
}

export async function generateStaticParams() {
  return validUseCases.map((useCase) => ({ useCase }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { useCase } = await params;

  if (!validUseCases.includes(useCase as UseCase)) {
    return {
      title: 'Not Found',
    };
  }

  const config = useCaseConfig[useCase as UseCase];

  return {
    title: `${config.title} | ${SITE_NAME}`,
    description: config.metaDescription,
    keywords: config.keywords,
    alternates: {
      canonical: `/best-for/${useCase}`,
    },
    openGraph: {
      title: `${config.title} | ${SITE_NAME}`,
      description: config.metaDescription,
      type: 'website',
      url: `${SITE_DOMAIN}/best-for/${useCase}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.title} | ${SITE_NAME}`,
      description: config.metaDescription,
    },
  };
}

export default async function BestForPage({ params }: PageProps) {
  const { useCase } = await params;

  if (!validUseCases.includes(useCase as UseCase)) {
    notFound();
  }

  const config = useCaseConfig[useCase as UseCase];
  const Icon = config.icon;

  const topHosts = await getTopByUseCase(useCase as UseCase, 10);
  const hosts = topHosts.map(({ id, company, score }) => ({
    ...companyToTableRow(id, company),
    suitabilityScore: score,
  }));

  // JSON-LD Structured Data - ItemList for rankings
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: config.title,
    description: config.metaDescription,
    numberOfItems: hosts.length,
    itemListElement: hosts.map((host, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: host.name,
      url: `${SITE_DOMAIN}/hosting/${host.id}`,
      item: {
        '@type': 'Product',
        name: host.name,
        description: `${host.name} - rated ${host.suitabilityScore}/5 for ${config.name.toLowerCase()}`,
        url: `${SITE_DOMAIN}/hosting/${host.id}`,
        image: `${SITE_DOMAIN}/logo.png`,
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
            availability: 'https://schema.org/InStock',
          },
        }),
      },
    })),
  };

  // Breadcrumb schema
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
        name: 'Best For',
        item: `${SITE_DOMAIN}/#best-for`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: config.name,
        item: `${SITE_DOMAIN}/best-for/${useCase}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumbs */}
      <section className="border-b border-border-subtle bg-bg-secondary">
        <Container>
          <nav className="py-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-text-muted">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-4 w-4" />
              <li>
                <span className="text-foreground">{config.name}</span>
              </li>
            </ol>
          </nav>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className={`rounded-lg p-3 ${config.bgColor}`}>
                <Icon className={`h-8 w-8 ${config.color}`} />
              </div>
              <Badge variant="accent">Best For</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">{config.title}</h1>
            <p className="text-lg text-text-secondary max-w-2xl">
              {config.description}
            </p>
          </div>

          <div className="space-y-4">
            {hosts.map((host, index) => (
              <Card key={host.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 md:w-16">
                    <span className="text-2xl font-bold text-text-muted">#{index + 1}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">{host.name}</h2>
                        {host.hostingType && (
                          <span className="text-sm text-text-muted capitalize">{host.hostingType.replace('-', ' ')}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {host.overallRating && (
                          <div className="flex items-center gap-1 text-accent">
                            <Star className="h-5 w-5 fill-current" />
                            <span className="font-semibold text-lg">{host.overallRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-4">
                      {host.monthlyPrice && (
                        <span>From <span className="text-foreground font-semibold">${host.monthlyPrice}/mo</span></span>
                      )}
                      {host.freeSsl && <span className="text-success">Free SSL</span>}
                      {host.freeDomain && <span className="text-success">Free Domain</span>}
                      {host.freeMigration && <span className="text-success">Free Migration</span>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link href={`/hosting/${host.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      {host.websiteUrl && (
                        <Link href={`/go/${host.id}`}>
                          <Button variant="primary" size="sm" className="gap-1">
                            Visit Site <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="md:w-32 text-right">
                    <div className="text-sm text-text-muted mb-1">{config.name} Score</div>
                    <div className={`text-2xl font-bold ${config.color}`}>
                      {host.suitabilityScore}/5
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {hosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-muted">No hosting providers found for this category.</p>
            </div>
          )}

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/compare">
              <Button variant="outline">Compare All Hosts</Button>
            </Link>
            <Link href="/quiz">
              <Button variant="primary">Take the Quiz</Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
