'use client';

import { trackHostClick, type ClickAction } from '@/lib/tracking';

interface TrackedLinkProps {
  href: string;
  hostId: string;
  hostName: string;
  action: ClickAction;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export function TrackedLink({
  href,
  hostId,
  hostName,
  action,
  children,
  className,
  target,
  rel,
}: TrackedLinkProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      onClick={() => trackHostClick(hostId, hostName, action)}
    >
      {children}
    </a>
  );
}
