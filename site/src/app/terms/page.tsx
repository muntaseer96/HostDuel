import { Metadata } from 'next';
import { Container } from '@/components/layout';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Terms of Service for ${SITE_NAME}. Read our terms and conditions for using our web hosting comparison service.`,
};

export default function TermsOfService() {
  return (
    <section className="py-16">
      <Container size="md">
        <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
          <p className="text-sm text-text-muted">Last updated: January 2026</p>
          
          <h2 className="text-xl font-semibold text-foreground mt-8">1. Acceptance of Terms</h2>
          <p>
            By accessing and using {SITE_NAME} (&quot;the Service&quot;), you accept and agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our Service.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">2. Description of Service</h2>
          <p>
            {SITE_NAME} provides web hosting comparison information, reviews, and recommendations. 
            Our data is compiled through extensive research and is provided for informational purposes only.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">3. Intellectual Property Rights</h2>
          <p>
            All content on this website, including but not limited to text, data, graphics, logos, images, 
            and software, is the property of {SITE_NAME} and is protected by copyright, trademark, and other 
            intellectual property laws.
          </p>
          <p>
            Our hosting comparison data, including pricing information, feature comparisons, ratings, and 
            proprietary analysis, represents significant investment in research and compilation. This data 
            is protected under database rights and copyright law.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">4. Prohibited Activities</h2>
          <p>You agree NOT to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Scrape, crawl, or automatically collect</strong> any data from our website using bots, 
              spiders, scrapers, or any automated means without our express written permission
            </li>
            <li>
              <strong>Copy, reproduce, or redistribute</strong> our comparison data, pricing information, 
              or any substantial portion of our content
            </li>
            <li>
              <strong>Use our data for commercial purposes</strong> including but not limited to creating 
              competing services, reselling data, or training AI/ML models
            </li>
            <li>
              <strong>Circumvent or attempt to circumvent</strong> any security measures, rate limiting, 
              or access controls we have in place
            </li>
            <li>
              <strong>Access our website</strong> in a manner that exceeds reasonable request volumes or 
              that could damage, disable, or impair our servers
            </li>
            <li>
              <strong>Remove or alter</strong> any copyright, trademark, or other proprietary notices
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">5. Data Usage and Attribution</h2>
          <p>
            Limited quoting of our data (e.g., mentioning a single hosting provider&apos;s rating or price) 
            is permitted for editorial purposes with proper attribution to {SITE_NAME} and a link to our website.
          </p>
          <p>
            Systematic extraction or reproduction of our data is strictly prohibited without a licensing agreement.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">6. Enforcement</h2>
          <p>
            We actively monitor for unauthorized use of our content. Violations of these terms may result in:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Immediate termination of access to our Service</li>
            <li>Legal action including but not limited to claims for copyright infringement, 
                misappropriation, and breach of contract</li>
            <li>DMCA takedown notices for infringing content</li>
            <li>Recovery of damages, legal fees, and costs</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">7. Affiliate Disclosure</h2>
          <p>
            {SITE_NAME} may earn commissions from hosting providers when you sign up through our links. 
            This does not affect our ratings or recommendations, which are based on objective criteria.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">8. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any kind. While we strive for accuracy, 
            hosting providers may change their pricing and features at any time. Always verify current 
            information directly with the provider before making purchasing decisions.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">9. Limitation of Liability</h2>
          <p>
            {SITE_NAME} shall not be liable for any indirect, incidental, special, consequential, or 
            punitive damages arising from your use of the Service.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the Service after 
            changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">11. Contact</h2>
          <p>
            For questions about these Terms of Service or to request a data licensing agreement, 
            please contact us at legal@hostduel.com.
          </p>
        </div>
      </Container>
    </section>
  );
}
