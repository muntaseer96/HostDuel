import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { Button } from '@/components/ui';
import { SITE_NAME } from '@/lib/constants';
import { Bell, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog - Coming Soon',
  description: `${SITE_NAME} blog is coming soon. Get hosting tips, comparisons, and industry insights.`,
};

export default function Blog() {
  return (
    <section className="py-24">
      <Container size="sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
            <Bell className="h-8 w-8 text-accent" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">Blog Coming Soon</h1>

          <p className="text-lg text-text-secondary mb-8 max-w-md mx-auto">
            We&apos;re working on in-depth hosting guides, comparison articles, and industry insights
            to help you make better hosting decisions.
          </p>

          <div className="space-y-4">
            <p className="text-text-muted text-sm">In the meantime, explore our tools:</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/quiz">
                <Button variant="outline">
                  Take the Hosting Quiz
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/compare">
                <Button variant="outline">
                  Compare Hosts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
