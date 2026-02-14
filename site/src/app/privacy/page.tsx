import { Metadata } from 'next';
import { Container } from '@/components/layout';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy for ${SITE_NAME}. Learn how we collect, use, and protect your personal information when you use our web hosting comparison platform and related services.`,
  alternates: {
    canonical: '/privacy',
  },
};

export default function Privacy() {
  return (
    <section className="py-16">
      <Container size="md">
        <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
          <p className="text-sm text-text-muted">Last updated: January 2026</p>

          <h2 className="text-xl font-semibold text-foreground mt-8">1. Introduction</h2>
          <p>
            {SITE_NAME} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to
            protecting your personal information. This Privacy Policy explains how we collect, use,
            and safeguard your information when you visit our website.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">2. Information We Collect</h2>

          <h3 className="text-lg font-medium text-foreground mt-4">Automatically Collected Information</h3>
          <p>When you visit our website, we may automatically collect:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent</li>
            <li>Referring website</li>
            <li>IP address (anonymized)</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mt-4">Information You Provide</h3>
          <p>
            If you contact us through our contact form, we collect the information you voluntarily
            provide, such as your name and email address.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">3. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Improve our website and user experience</li>
            <li>Analyze usage patterns and trends</li>
            <li>Respond to your inquiries</li>
            <li>Protect against misuse of our service</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">4. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience. These may include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
            <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site</li>
            <li><strong>Preference cookies:</strong> Remember your settings and choices</li>
          </ul>
          <p>
            You can control cookies through your browser settings. Disabling cookies may affect
            some website functionality.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">5. Third-Party Services</h2>
          <p>We may use third-party services that collect information, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Analytics providers</strong> to understand website usage</li>
            <li><strong>Hosting providers</strong> to serve our website</li>
            <li><strong>Affiliate networks</strong> to track referrals (when you click affiliate links)</li>
          </ul>
          <p>
            These third parties have their own privacy policies governing their use of your information.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">6. Affiliate Links</h2>
          <p>
            Our website contains affiliate links to hosting providers. When you click these links
            and make a purchase, the hosting provider and/or affiliate network may collect information
            about your visit and purchase. We do not control their data practices.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">7. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your information.
            However, no method of transmission over the Internet is 100% secure, and we cannot
            guarantee absolute security.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">8. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to processing of your information</li>
            <li>Opt out of analytics tracking</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">9. Children&apos;s Privacy</h2>
          <p>
            Our website is not intended for children under 13 years of age. We do not knowingly
            collect personal information from children under 13.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with an updated revision date.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">11. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please
            contact us at privacy@hostduel.com or through our <a href="/contact" className="text-accent hover:underline">contact page</a>.
          </p>
        </div>
      </Container>
    </section>
  );
}
