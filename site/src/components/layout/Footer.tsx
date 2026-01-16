import Link from 'next/link';
import Image from 'next/image';
import { Container } from './Container';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';

const footerLinks = {
  categories: [
    { href: '/category/shared', label: 'Shared Hosting' },
    { href: '/category/vps', label: 'VPS Hosting' },
    { href: '/category/managed-wordpress', label: 'Managed WordPress' },
    { href: '/category/cloud-iaas', label: 'Cloud Hosting' },
    { href: '/category/website-builder', label: 'Website Builders' },
  ],
  resources: [
    { href: '/blog', label: 'Blog' },
    { href: '/quiz', label: 'Hosting Quiz' },
    { href: '/compare', label: 'Compare Hosts' },
    { href: '/blog/how-to-choose-hosting', label: 'How to Choose' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/methodology', label: 'Our Methodology' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-bg-secondary">
      <Container>
        <div className="py-12">
          {/* Main Footer Content */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt={SITE_NAME}
                  width={96}
                  height={96}
                  className="h-14 w-14 md:h-24 md:w-24"
                />
              </Link>
              <p className="mt-4 text-sm text-text-secondary">
                {SITE_DESCRIPTION}
              </p>
              <p className="mt-4 text-xs text-text-muted">
                Affiliate Disclosure: We may earn commissions from qualifying purchases.
              </p>
            </div>

            {/* Categories */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-foreground">Categories</h4>
              <ul className="space-y-2">
                {footerLinks.categories.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-foreground">Resources</h4>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-foreground">Company</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-8 md:flex-row">
            <p className="text-sm text-text-muted">
              &copy; {currentYear} {SITE_NAME}. All rights reserved.
            </p>
            <p className="text-sm text-text-muted">
              Made with <span className="text-accent">precision</span> for informed decisions.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
