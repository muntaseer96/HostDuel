import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

interface RelatedComparisonsProps {
  comparisons: Array<{
    slug: string;
    hostAName: string;
    hostBName: string;
  }>;
  currentHostNames: [string, string];
}

export function RelatedComparisons({ comparisons, currentHostNames }: RelatedComparisonsProps) {
  if (comparisons.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Related Comparisons
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {comparisons.map((comp) => {
          // Highlight which host from current comparison is in this related one
          const highlightA = currentHostNames.includes(comp.hostAName);
          const highlightB = currentHostNames.includes(comp.hostBName);

          return (
            <Link key={comp.slug} href={`/compare/${comp.slug}`}>
              <Card hover className="h-full">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className={highlightA ? 'text-accent font-medium' : 'text-foreground'}>
                        {comp.hostAName}
                      </span>
                      <span className="text-text-muted mx-2">vs</span>
                      <span className={highlightB ? 'text-accent font-medium' : 'text-foreground'}>
                        {comp.hostBName}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
