'use client';

import { ExternalLink, Star, MapPin, Calendar, Building2 } from 'lucide-react';
import { Container } from '@/components/layout';
import { Button, Badge } from '@/components/ui';
import { trackHostClick } from '@/lib/tracking';
import { HOSTING_TYPES, HOSTING_TYPE_COLORS, type HostingType } from '@/lib/constants';
import type { Company, CompanyTableRow } from '@/types';

interface HostHeroProps {
  company: Company;
  tableRow: CompanyTableRow;
}

export function HostHero({ company, tableRow }: HostHeroProps) {
  const hostingType = company.basicInfo.hostingType;
  const hostingTypeLabel = hostingType ? HOSTING_TYPES[hostingType] : null;
  const hostingTypeColor = hostingType ? HOSTING_TYPE_COLORS[hostingType] : '';

  const rating = company.ratings.overallRating;
  const price = tableRow.monthlyPrice;
  const renewalPrice = tableRow.renewalPrice;

  return (
    <section className="py-12 bg-gradient-to-b from-bg-secondary to-bg-primary">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* Left: Host Info */}
          <div className="flex-1">
            {/* Hosting Type Badge */}
            {hostingTypeLabel && (
              <Badge className={`mb-4 ${hostingTypeColor}`}>{hostingTypeLabel}</Badge>
            )}

            {/* Host Name */}
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {company.basicInfo.companyName}
            </h1>

            {/* Tagline / USP */}
            {company.comparisonData.uniqueSellingPoint && (
              <p className="text-lg text-text-secondary mb-6 max-w-2xl">
                {company.comparisonData.uniqueSellingPoint}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-6">
              {company.basicInfo.yearFounded && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Founded {company.basicInfo.yearFounded}
                </span>
              )}
              {company.basicInfo.headquartersCountry && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {company.basicInfo.headquartersCountry}
                </span>
              )}
              {company.basicInfo.parentCompany && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {company.basicInfo.parentCompany.split('(')[0].trim()}
                </span>
              )}
            </div>

            {/* CTA Button */}
            <a
              href={`/go/${tableRow.id}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={() => trackHostClick(tableRow.id, company.basicInfo.companyName, 'visit_site')}
            >
              <Button size="lg">
                Visit {company.basicInfo.companyName}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>

          {/* Right: Rating & Price Card */}
          <div className="lg:w-80">
            <div className="rounded-xl border border-border-subtle bg-bg-secondary p-6">
              {/* Overall Rating */}
              {rating !== null && (
                <div className="mb-6">
                  <p className="text-sm text-text-secondary mb-2">Overall Rating</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 ${
                            star <= Math.round(rating)
                              ? 'fill-accent text-accent'
                              : 'text-text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                  {company.reputation.trustpilotRating && (
                    <p className="text-xs text-text-muted mt-2">
                      Trustpilot: {company.reputation.trustpilotRating}/5
                      {company.reputation.trustpilotReviewsCount &&
                        ` (${company.reputation.trustpilotReviewsCount.toLocaleString()} reviews)`}
                    </p>
                  )}
                </div>
              )}

              {/* Pricing */}
              {price !== null && (
                <div className="border-t border-border-subtle pt-6">
                  <p className="text-sm text-text-secondary mb-2">Starting Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-accent">
                      ${price.toFixed(2)}
                    </span>
                    <span className="text-text-secondary">/month</span>
                  </div>
                  {renewalPrice && renewalPrice !== price && (
                    <p className="text-xs text-text-muted mt-1">
                      Renews at ${renewalPrice.toFixed(2)}/mo
                    </p>
                  )}
                  {company.pricing.moneyBackGuaranteeDays && (
                    <p className="text-xs text-green-400 mt-2">
                      {company.pricing.moneyBackGuaranteeDays}-day money-back guarantee
                    </p>
                  )}
                </div>
              )}

              {/* Quick Features */}
              <div className="border-t border-border-subtle pt-6 mt-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <QuickFeature
                    label="Free SSL"
                    value={company.securitySsl.freeSsl}
                  />
                  <QuickFeature
                    label="Free Domain"
                    value={company.pricing.freeDomainIncluded}
                  />
                  <QuickFeature
                    label="Free Migration"
                    value={company.migration.freeMigration}
                  />
                  <QuickFeature
                    label="24/7 Support"
                    value={company.support.liveChatHours === '24/7'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function QuickFeature({ label, value }: { label: string; value: boolean | null }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${
          value ? 'bg-green-500' : 'bg-text-muted'
        }`}
      />
      <span className={value ? 'text-foreground' : 'text-text-muted'}>{label}</span>
    </div>
  );
}
