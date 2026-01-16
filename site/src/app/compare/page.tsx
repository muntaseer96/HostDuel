'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Zap, Globe, Server, Layout, Code } from 'lucide-react';
import { Container } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';

// Static data for the comparison page
const CLUSTERS = [
  {
    id: 'shared',
    name: 'Shared Hosting',
    icon: Globe,
    description: 'Budget-friendly shared hosting providers',
    hosts: [
      { id: 'bluehost', name: 'Bluehost' },
      { id: 'hostinger', name: 'Hostinger' },
      { id: 'siteground', name: 'SiteGround' },
      { id: 'hostgator', name: 'HostGator' },
      { id: 'godaddy', name: 'GoDaddy' },
      { id: 'dreamhost', name: 'DreamHost' },
      { id: 'a2hosting', name: 'A2 Hosting' },
      { id: 'greengeeks', name: 'GreenGeeks' },
      { id: 'ionos', name: 'IONOS' },
      { id: 'namecheap', name: 'Namecheap' },
      { id: 'hostpapa', name: 'HostPapa' },
      { id: 'inmotion', name: 'InMotion' },
      { id: 'fastcomet', name: 'FastComet' },
      { id: 'chemicloud', name: 'ChemiCloud' },
      { id: 'hostarmada', name: 'HostArmada' },
      { id: 'interserver', name: 'InterServer' },
      { id: 'accuwebhosting', name: 'AccuWeb' },
      { id: 'hostwinds', name: 'Hostwinds' },
      { id: 'tmdhosting', name: 'TMDHosting' },
      { id: 'verpex', name: 'Verpex' },
      { id: 'porkbun', name: 'Porkbun' },
    ],
  },
  {
    id: 'managed-wordpress',
    name: 'Managed WordPress',
    icon: Zap,
    description: 'Premium managed WordPress hosting',
    hosts: [
      { id: 'kinsta', name: 'Kinsta' },
      { id: 'wpengine', name: 'WP Engine' },
      { id: 'flywheel', name: 'Flywheel' },
      { id: 'cloudways', name: 'Cloudways' },
      { id: 'pressable', name: 'Pressable' },
      { id: 'wpx', name: 'WPX Hosting' },
      { id: 'nexcess', name: 'Nexcess' },
      { id: 'rocketnet', name: 'Rocket.net' },
      { id: '10web', name: '10Web' },
      { id: 'pagely', name: 'Pagely' },
    ],
  },
  {
    id: 'cloud-vps',
    name: 'Cloud & VPS',
    icon: Server,
    description: 'Cloud infrastructure and VPS providers',
    hosts: [
      { id: 'digitalocean', name: 'DigitalOcean' },
      { id: 'vultr', name: 'Vultr' },
      { id: 'linode', name: 'Linode' },
      { id: 'hetzner', name: 'Hetzner' },
      { id: 'aws', name: 'AWS' },
      { id: 'gcp', name: 'Google Cloud' },
      { id: 'azure', name: 'Azure' },
      { id: 'ovhcloud', name: 'OVHcloud' },
      { id: 'contabo', name: 'Contabo' },
      { id: 'kamatera', name: 'Kamatera' },
      { id: 'liquidweb', name: 'Liquid Web' },
      { id: 'scalahosting', name: 'ScalaHosting' },
      { id: 'alibabacloud', name: 'Alibaba Cloud' },
      { id: 'rackspace', name: 'Rackspace' },
    ],
  },
  {
    id: 'website-builders',
    name: 'Website Builders',
    icon: Layout,
    description: 'All-in-one website builders',
    hosts: [
      { id: 'wix', name: 'Wix' },
      { id: 'squarespace', name: 'Squarespace' },
      { id: 'weebly', name: 'Weebly' },
      { id: 'shopify', name: 'Shopify' },
      { id: 'bigcommerce', name: 'BigCommerce' },
    ],
  },
  {
    id: 'modern-platforms',
    name: 'Modern Platforms',
    icon: Code,
    description: 'JAMstack and PaaS providers',
    hosts: [
      { id: 'vercel', name: 'Vercel' },
      { id: 'netlify', name: 'Netlify' },
      { id: 'render', name: 'Render' },
      { id: 'pantheon', name: 'Pantheon' },
    ],
  },
];

// Popular comparisons to feature
const POPULAR_COMPARISONS = [
  { hostA: 'bluehost', hostB: 'siteground', nameA: 'Bluehost', nameB: 'SiteGround' },
  { hostA: 'hostinger', hostB: 'bluehost', nameA: 'Hostinger', nameB: 'Bluehost' },
  { hostA: 'kinsta', hostB: 'wpengine', nameA: 'Kinsta', nameB: 'WP Engine' },
  { hostA: 'digitalocean', hostB: 'vultr', nameA: 'DigitalOcean', nameB: 'Vultr' },
  { hostA: 'siteground', hostB: 'hostinger', nameA: 'SiteGround', nameB: 'Hostinger' },
  { hostA: 'wix', hostB: 'squarespace', nameA: 'Wix', nameB: 'Squarespace' },
];

function getComparisonSlug(a: string, b: string) {
  return [a, b].sort().join('-vs-');
}

