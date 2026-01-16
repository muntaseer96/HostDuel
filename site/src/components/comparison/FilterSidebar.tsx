'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { HOSTING_TYPES, type HostingType } from '@/lib/constants';
import type { FilterState } from '@/types';

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  hostingTypeCounts: Record<string, number>;
  className?: string;
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  hostingTypeCounts,
  className,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hostingType: true,
    price: true,
    rating: true,
    uptime: false,
    features: true,
    technical: false,
    wordpress: false,
    support: false,
    compliance: false,
    suitability: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleHostingType = (type: HostingType) => {
    const newTypes = filters.hostingTypes.includes(type)
      ? filters.hostingTypes.filter((t) => t !== type)
      : [...filters.hostingTypes, type];
    onFiltersChange({ ...filters, hostingTypes: newTypes });
  };

  const toggleFeature = (feature: keyof FilterState['features']) => {
    onFiltersChange({
      ...filters,
      features: { ...filters.features, [feature]: !filters.features[feature] },
    });
  };

  const toggleSuitability = (suit: keyof FilterState['suitability']) => {
    onFiltersChange({
      ...filters,
      suitability: { ...filters.suitability, [suit]: !filters.suitability[suit] },
    });
  };

  const clearFilters = () => {
    onFiltersChange({
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
    });
  };

  const activeFilterCount =
    filters.hostingTypes.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.minUptime > 0 ? 1 : 0) +
    Object.values(filters.features).filter(Boolean).length +
    Object.values(filters.suitability).filter(Boolean).length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 300 ? 1 : 0);

  return (
    <aside className={cn('w-full space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {activeFilterCount > 0 && (
          <Button size="sm" variant="ghost" onClick={clearFilters}>
            Clear all ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Hosting Type */}
      <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
        <button
          onClick={() => toggleSection('hostingType')}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground"
        >
          Hosting Type
          {expandedSections.hostingType ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.hostingType && (
          <div className="mt-3 space-y-2">
            {(Object.keys(HOSTING_TYPES) as HostingType[]).map((type) => {
              const count = hostingTypeCounts[type] || 0;
              if (count === 0) return null;
              return (
                <label
                  key={type}
                  className="flex cursor-pointer items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.hostingTypes.includes(type)}
                      onChange={() => toggleHostingType(type)}
                      className="h-4 w-4 rounded border-border-medium bg-bg-elevated text-accent focus:ring-accent"
                    />
                    <span className="text-text-secondary">{HOSTING_TYPES[type]}</span>
                  </div>
                  <span className="text-text-muted">{count}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground"
        >
          Price Range
          {expandedSections.price ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.price && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={filters.priceRange[1]}
                value={filters.priceRange[0]}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    priceRange: [Number(e.target.value), filters.priceRange[1]],
                  })
                }
                className="w-20 rounded border border-border-subtle bg-bg-elevated px-2 py-1 text-sm text-foreground"
                placeholder="Min"
              />
              <span className="text-text-muted">to</span>
              <input
                type="number"
                min={filters.priceRange[0]}
                value={filters.priceRange[1]}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    priceRange: [filters.priceRange[0], Number(e.target.value)],
                  })
                }
                className="w-20 rounded border border-border-subtle bg-bg-elevated px-2 py-1 text-sm text-foreground"
                placeholder="Max"
              />
            </div>
            <input
              type="range"
              min={0}
              max={300}
              step={5}
              value={filters.priceRange[1]}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  priceRange: [filters.priceRange[0], Number(e.target.value)],
                })
              }
              className="w-full accent-accent"
            />
          </div>
        )}
      </div>

      {/* Minimum Rating */}
      <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
        <button
          onClick={() => toggleSection('rating')}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground"
        >
          Minimum Rating
          {expandedSections.rating ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.rating && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[0, 3, 3.5, 4, 4.5].map((rating) => (
              <button
                key={rating}
                onClick={() => onFiltersChange({ ...filters, minRating: rating })}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                  filters.minRating === rating
                    ? 'bg-accent text-background'
                    : 'bg-bg-elevated text-text-secondary hover:bg-bg-tertiary'
                )}
              >
                {rating === 0 ? 'Any' : `${rating}+`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Minimum Uptime */}
      <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
        <button
          onClick={() => toggleSection('uptime')}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground"
        >
          Minimum Uptime
          {expandedSections.uptime ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.uptime && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[0, 99, 99.5, 99.9, 99.99].map((uptime) => (
              <button
                key={uptime}
                onClick={() => onFiltersChange({ ...filters, minUptime: uptime })}
                className={cn(
                  'rounded-full px-3 py-1 text-sm transition-colors',
                  filters.minUptime === uptime
                    ? 'bg-accent text-background'
                    : 'bg-bg-elevated text-text-secondary hover:bg-bg-tertiary'
                )}
              >
                {uptime === 0 ? 'Any' : `${uptime}%+`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Basic Features */}
      <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
        <button
          onClick={() => toggleSection('features')}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground"
        >
          Basic Features
          {expandedSections.features ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.features && (
          <div className="mt-3 space-y-2">
            {[
              { key: 'freeSsl' as const, label: 'Free SSL' },
              { key: 'freeDomain' as const, label: 'Free Domain' },
              { key: 'freeMigration' as const, label: 'Free Migration' },
              { key: 'cdnIncluded' as const, label: 'CDN Included' },
            ].map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.features[key]}
                  onChange={() => toggleFeature(key)}
                  className="h-4 w-4 rounded border-border-medium bg-bg-elevated text-accent focus:ring-accent"
                />
                <span className="text-text-secondary">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Technical Features */}
      <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
        <button
          onClick={() => toggleSection('technical')}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground"
        >
          Technical
          {expandedSections.technical ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.technical && (
          <div className="mt-3 space-y-2">
            {[
              { key: 'sshAccess' as const, label: 'SSH Access' },
              { key: 'staging' as const, label: 'Staging Environment' },
              { key: 'unlimitedStorage' as const, label: 'Unlimited Storage' },
              { key: 'unlimitedBandwidth' as const, label: 'Unlimited Bandwidth' },
              { key: 'nodejsSupport' as const, label: 'Node.js Support' },
              { key: 'pythonSupport' as const, label: 'Python Support' },
            ].map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.features[key]}
                  onChange={() => toggleFeature(key)}
                  className="h-4 w-4 rounded border-border-medium bg-bg-elevated text-accent focus:ring-accent"
                />
                <span className="text-text-secondary">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* WordPress */}
      <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
        <button
          onClick={() => toggleSection('wordpress')}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground"
        >
          WordPress
          {expandedSections.wordpress ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.wordpress && (
          <div className="mt-3 space-y-2">
            {[
              { key: 'wordpressOptimized' as const, label: 'WP Optimized' },
              { key: 'woocommerceOptimized' as const, label: 'WooCommerce Ready' },
              { key: 'litespeedCache' as const, label: 'LiteSpeed Cache' },
            ].map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.features[key]}
                  onChange={() => toggleFeature(key)}
                  className="h-4 w-4 rounded border-border-medium bg-bg-elevated text-accent focus:ring-accent"
                />
                <span className="text-text-secondary">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Support */}
      <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
        <button
          onClick={() => toggleSection('support')}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground"
        >
          Support
          {expandedSections.support ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.support && (
          <div className="mt-3 space-y-2">
            {[
              { key: 'liveChatSupport' as const, label: 'Live Chat' },
              { key: 'phoneSupport' as const, label: 'Phone Support' },
            ].map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.features[key]}
                  onChange={() => toggleFeature(key)}
                  className="h-4 w-4 rounded border-border-medium bg-bg-elevated text-accent focus:ring-accent"
                />
                <span className="text-text-secondary">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Compliance */}
      <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
        <button
          onClick={() => toggleSection('compliance')}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground"
        >
          Compliance
          {expandedSections.compliance ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.compliance && (
          <div className="mt-3 space-y-2">
            {[
              { key: 'gdprCompliance' as const, label: 'GDPR Compliant' },
              { key: 'pciCompliance' as const, label: 'PCI Compliant' },
            ].map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.features[key]}
                  onChange={() => toggleFeature(key)}
                  className="h-4 w-4 rounded border-border-medium bg-bg-elevated text-accent focus:ring-accent"
                />
                <span className="text-text-secondary">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Best For / Suitability */}
      <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
        <button
          onClick={() => toggleSection('suitability')}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground"
        >
          Best For
          {expandedSections.suitability ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.suitability && (
          <div className="mt-3 space-y-2">
            {[
              { key: 'beginner' as const, label: 'Beginners' },
              { key: 'blogger' as const, label: 'Bloggers' },
              { key: 'developer' as const, label: 'Developers' },
              { key: 'ecommerce' as const, label: 'eCommerce' },
              { key: 'enterprise' as const, label: 'Enterprise' },
            ].map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.suitability[key]}
                  onChange={() => toggleSuitability(key)}
                  className="h-4 w-4 rounded border-border-medium bg-bg-elevated text-accent focus:ring-accent"
                />
                <span className="text-text-secondary">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
