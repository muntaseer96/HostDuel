import { Check, AlertCircle } from 'lucide-react';
import { Container } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import type { Company } from '@/types';

interface PricingCardsProps {
  company: Company;
}

interface PricingTier {
  name: string;
  promoPrice: number | null;
  renewalPrice: number | null;
  features: string[];
  highlighted?: boolean;
}

export function PricingCards({ company }: PricingCardsProps) {
  const pricing = company.pricing;

  // Build pricing tiers based on available data
  const tiers: PricingTier[] = [];

  // Shared Hosting
  if (pricing.sharedHostingMonthlyPromo !== null) {
    tiers.push({
      name: 'Shared Hosting',
      promoPrice: pricing.sharedHostingMonthlyPromo,
      renewalPrice: pricing.sharedHostingMonthlyRenewal,
      features: buildFeatures(company, 'shared'),
      highlighted: true,
    });
  }

  // WordPress Hosting
  if (
    pricing.wordpressHostingMonthlyPromo !== null &&
    pricing.wordpressHostingMonthlyPromo !== pricing.sharedHostingMonthlyPromo
  ) {
    tiers.push({
      name: 'WordPress Hosting',
      promoPrice: pricing.wordpressHostingMonthlyPromo,
      renewalPrice: pricing.wordpressHostingMonthlyRenewal,
      features: buildFeatures(company, 'wordpress'),
    });
  }

  // VPS Hosting
  if (pricing.vpsMonthlyLowest !== null) {
    tiers.push({
      name: 'VPS Hosting',
      promoPrice: pricing.vpsMonthlyLowest,
      renewalPrice: pricing.vpsMonthlyRenewal,
      features: buildFeatures(company, 'vps'),
    });
  }

  // Cloud Hosting
  if (pricing.cloudHostingMonthlyLowest !== null) {
    tiers.push({
      name: 'Cloud Hosting',
      promoPrice: pricing.cloudHostingMonthlyLowest,
      renewalPrice: null,
      features: buildFeatures(company, 'cloud'),
    });
  }

  // Dedicated Hosting
  if (pricing.dedicatedMonthlyLowest !== null) {
    tiers.push({
      name: 'Dedicated Server',
      promoPrice: pricing.dedicatedMonthlyLowest,
      renewalPrice: pricing.dedicatedMonthlyRenewal,
      features: buildFeatures(company, 'dedicated'),
    });
  }

  if (tiers.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-bg-secondary">
      <Container>
        <h2 className="text-2xl font-bold text-foreground mb-2">Pricing Plans</h2>
        <p className="text-text-secondary mb-8">
          Compare {company.basicInfo.companyName}&apos;s hosting plans
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              variant={tier.highlighted ? 'elevated' : 'default'}
              className={tier.highlighted ? 'border-accent/50 relative' : ''}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-bg-primary text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
              </CardHeader>

              <CardContent>
                {/* Price */}
                <div className="mb-6">
                  {tier.promoPrice !== null ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-accent">
                          ${tier.promoPrice.toFixed(2)}
                        </span>
                        <span className="text-text-secondary">/mo</span>
                      </div>
                      {tier.renewalPrice && tier.renewalPrice !== tier.promoPrice && (
                        <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Renews at ${tier.renewalPrice.toFixed(2)}/mo
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-text-muted">Contact for pricing</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={company.basicInfo.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="block"
                >
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? 'primary' : 'outline'}
                  >
                    Get Started
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Money Back Guarantee */}
        {company.pricing.moneyBackGuaranteeDays && (
          <p className="text-center text-sm text-text-muted mt-8">
            All plans include a {company.pricing.moneyBackGuaranteeDays}-day money-back guarantee
          </p>
        )}
      </Container>
    </section>
  );
}

function buildFeatures(company: Company, type: string): string[] {
  const features: string[] = [];
  const specs = company.technicalSpecs;
  const security = company.securitySsl;
  const support = company.support;

  // Storage
  if (specs.storageGb) {
    features.push(
      specs.storageGb === 'Unlimited'
        ? 'Unlimited SSD Storage'
        : `${specs.storageGb} GB ${specs.storageType || 'SSD'} Storage`
    );
  }

  // Bandwidth
  if (specs.bandwidthGb) {
    features.push(
      specs.bandwidthGb === 'Unlimited'
        ? 'Unmetered Bandwidth'
        : `${specs.bandwidthGb} GB Bandwidth`
    );
  }

  // Free SSL
  if (security.freeSsl) {
    features.push('Free SSL Certificate');
  }

  // Free Domain
  if (company.pricing.freeDomainIncluded) {
    features.push('Free Domain (1 year)');
  }

  // Type-specific features
  if (type === 'wordpress' || type === 'shared') {
    if (company.wordpressFeatures.wordpressAutoInstall) {
      features.push('1-Click WordPress Install');
    }
    if (company.wordpressFeatures.wordpressStaging) {
      features.push('Staging Environment');
    }
  }

  if (type === 'vps' || type === 'dedicated' || type === 'cloud') {
    if (specs.sshAccess) {
      features.push('Full SSH Access');
    }
    if (specs.nodejsSupport) {
      features.push('Node.js Support');
    }
  }

  // Support
  if (support.liveChatAvailable && support.liveChatHours === '24/7') {
    features.push('24/7 Live Chat Support');
  } else if (support.liveChatAvailable) {
    features.push('Live Chat Support');
  }

  // CDN
  if (company.serverPerformance.cdnIncluded) {
    features.push(`CDN Included${company.serverPerformance.cdnProvider ? ` (${company.serverPerformance.cdnProvider})` : ''}`);
  }

  return features.slice(0, 6); // Limit to 6 features per tier
}