export default function ComparePage() {
  const [hostA, setHostA] = useState<string>('');
  const [hostB, setHostB] = useState<string>('');
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');

  // Flatten all hosts for search
  const allHosts = useMemo(() => {
    const hosts: Array<{ id: string; name: string; cluster: string }> = [];
    CLUSTERS.forEach((cluster) => {
      cluster.hosts.forEach((host) => {
        hosts.push({ ...host, cluster: cluster.name });
      });
    });
    return hosts;
  }, []);

  const filteredHostsA = useMemo(() => {
    if (!searchA) return allHosts;
    const search = searchA.toLowerCase();
    return allHosts.filter(
      (h) => h.name.toLowerCase().includes(search) || h.id.includes(search)
    );
  }, [allHosts, searchA]);

  const filteredHostsB = useMemo(() => {
    if (!searchB) return allHosts.filter((h) => h.id !== hostA);
    const search = searchB.toLowerCase();
    return allHosts
      .filter((h) => h.id !== hostA)
      .filter((h) => h.name.toLowerCase().includes(search) || h.id.includes(search));
  }, [allHosts, searchB, hostA]);

  const selectedHostA = allHosts.find((h) => h.id === hostA);
  const selectedHostB = allHosts.find((h) => h.id === hostB);

  const compareUrl =
    hostA && hostB ? `/compare/${getComparisonSlug(hostA, hostB)}` : null;

  return (
    <>
      {/* Hero Section */}
      <section className="border-b border-border-subtle bg-bg-secondary py-12">
        <Container>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground text-center">
            Compare Web Hosting Providers
          </h1>
          <p className="mt-4 text-text-secondary text-center max-w-2xl mx-auto">
            Select two hosting providers to see a detailed side-by-side comparison of
            pricing, features, performance, and more.
          </p>

          {/* Host Selector */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="grid gap-4 md:grid-cols-[1fr,auto,1fr] items-end">
              {/* Host A Selector */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  First Host
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search hosts..."
                    value={selectedHostA ? selectedHostA.name : searchA}
                    onChange={(e) => {
                      setSearchA(e.target.value);
                      setHostA('');
                    }}
                    className="w-full rounded-lg border border-border-subtle bg-background pl-10 pr-4 py-3 text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {searchA && !hostA && filteredHostsA.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border-subtle bg-bg-secondary shadow-lg">
                    {filteredHostsA.slice(0, 8).map((host) => (
                      <button
                        key={host.id}
                        onClick={() => {
                          setHostA(host.id);
                          setSearchA('');
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-accent/10 flex justify-between"
                      >
                        <span className="text-foreground">{host.name}</span>
                        <span className="text-text-muted text-xs">{host.cluster}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* VS */}
              <div className="hidden md:flex items-center justify-center px-4 py-3">
                <span className="text-xl font-bold text-text-muted">VS</span>
              </div>

              {/* Host B Selector */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Second Host
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search hosts..."
                    value={selectedHostB ? selectedHostB.name : searchB}
                    onChange={(e) => {
                      setSearchB(e.target.value);
                      setHostB('');
                    }}
                    className="w-full rounded-lg border border-border-subtle bg-background pl-10 pr-4 py-3 text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {searchB && !hostB && filteredHostsB.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border-subtle bg-bg-secondary shadow-lg">
                    {filteredHostsB.slice(0, 8).map((host) => (
                      <button
                        key={host.id}
                        onClick={() => {
                          setHostB(host.id);
                          setSearchB('');
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-accent/10 flex justify-between"
                      >
                        <span className="text-foreground">{host.name}</span>
                        <span className="text-text-muted text-xs">{host.cluster}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Compare Button */}
            <div className="mt-6 text-center">
              {compareUrl ? (
                <Link href={compareUrl}>
                  <Button size="lg">
                    Compare {selectedHostA?.name} vs {selectedHostB?.name}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button size="lg" disabled>
                  Select two hosts to compare
                </Button>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Popular Comparisons */}
      <section className="py-12 border-b border-border-subtle">
        <Container>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Popular Comparisons
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_COMPARISONS.map((comp) => (
              <Link
                key={`${comp.hostA}-${comp.hostB}`}
                href={`/compare/${getComparisonSlug(comp.hostA, comp.hostB)}`}
              >
                <Card hover className="h-full">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-blue-400 font-medium">{comp.nameA}</span>
                        <span className="text-text-muted mx-2">vs</span>
                        <span className="text-purple-400 font-medium">{comp.nameB}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-text-muted" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Browse by Category */}
      <section className="py-12">
        <Container>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Browse by Category
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CLUSTERS.map((cluster) => {
              const Icon = cluster.icon;
              // Generate a few sample comparisons for this cluster
              const sampleComparisons = [];
              for (let i = 0; i < Math.min(3, cluster.hosts.length - 1); i++) {
                sampleComparisons.push({
                  hostA: cluster.hosts[i],
                  hostB: cluster.hosts[i + 1],
                });
              }

              return (
                <Card key={cluster.id} className="h-full">
                  <CardContent className="py-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-lg bg-accent/10 p-2">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{cluster.name}</h3>
                        <p className="text-xs text-text-muted">
                          {cluster.hosts.length} providers
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary mb-4">
                      {cluster.description}
                    </p>
                    <div className="space-y-2">
                      {sampleComparisons.map((comp) => (
                        <Link
                          key={`${comp.hostA.id}-${comp.hostB.id}`}
                          href={`/compare/${getComparisonSlug(comp.hostA.id, comp.hostB.id)}`}
                          className="flex items-center justify-between text-sm py-1 hover:text-accent transition-colors"
                        >
                          <span>
                            {comp.hostA.name} vs {comp.hostB.name}
                          </span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
