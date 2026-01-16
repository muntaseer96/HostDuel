import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  hostName: string;
}

export function Breadcrumbs({ hostName }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      <Link
        href="/"
        className="flex items-center gap-1 text-text-secondary hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      <ChevronRight className="h-4 w-4 text-text-muted" />
      <Link
        href="/#compare"
        className="text-text-secondary hover:text-foreground transition-colors"
      >
        Compare Hosts
      </Link>
      <ChevronRight className="h-4 w-4 text-text-muted" />
      <span className="text-foreground font-medium">{hostName}</span>
    </nav>
  );
}
