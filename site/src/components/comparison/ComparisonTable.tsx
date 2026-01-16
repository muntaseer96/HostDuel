'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown, X, Columns3 } from 'lucide-react';
import { Button } from '@/components/ui';
import { HostRow } from './HostRow';
import { FilterSidebar } from './FilterSidebar';
import { CompareWidget } from './CompareWidget';
import { cn } from '@/lib/utils';
import type { CompanyTableRow, FilterState, SortState, SortField, HostingType, ColumnSet } from '@/types';

// Column set definitions (20 total)
const COLUMN_SETS: Record<ColumnSet, { label: string; description: string }> = {
  essential: { label: 'Essential', description: 'Price, Rating, Uptime' },
  technical: { label: 'Technical', description: 'Storage, PHP, SSH, Git' },
  wordpress: { label: 'WordPress', description: 'WP features, Staging' },
  security: { label: 'Security', description: 'SSL, Backups, DDoS' },
  support: { label: 'Support', description: 'Channels, Hours' },
  pricing: { label: 'Pricing', description: 'Costs, Renewal markup' },
  email: { label: 'Email', description: 'Accounts, Spam, Webmail' },
  compliance: { label: 'Compliance', description: 'GDPR, PCI, HIPAA' },
  platform: { label: 'Platform', description: 'CMS & Framework support' },
  performance: { label: 'Performance', description: 'CDN, Locations, HTTP/2' },
  ratings: { label: 'Ratings', description: 'All 8 rating dimensions' },
  suitability: { label: 'Suitability', description: 'Use case scores' },
  migration: { label: 'Migration', description: 'Free, Turnaround, Cost' },
  controlPanel: { label: 'Control Panel', description: 'cPanel, Builder' },
  policies: { label: 'Policies', description: 'Overages, Restrictions' },
  managedWp: { label: 'Managed WP', description: 'Visit limits, Workers' },
  regional: { label: 'Regional', description: 'Countries, Currencies' },
  editorial: { label: 'Editorial', description: 'Best for, Known issues' },
  business: { label: 'Business', description: 'Affiliate, API access' },
  advanced: { label: 'Advanced', description: 'Limits, DB type, FTP' },
};

interface ComparisonTableProps {
  hosts: CompanyTableRow[];
  hostingTypeCounts: Record<string, number>;
}

const defaultFilters: FilterState = {
  search: '',
  hostingTypes: [],
  priceRange: [0, 300],
  minRating: 0,
  minUptime: 0,
  features: {
    freeSsl: false,
    freeDomain: false,
    freeMigration: false,
    sshAccess: false,
    staging: false,
    unlimitedStorage: false,
    unlimitedBandwidth: false,
    nodejsSupport: false,
    pythonSupport: false,
    wordpressOptimized: false,
    woocommerceOptimized: false,
    litespeedCache: false,
    liveChatSupport: false,
    phoneSupport: false,
    cdnIncluded: false,
    gdprCompliance: false,
    pciCompliance: false,
  },
  suitability: {
    blogger: false,
    developer: false,
    ecommerce: false,
    beginner: false,
    enterprise: false,
  },
};

const defaultSort: SortState = {
  field: 'overallRating',
  direction: 'desc',
};

