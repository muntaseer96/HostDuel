import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
}

/** URL for a given page: page 1 is the canonical /blog, the rest are /blog/page/N. */
function pageHref(page: number): string {
  return page <= 1 ? '/blog' : `/blog/page/${page}`;
}

/**
 * Build the list of page tokens to render, collapsing long runs with an ellipsis.
 * e.g. 1 … 4 5 [6] 7 8 … 12
 */
function pageTokens(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const tokens: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) tokens.push('ellipsis');
  for (let p = start; p <= end; p++) tokens.push(p);
  if (end < total - 1) tokens.push('ellipsis');
  tokens.push(total);
  return tokens;
}

export function BlogPagination({ currentPage, totalPages }: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const tokens = pageTokens(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const baseItem =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors';

  return (
    <nav
      className="mt-14 flex items-center justify-center gap-2"
      aria-label="Blog pagination"
    >
      {hasPrev ? (
        <Link
          href={pageHref(currentPage - 1)}
          rel="prev"
          className={`${baseItem} border-border-subtle text-text-secondary hover:border-accent/40 hover:text-foreground`}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={`${baseItem} border-border-subtle/50 text-text-muted opacity-40`}
          aria-hidden="true"
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {tokens.map((token, i) =>
        token === 'ellipsis' ? (
          <span
            key={`e-${i}`}
            className="inline-flex h-10 min-w-10 items-center justify-center text-text-muted"
          >
            &hellip;
          </span>
        ) : token === currentPage ? (
          <span
            key={token}
            aria-current="page"
            className={`${baseItem} border-accent bg-accent text-bg-primary`}
          >
            {token}
          </span>
        ) : (
          <Link
            key={token}
            href={pageHref(token)}
            className={`${baseItem} border-border-subtle text-text-secondary hover:border-accent/40 hover:text-foreground`}
          >
            {token}
          </Link>
        )
      )}

      {hasNext ? (
        <Link
          href={pageHref(currentPage + 1)}
          rel="next"
          className={`${baseItem} border-border-subtle text-text-secondary hover:border-accent/40 hover:text-foreground`}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={`${baseItem} border-border-subtle/50 text-text-muted opacity-40`}
          aria-hidden="true"
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
