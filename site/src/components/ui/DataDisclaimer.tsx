import Link from 'next/link';
import { Info } from 'lucide-react';

interface DataDisclaimerProps {
  className?: string;
}

export function DataDisclaimer({ className = '' }: DataDisclaimerProps) {
  return (
    <p className={`text-xs text-text-muted flex items-start gap-1.5 ${className}`}>
      <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
      <span>
        We strive for accuracy, but pricing and features change frequently.
        Some data may be outdated.{' '}
        <Link href="/contact" className="text-accent hover:underline">
          Report an error
        </Link>{' '}
        and we&apos;ll update it promptly.
      </span>
    </p>
  );
}
