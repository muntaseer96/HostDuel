'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Container } from './Container';
import { Button } from '@/components/ui';
import { NAV, isNavGroup, SITE_NAME } from '@/lib/constants';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const closeMobile = () => {
    setMobileMenuOpen(false);
    setMobileExpanded(null);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/80 backdrop-blur-lg">
      <Container>
        <nav className="flex h-20 md:h-28 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt={SITE_NAME}
              width={96}
              height={96}
              className="h-14 w-14 md:h-24 md:w-24"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV.map((item) =>
              isNavGroup(item) ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    className="flex items-center gap-1 text-base font-medium text-text-secondary transition-colors hover:text-foreground"
                    onClick={() => setOpenDropdown((d) => (d === item.label ? null : item.label))}
                    aria-expanded={openDropdown === item.label}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform', openDropdown === item.label && 'rotate-180')}
                    />
                  </button>

                  {/* Dropdown panel */}
                  <div
                    className={cn(
                      'absolute right-0 top-full pt-3 w-72 transition-opacity',
                      openDropdown === item.label ? 'opacity-100 visible' : 'pointer-events-none invisible opacity-0'
                    )}
                  >
                    <div className="rounded-xl border border-border-subtle bg-bg-secondary p-2 shadow-xl">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-background"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="block text-sm font-semibold text-foreground">{child.label}</span>
                          {child.description && (
                            <span className="block text-xs text-text-muted mt-0.5">{child.description}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base font-medium text-text-secondary transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/#compare">
              <Button size="sm">Compare All Hosts</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300',
            mobileMenuOpen ? 'max-h-[32rem] pb-4' : 'max-h-0'
          )}
        >
          <div className="flex flex-col gap-1 pt-4">
            {NAV.map((item) =>
              isNavGroup(item) ? (
                <div key={item.label}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-2 text-base font-medium text-text-secondary"
                    onClick={() => setMobileExpanded((m) => (m === item.label ? null : item.label))}
                    aria-expanded={mobileExpanded === item.label}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform', mobileExpanded === item.label && 'rotate-180')}
                    />
                  </button>
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300',
                      mobileExpanded === item.label ? 'max-h-96' : 'max-h-0'
                    )}
                  >
                    <div className="flex flex-col gap-1 border-l border-border-subtle pl-4 ml-1 py-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="py-1.5 text-sm text-text-secondary transition-colors hover:text-foreground"
                          onClick={closeMobile}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-2 text-base font-medium text-text-secondary transition-colors hover:text-foreground"
                  onClick={closeMobile}
                >
                  {item.label}
                </Link>
              )
            )}
            <Link href="/#compare" onClick={closeMobile} className="mt-3">
              <Button size="sm" className="w-full">
                Compare All Hosts
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
