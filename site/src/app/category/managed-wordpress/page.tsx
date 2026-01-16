import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { Card, Badge, Button } from '@/components/ui';
import { getAllTableRows } from '@/lib/data';
import { Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Best Managed WordPress Hosting Providers',
  description: 'Compare the best managed WordPress hosting providers. Get optimized performance and expert support with comprehensive comparisons.',
};

export default async function ManagedWordPressCategory() {
  const allHosts = await getAllTableRows();
  const hosts = allHosts
    .filter((host) => host.hostingType === 'managed-wordpress')
    .sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0));

  return (
    <section className="py-16">
      <Container>
        <div className="mb-12">
          <Badge variant="accent" className="mb-4">Category</Badge>
          <h1 className="text-3xl font-bold text-foreground mb-4">Managed WordPress Hosting</h1>
          <p className="text-lg text-text-secondary max-w-2xl">
            Managed WordPress hosting provides optimized servers, automatic updates, enhanced security,
            and expert WordPress support. Perfect for those who want top performance without the
            technical overhead.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hosts.map((host) => (
            <Card key={host.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">{host.name}</h2>
                {host.overallRating && (
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-semibold">{host.overallRating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4 text-sm text-text-secondary">
                {host.monthlyPrice && (
                  <p>Starting at <span className="text-foreground font-semibold">${host.monthlyPrice}/mo</span></p>
                )}
                {host.wordpressAutoUpdates && <p className="text-success">Auto Updates</p>}
              </div>

              <Link href={`/hosting/${host.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {hosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted">No managed WordPress hosting providers found.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/compare">
            <Button variant="outline">Compare All Hosts</Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
