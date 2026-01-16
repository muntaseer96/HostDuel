import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { Container } from '@/components/layout';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { HOSTING_TYPES, HOSTING_TYPE_COLORS, type HostingType } from '@/lib/constants';
import type { CompanyTableRow } from '@/types';

interface AlternativeHostsProps {
  hosts: CompanyTableRow[];
  currentHostName: string;
}

export function AlternativeHosts({ hosts, currentHostName }: AlternativeHostsProps) {
  if (hosts.length === 0) return null;

  return (
    <section className="py-12 bg-bg-secondary">
      <Container>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Similar Hosting Providers
        </h2>
        <p className="text-text-secondary mb-8">
          Other options to consider if {currentHostName} isn&apos;t the right fit
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {hosts.map((host) => (
            <HostCard key={host.id} host={host} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/#compare">
            <Button variant="outline">
              View All Hosts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}

function HostCard({ host }: { host: CompanyTableRow }) {
  const hostingType = host.hostingType;
  const hostingTypeLabel = hostingType ? HOSTING_TYPES[hostingType] : null;
  const hostingTypeColor = hostingType ? HOSTING_TYPE_COLORS[hostingType] : '';

  return (
    <Link href={`/hosting/${host.id}`}>
      <Card hover className="h-full">
        <CardContent className="pt-6">
          {/* Badge */}
          {hostingTypeLabel && (
            <Badge className={`mb-3 text-[10px] ${hostingTypeColor}`}>
              {hostingTypeLabel}
            </Badge>
          )}

          {/* Name */}
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {host.name}
          </h3>

          {/* Rating */}
          {host.overallRating !== null && (
            <div className="flex items-center gap-1 mb-3">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-medium text-foreground">
                {host.overallRating.toFixed(1)}
              </span>
              <span className="text-xs text-text-muted">/5</span>
            </div>
          )}

          {/* Price */}
          {host.monthlyPrice !== null && (
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-accent">
                ${host.monthlyPrice.toFixed(2)}
              </span>
              <span className="text-sm text-text-secondary">/mo</span>
            </div>
          )}

          {/* Quick features */}
          <div className="mt-4 flex flex-wrap gap-2">
            {host.freeSsl && (
              <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded">
                Free SSL
              </span>
            )}
            {host.freeDomain && (
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
                Free Domain
              </span>
            )}
            {host.freeMigration && (
              <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">
                Free Migration
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
