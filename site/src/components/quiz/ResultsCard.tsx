'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink, Check, Trophy, Medal, Award } from 'lucide-react';
import type { HostScore } from '@/types/quiz';

interface ResultsCardProps {
  result: HostScore;
  rank: number;
  className?: string;
}

const rankIcons = [Trophy, Medal, Award];
const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

export function ResultsCard({ result, rank, className }: ResultsCardProps) {
  const { host, score, matchReasons } = result;
  const RankIcon = rankIcons[rank] || Award;
  const rankColor = rankColors[rank] || 'text-text-secondary';

  // Get price to display
  const price = host.monthlyPrice;
  const renewalPrice = host.renewalPrice;

  return (
    <div
      className={cn(
        'relative p-6 rounded-2xl border-2 transition-all duration-300',
        rank === 0
          ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
          : 'border-border-subtle bg-bg-secondary hover:border-accent/30',
        className
      )}
    >
      {/* Rank badge */}
      <div className="absolute -top-3 -left-3">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            rank === 0 ? 'bg-accent text-background' : 'bg-bg-elevated text-foreground'
          )}
        >
          <RankIcon className={cn('w-5 h-5', rank === 0 ? '' : rankColor)} />
        </div>
      </div>

      {/* Match score */}
      <div className="absolute top-4 right-4">
        <div className="text-right">
          <div className="text-3xl font-bold text-accent">{score}%</div>
          <div className="text-xs text-text-secondary">match</div>
        </div>
      </div>

      {/* Host info */}
      <div className="mt-4">
        <h3 className="text-xl font-bold text-foreground">{host.name}</h3>
        {host.hostingType && (
          <Badge variant="default" size="sm" className="mt-1">
            {host.hostingType.replace(/-/g, ' ')}
          </Badge>
        )}
      </div>

      {/* Match reasons */}
      <div className="mt-4 space-y-2">
        {matchReasons.map((reason, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-success flex-shrink-0" />
            <span className="text-text-secondary">{reason}</span>
          </div>
        ))}
      </div>

      {/* Pricing */}
      {price !== null && (
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              ${price.toFixed(2)}
            </span>
            <span className="text-text-secondary">/month</span>
          </div>
          {renewalPrice && renewalPrice !== price && (
            <div className="text-xs text-text-muted mt-1">
              Renews at ${renewalPrice.toFixed(2)}/mo
            </div>
          )}
        </div>
      )}

      {/* Ratings */}
      <div className="mt-4 flex items-center gap-4">
        {host.overallRating && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">&#9733;</span>
            <span className="text-sm font-medium">{host.overallRating.toFixed(1)}</span>
            <span className="text-xs text-text-muted">rating</span>
          </div>
        )}
        {host.uptimeGuarantee && (
          <div className="text-sm text-text-secondary">
            {host.uptimeGuarantee}% uptime
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <Link href={`/hosting/${host.id}`} className="flex-1">
          <Button variant="outline" size="md" className="w-full">
            View Details
          </Button>
        </Link>
        {host.websiteUrl && (
          <a
            href={host.websiteUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-1"
          >
            <Button variant="primary" size="md" className="w-full">
              Visit Site
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
