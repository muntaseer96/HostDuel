'use client';

import { useEffect, useState } from 'react';
import { List, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TOCItem } from '@/types/blog';

interface TableOfContentsProps {
  items: TOCItem[];
  className?: string;
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
        threshold: 0,
      }
    );

    // Observe all heading elements
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={cn('rounded-xl bg-bg-secondary border border-border-subtle', className)}>
      {/* Header - clickable on mobile to toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 lg:cursor-default"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <List className="h-4 w-4" />
          Table of Contents
        </div>
        <div className="lg:hidden">
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 text-text-muted" />
          ) : (
            <ChevronUp className="h-4 w-4 text-text-muted" />
          )}
        </div>
      </button>

      {/* TOC Items */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isCollapsed ? 'max-h-0' : 'max-h-[500px]',
          'lg:max-h-none'
        )}
      >
        <ul className="px-4 pb-4 space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleClick(item.id)}
                className={cn(
                  'w-full text-left text-sm py-1.5 px-2 rounded-lg transition-colors',
                  'hover:bg-bg-elevated hover:text-foreground',
                  item.level === 3 && 'pl-5',
                  activeId === item.id
                    ? 'text-accent bg-accent/10'
                    : 'text-text-secondary'
                )}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
