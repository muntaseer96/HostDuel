import Link from 'next/link';
import { Star, ExternalLink, ArrowRight } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import type { CompanyTableRow } from '@/types';

interface TopPicksProps {
  hosts: CompanyTableRow[];
  category: string;
  categoryLabel: string;
}

export function TopPicks({ hosts, category, categoryLabel }: TopPicksProps) {
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `$${price.toFixed(2)}/mo`;
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{categoryLabel}</h3>
        <Link
          href={`/category/${category}`}
          className="flex items-center gap-1 text-sm text-accent hover:underline"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hosts.slice(0, 3).map((host, index) => (
          <Card key={host.id} hover className="relative overflow-hidden">
            {index === 0 && (
              <div className="absolute right-0 top-0">
                <Badge variant="accent" className="rounded-none rounded-bl-lg">
                  Top Pick
                </Badge>
              </div>
            )}
            <CardContent>
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <Link
                    href={`/hosting/${host.id}`}
                    className="font-semibold text-foreground hover:text-accent"
                  >
                    {host.name}
                  </Link>
                  {host.overallRating && (
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm text-foreground">
                        {host.overallRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-accent">{formatPrice(host.monthlyPrice)}</p>
                  {host.renewalPrice && host.renewalPrice !== host.monthlyPrice && (
                    <p className="text-xs text-text-muted">
                      Renews: {formatPrice(host.renewalPrice)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-1">
                {host.freeSsl && (
                  <Badge size="sm" variant="success">
                    Free SSL
                  </Badge>
                )}
                {host.freeDomain && (
                  <Badge size="sm" variant="info">
                    Free Domain
                  </Badge>
                )}
                {host.freeMigration && (
                  <Badge size="sm" variant="accent">
                    Free Migration
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Link href={`/hosting/${host.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Details
                  </Button>
                </Link>
                <Button size="sm" className="flex-1">
                  Visit <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
