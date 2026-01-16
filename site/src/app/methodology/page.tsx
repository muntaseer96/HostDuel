import { Metadata } from 'next';
import { Container } from '@/components/layout';
import { SITE_NAME, RATING_WEIGHTS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Our Methodology',
  description: `How ${SITE_NAME} rates and compares web hosting providers. Learn about our data-driven approach and scoring criteria.`,
};

const ratingCategories = [
  {
    name: 'Value for Money',
    weight: RATING_WEIGHTS.valueForMoney * 100,
    description: 'Price-to-feature ratio, renewal pricing transparency, included resources, and overall cost-effectiveness.',
  },
  {
    name: 'Performance',
    weight: RATING_WEIGHTS.performance * 100,
    description: 'Server response times, uptime guarantees, CDN availability, and infrastructure quality.',
  },
  {
    name: 'Support Quality',
    weight: RATING_WEIGHTS.supportQuality * 100,
    description: '24/7 availability, response times, support channels, and quality of assistance.',
  },
  {
    name: 'Security',
    weight: RATING_WEIGHTS.security * 100,
    description: 'SSL certificates, malware protection, backups, DDoS protection, and security features.',
  },
  {
    name: 'Features',
    weight: RATING_WEIGHTS.features * 100,
    description: 'Control panel, one-click installs, email hosting, databases, and included tools.',
  },
  {
    name: 'Ease of Use',
    weight: RATING_WEIGHTS.easeOfUse * 100,
    description: 'User interface, setup process, documentation, and beginner-friendliness.',
  },
  {
    name: 'Transparency',
    weight: RATING_WEIGHTS.transparency * 100,
    description: 'Clear pricing, honest marketing, no hidden fees, and straightforward terms.',
  },
];

export default function Methodology() {
  return (
    <section className="py-16">
      <Container size="md">
        <h1 className="text-3xl font-bold text-foreground mb-4">Our Methodology</h1>
        <p className="text-lg text-text-secondary mb-12">
          How we evaluate and compare web hosting providers
        </p>

        <div className="prose prose-invert max-w-none space-y-8 text-text-secondary">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Data-Driven Approach</h2>
            <p>
              At {SITE_NAME}, we analyze hosting providers across <strong>355+ data points</strong>.
              Our comparisons are based on verifiable specifications, published pricing, and documented features
              rather than subjective opinions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground">Rating Categories</h2>
            <p className="mb-6">
              Each hosting provider receives a weighted score based on the following categories:
            </p>

            <div className="space-y-4">
              {ratingCategories.map((category) => (
                <div key={category.name} className="bg-bg-secondary rounded-lg p-4 border border-border-subtle">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <span className="text-accent font-mono">{category.weight}%</span>
                  </div>
                  <p className="text-sm text-text-muted">{category.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground">How We Collect Data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Direct review of official hosting provider websites and pricing pages</li>
              <li>Analysis of published specifications and feature lists</li>
              <li>Verification of support channels and availability claims</li>
              <li>Review of terms of service and refund policies</li>
              <li>Regular updates to reflect pricing and feature changes</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground">Independence & Affiliate Disclosure</h2>
            <p>
              {SITE_NAME} may earn commissions when you sign up for hosting through our links.
              However, this <strong>never influences our ratings</strong>. Our scoring methodology is
              applied consistently across all providers, regardless of affiliate relationships.
            </p>
            <p>
              We include providers that don&apos;t have affiliate programs alongside those that do,
              ensuring comprehensive coverage of the hosting market.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground">Keeping Data Current</h2>
            <p>
              Hosting providers frequently change their pricing and features. We regularly review
              and update our data to maintain accuracy. If you notice outdated information,
              please <a href="/contact" className="text-accent hover:underline">contact us</a>.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