export function ComparisonTable({ hosts, hostingTypeCounts }: ComparisonTableProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState<SortState>(defaultSort);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHosts, setSelectedHosts] = useState<string[]>([]);
  const [activeColumnSet, setActiveColumnSet] = useState<ColumnSet>('essential');
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  // Smart search - matches name, hosting type, and feature keywords
  const matchesSearch = (host: CompanyTableRow, searchTerm: string): boolean => {
    const s = searchTerm.toLowerCase();

    // Match host name
    if (host.name.toLowerCase().includes(s)) return true;

    // Match hosting type
    if (host.hostingType?.toLowerCase().includes(s)) return true;

    // Match feature keywords
    const keywordMatches: Record<string, boolean | null> = {
      'adult': host.adultContentAllowed,
      'gambling': host.gamblingSitesAllowed,
      'casino': host.gamblingSitesAllowed,
      'crypto': host.cryptocurrencySitesAllowed,
      'bitcoin': host.cryptocurrencySitesAllowed,
      'ssl': host.freeSsl,
      'free ssl': host.freeSsl,
      'ssh': host.sshAccess,
      'wordpress': host.wordpressOptimized,
      'woocommerce': host.woocommerceOptimized,
      'staging': host.stagingEnvironment,
      'migration': host.freeMigration,
      'free migration': host.freeMigration,
      'cpanel': host.cpanelIncluded,
      'litespeed': host.litespeedCache,
      'nodejs': host.nodejsSupport,
      'node': host.nodejsSupport,
      'python': host.pythonSupport,
      'django': host.djangoSupport,
      'laravel': host.laravelSupport,
      'reseller': host.resellerHostingAvailable,
      'api': host.apiAccess,
      'gdpr': host.gdprCompliance,
      'pci': host.pciCompliance,
      'hipaa': host.hipaaCompliance,
      'cdn': host.cdnIncluded,
      'backup': host.onDemandBackup,
      'ddos': host.ddosProtection,
      'live chat': host.liveChatAvailable,
      'chat': host.liveChatAvailable,
      'phone': host.phoneSupportAvailable,
      '24/7': host.liveChatHours?.toLowerCase().includes('24') ?? null,
      'unlimited': host.storageGb === 'Unlimited' || host.bandwidthGb === 'Unlimited',
      'green': host.greenHosting,
      'eco': host.greenHosting,
    };

    for (const [keyword, value] of Object.entries(keywordMatches)) {
      if (s.includes(keyword) && value === true) return true;
    }

    return false;
  };

  // Filter hosts
  const filteredHosts = useMemo(() => {
    return hosts.filter((host) => {
      // Search filter - now uses smart matching
      if (filters.search) {
        if (!matchesSearch(host, filters.search)) {
          return false;
        }
      }

      // Hosting type filter
      if (filters.hostingTypes.length > 0) {
        if (!host.hostingType || !filters.hostingTypes.includes(host.hostingType as HostingType)) {
          return false;
        }
      }

      // Price range filter
      if (host.monthlyPrice !== null) {
        if (
          host.monthlyPrice < filters.priceRange[0] ||
          host.monthlyPrice > filters.priceRange[1]
        ) {
          return false;
        }
      }

      // Min rating filter
      if (filters.minRating > 0) {
        if (host.overallRating === null || host.overallRating < filters.minRating) {
          return false;
        }
      }

      // Min uptime filter
      if (filters.minUptime > 0) {
        if (host.uptimeGuarantee === null || host.uptimeGuarantee < filters.minUptime) {
          return false;
        }
      }

      // Basic feature filters
      if (filters.features.freeSsl && !host.freeSsl) return false;
      if (filters.features.freeDomain && !host.freeDomain) return false;
      if (filters.features.freeMigration && !host.freeMigration) return false;
      if (filters.features.sshAccess && !host.sshAccess) return false;
      if (filters.features.staging && !host.stagingEnvironment) return false;

      // Storage/bandwidth filters (check for 'Unlimited' value)
      if (filters.features.unlimitedStorage && host.storageGb !== 'Unlimited') return false;
      if (filters.features.unlimitedBandwidth && host.bandwidthGb !== 'Unlimited') return false;

      // Platform support filters
      if (filters.features.nodejsSupport && !host.nodejsSupport) return false;
      if (filters.features.pythonSupport && !host.pythonSupport) return false;

      // WordPress filters
      if (filters.features.wordpressOptimized && !host.wordpressOptimized) return false;
      if (filters.features.woocommerceOptimized && !host.woocommerceOptimized) return false;
      if (filters.features.litespeedCache && !host.litespeedCache) return false;

      // Support filters
      if (filters.features.liveChatSupport && !host.liveChatAvailable) return false;
      if (filters.features.phoneSupport && !host.phoneSupportAvailable) return false;

      // Performance filter
      if (filters.features.cdnIncluded && !host.cdnIncluded) return false;

      // Compliance filters
      if (filters.features.gdprCompliance && !host.gdprCompliance) return false;
      if (filters.features.pciCompliance && !host.pciCompliance) return false;

      // Suitability filters - check if host is suitable for selected use cases (score >= 4 on 1-5 scale)
      if (filters.suitability.blogger && (!host.suitabilityBlogger || host.suitabilityBlogger < 4)) return false;
      if (filters.suitability.developer && (!host.suitabilityDeveloper || host.suitabilityDeveloper < 4)) return false;
      if (filters.suitability.ecommerce && (!host.suitabilityEcommerce || host.suitabilityEcommerce < 4)) return false;
      if (filters.suitability.beginner && (!host.suitabilityBeginner || host.suitabilityBeginner < 4)) return false;
      if (filters.suitability.enterprise && (!host.suitabilityEnterprise || host.suitabilityEnterprise < 4)) return false;

      return true;
    });
  }, [hosts, filters]);

  // Sort hosts
  const sortedHosts = useMemo(() => {
    return [...filteredHosts].sort((a, b) => {
      let aVal: string | number | null = null;
      let bVal: string | number | null = null;

      switch (sort.field) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'monthlyPrice':
          aVal = a.monthlyPrice;
          bVal = b.monthlyPrice;
          break;
        case 'renewalPrice':
          aVal = a.renewalPrice;
          bVal = b.renewalPrice;
          break;
        case 'overallRating':
          aVal = a.overallRating;
          bVal = b.overallRating;
          break;
        case 'uptimeGuarantee':
          aVal = a.uptimeGuarantee;
          bVal = b.uptimeGuarantee;
          break;
        case 'trustpilotRating':
          aVal = a.trustpilotRating;
          bVal = b.trustpilotRating;
          break;
      }

      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredHosts, sort]);

  const handleSort = (field: SortField) => {
    if (sort.field === field) {
      setSort({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ field, direction: 'desc' });
    }
  };

  const toggleCompare = (id: string) => {
    setSelectedHosts((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sort.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-accent" />
    ) : (
      <ArrowDown className="h-4 w-4 text-accent" />
    );
  };

  const selectedHostsData = selectedHosts
    .map((id) => {
      const host = hosts.find((h) => h.id === id);
      return host ? { id, name: host.name } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string }>;

  return (
    <div className="relative">
      {/* Search and Filter Header */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search hosts, features (adult, gambling, ssh, wordpress...)"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full rounded-lg border border-border-subtle bg-bg-secondary py-2.5 pl-10 pr-4 text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">
            {sortedHosts.length} of {hosts.length} hosts
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Column Set Toggles */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-text-secondary">Columns:</span>
        {(Object.keys(COLUMN_SETS) as ColumnSet[]).map((set) => (
          <button
            key={set}
            onClick={() => setActiveColumnSet(set)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              activeColumnSet === set
                ? 'bg-accent text-background'
                : 'bg-bg-elevated text-text-secondary hover:bg-bg-tertiary hover:text-foreground'
            )}
          >
            {COLUMN_SETS[set].label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar - Desktop */}
        <FilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          hostingTypeCounts={hostingTypeCounts}
          className="hidden w-64 shrink-0 lg:block"
        />

        {/* Mobile Filters Overlay */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-background/80" onClick={() => setShowFilters(false)} />
            <div className="absolute right-0 top-0 h-full w-[85vw] max-w-80 overflow-y-auto bg-bg-secondary p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5 text-text-secondary" />
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                hostingTypeCounts={hostingTypeCounts}
              />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="w-12 px-3 py-3"></th>
                <th className="px-3 py-3 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-foreground"
                  >
                    Host {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-3 py-3 text-left">
                  <button
                    onClick={() => handleSort('monthlyPrice')}
                    className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-foreground"
                  >
                    Price {getSortIcon('monthlyPrice')}
                  </button>
                </th>

                {/* Essential Columns */}
                {activeColumnSet === 'essential' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <button
                        onClick={() => handleSort('overallRating')}
                        className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-foreground"
                      >
                        Rating {getSortIcon('overallRating')}
                      </button>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <button
                        onClick={() => handleSort('uptimeGuarantee')}
                        className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-foreground"
                      >
                        Uptime {getSortIcon('uptimeGuarantee')}
                      </button>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Storage</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Features</span>
                    </th>
                    <th className="hidden md:table-cell px-3 py-3 text-left">
                      <button
                        onClick={() => handleSort('trustpilotRating')}
                        className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-foreground"
                      >
                        Trustpilot {getSortIcon('trustpilotRating')}
                      </button>
                    </th>
                  </>
                )}

                {/* Technical Columns */}
                {activeColumnSet === 'technical' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Storage</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Bandwidth</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">PHP</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">SSH</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Git</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Staging</span>
                    </th>
                    <th className="hidden md:table-cell px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Node.js</span>
                    </th>
                  </>
                )}

                {/* WordPress Columns */}
                {activeColumnSet === 'wordpress' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">WP Optimized</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Auto Updates</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">WP Staging</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">WooCommerce</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">LiteSpeed</span>
                    </th>
                  </>
                )}

                {/* Security Columns */}
                {activeColumnSet === 'security' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Free SSL</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">DDoS</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Malware Scan</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Backups</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">2FA</span>
                    </th>
                  </>
                )}

                {/* Support Columns */}
                {activeColumnSet === 'support' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Channels</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Live Chat</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Phone</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Hours</span>
                    </th>
                    <th className="hidden md:table-cell px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">KB Quality</span>
                    </th>
                  </>
                )}

                {/* Pricing Columns */}
                {activeColumnSet === 'pricing' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">1st Year</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">2nd Year</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Markup %</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Money Back</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Setup Fee</span>
                    </th>
                    <th className="hidden md:table-cell px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Monthly OK</span>
                    </th>
                  </>
                )}

                {/* Email Columns */}
                {activeColumnSet === 'email' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Included</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Accounts</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Mailbox GB</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Webmail</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Spam Filter</span>
                    </th>
                  </>
                )}

                {/* Compliance Columns */}
                {activeColumnSet === 'compliance' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">GDPR</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">PCI</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">HIPAA</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">DC Certs</span>
                    </th>
                  </>
                )}

                {/* Platform Columns */}
                {activeColumnSet === 'platform' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Drupal</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Joomla</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Magento</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Laravel</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Django</span>
                    </th>
                    <th className="hidden md:table-cell px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Next.js</span>
                    </th>
                  </>
                )}

                {/* Performance Columns */}
                {activeColumnSet === 'performance' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">CDN</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Locations</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">HTTP/2</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Brotli</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">SLA Credit</span>
                    </th>
                  </>
                )}

                {/* Ratings Columns */}
                {activeColumnSet === 'ratings' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Value</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Perf</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Support</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Security</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Features</span>
                    </th>
                    <th className="hidden md:table-cell px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Ease</span>
                    </th>
                  </>
                )}

                {/* Suitability Columns */}
                {activeColumnSet === 'suitability' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Blogger</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">eComm</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Agency</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Dev</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Beginner</span>
                    </th>
                    <th className="hidden md:table-cell px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Enterprise</span>
                    </th>
                  </>
                )}

                {/* Migration Columns */}
                {activeColumnSet === 'migration' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Free</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Sites Limit</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Turnaround</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Paid Cost</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Quality</span>
                    </th>
                  </>
                )}

                {/* Control Panel Columns */}
                {activeColumnSet === 'controlPanel' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">cPanel</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Panel Name</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Softaculous</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Builder</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Builder Name</span>
                    </th>
                  </>
                )}

                {/* Policies Columns */}
                {activeColumnSet === 'policies' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Adult</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Gambling</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Crypto</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">File Host</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Proxy/VPN</span>
                    </th>
                  </>
                )}

                {/* Managed WordPress Columns */}
                {activeColumnSet === 'managedWp' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Pricing Model</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Visit Limit</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Overage Cost</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">PHP Workers</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Dev Env</span>
                    </th>
                  </>
                )}

                {/* Regional Columns */}
                {activeColumnSet === 'regional' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Best Countries</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Currencies</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Support Lang</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Data Sovereignty</span>
                    </th>
                  </>
                )}

                {/* Editorial Columns */}
                {activeColumnSet === 'editorial' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Best For</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Avoid If</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Known Issues</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">USP</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Competitors</span>
                    </th>
                  </>
                )}

                {/* Business Columns */}
                {activeColumnSet === 'business' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">API Access</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Affiliate</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Commission</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">G2 Rating</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">BBB Rating</span>
                    </th>
                  </>
                )}

                {/* Advanced Technical Columns */}
                {activeColumnSet === 'advanced' && (
                  <>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Inode Limit</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">DB Type</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Max Upload</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">Subdomains</span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="text-sm font-medium text-text-secondary">FTP Accounts</span>
                    </th>
                  </>
                )}

                <th className="px-3 py-3 text-left">
                  <span className="text-sm font-medium text-text-secondary">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedHosts.map((host) => (
                <HostRow
                  key={host.id}
                  host={host}
                  isSelected={selectedHosts.includes(host.id)}
                  onToggleCompare={toggleCompare}
                  compareDisabled={selectedHosts.length >= 2}
                  columnSet={activeColumnSet}
                />
              ))}
            </tbody>
          </table>

          {sortedHosts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-text-secondary">No hosts match your filters.</p>
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => setFilters(defaultFilters)}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Compare Widget */}
      <CompareWidget
        selectedHosts={selectedHostsData}
        onRemove={(id) => setSelectedHosts((prev) => prev.filter((h) => h !== id))}
        onClear={() => setSelectedHosts([])}
      />

      {/* Spacer for compare widget */}
      {selectedHosts.length > 0 && <div className="h-16" />}
    </div>
  );
}
