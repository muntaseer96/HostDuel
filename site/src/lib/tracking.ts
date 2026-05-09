declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

export type ClickAction = 'visit_site' | 'view_details';

export function trackHostClick(hostId: string, hostName: string, action: ClickAction) {
  const prefix = action === 'visit_site' ? 'visit' : 'details';
  const eventName = `${prefix}_${hostId}`;

  try {
    if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
      window.plausible(eventName, { props: { host: hostName } });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Plausible] ${eventName} (${hostName})`);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Plausible] Failed to track:', error);
    }
  }
}
