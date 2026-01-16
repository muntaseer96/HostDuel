import { Metadata } from 'next';
import { Container } from '@/components/layout';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About Us',
  description: `About ${SITE_NAME} - Our mission to help you find the perfect web hosting provider through data-driven comparisons.`,
};

export default function About() {
  return (
    <section className="py-16">
      <Container size="md">
        <h1 className="text-3xl font-bold text-foreground mb-4">About {SITE_NAME}</h1>
        <p className="text-lg text-text-secondary mb-12">
          Making web hosting decisions easier through data
        </p>

        <div className="prose prose-invert max-w-none space-y-8 text-text-secondary">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Our Mission</h2>
            <p>
              Choosing web hosting shouldn&apos;t be confusing. With hundreds of providers, countless plans,
              and marketing that makes everyone sound like the best, finding the right host for your
              needs can feel overwhelming.
            </p>
            <p>
              {SITE_NAME} cuts through the noise with <strong>objective, data-driven comparisons</strong>.
              We analyze hosting providers across 355+ data points so you can make informed decisions
              based on facts, not marketing claims.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground">What We Do</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Compare hosting providers</strong> side-by-side with detailed feature breakdowns
              </li>
              <li>
                <strong>Rate hosts objectively</strong> using a transparent, weighted scoring system
              </li>
              <li>
                <strong>Help you find the right fit</strong> through our hosting quiz and category filters
              </li>
              <li>
                <strong>Keep data current</strong> with regular updates as providers change their offerings
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground">What Sets Us Apart</h2>
            <div className="grid gap-4 mt-4">
              <div className="bg-bg-secondary rounded-lg p-4 border border-border-subtle">
                <h3 className="font-semibold text-foreground mb-2">Data First</h3>
                <p className="text-sm text-text-muted">
                  No vague &ldquo;best hosting&rdquo; claims. Every rating is backed by specific,
                  verifiable data points.
                </p>
              </div>
              <div className="bg-bg-secondary rounded-lg p-4 border border-border-subtle">
                <h3 className="font-semibold text-foreground mb-2">Comprehensive Coverage</h3>
                <p className="text-sm text-text-muted">
                  From budget shared hosting to enterprise cloud solutions, we cover the full
                  spectrum of hosting options.
                </p>
              </div>
              <div className="bg-bg-secondary rounded-lg p-4 border border-border-subtle">
                <h3 className="font-semibold text-foreground mb-2">Transparent Methodology</h3>
                <p className="text-sm text-text-muted">
                  Our <a href="/methodology" className="text-accent hover:underline">rating methodology</a> is
                  fully documented. You can see exactly how we calculate scores.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground">Affiliate Disclosure</h2>
            <p>
              {SITE_NAME} participates in affiliate programs, which means we may earn commissions
              when you sign up for hosting through our links. This comes at no extra cost to you
              and helps support our work.
            </p>
            <p>
              Importantly, affiliate relationships <strong>never influence our ratings</strong>.
              We apply the same scoring methodology to all providers, whether they have an
              affiliate program or not.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground">Get in Touch</h2>
            <p>
              Have questions, feedback, or found outdated information?
              We&apos;d love to hear from you. Visit our <a href="/contact" className="text-accent hover:underline">contact page</a> to
              get in touch.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
