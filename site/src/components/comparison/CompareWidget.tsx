'use client';

import { X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

interface CompareWidgetProps {
  selectedHosts: Array<{ id: string; name: string }>;
  onRemove: (id: string) => void;
  onClear: () => void;
  maxHosts?: number;
}

export function CompareWidget({
  selectedHosts,
  onRemove,
  onClear,
  maxHosts = 2,
}: CompareWidgetProps) {
  if (selectedHosts.length === 0) return null;

  const compareUrl =
    selectedHosts.length >= 2
      ? `/compare/${selectedHosts
          .map((h) => h.id)
          .sort()
          .join('-vs-')}`
      : '#';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-accent/30 bg-bg-secondary/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Selected Hosts */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="shrink-0 text-sm text-text-secondary">
            Compare ({selectedHosts.length}/{maxHosts}):
          </span>
          <div className="flex gap-2">
            {selectedHosts.map((host) => (
              <div
                key={host.id}
                className="flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1"
              >
                <span className="max-w-[100px] truncate text-sm font-medium text-accent">
                  {host.name}
                </span>
                <button
                  onClick={() => onRemove(host.id)}
                  className="text-accent/70 hover:text-accent"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onClear}>
            Clear
          </Button>
          {selectedHosts.length >= 2 ? (
            <Link href={compareUrl}>
              <Button size="sm">
                Compare Now
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button size="sm" disabled>
              Select {2 - selectedHosts.length} more
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
