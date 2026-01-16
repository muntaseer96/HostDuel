'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { load, trackPageview } from 'fathom-client';

const FATHOM_SITE_ID = 'XHCUIPQR';

function FathomTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    load(FATHOM_SITE_ID, {
      auto: false, // Disable auto tracking, we'll handle it manually
    });
  }, []);

  useEffect(() => {
    if (!pathname) return;

    // Build the full URL for tracking
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    trackPageview({
      url,
      referrer: document.referrer,
    });
  }, [pathname, searchParams]);

  return null;
}

export function Fathom() {
  return (
    <Suspense fallback={null}>
      <FathomTracker />
    </Suspense>
  );
}
