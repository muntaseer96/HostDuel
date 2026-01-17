import { trackEvent } from 'fathom-client';

/**
 * Track host-related clicks for analytics
 * Events will appear in Fathom dashboard under "Events"
 */

export type ClickAction = 'visit_site' | 'view_details' | 'compare_select';

export function trackHostClick(hostId: string, hostName: string, action: ClickAction) {
  // Fathom event name format: "host_click_{action}"
  // The event value will show the host name in analytics
  const eventName = `host_${action}`;

  try {
    // Track with host info - Fathom will aggregate these
    trackEvent(eventName, {
      _site_id: undefined, // Uses default site
      _value: 1, // Count each click as 1
    });

    // Also track specific host for detailed breakdown
    trackEvent(`${eventName}:${hostId}`);

    // Log in dev for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}: ${hostName} (${hostId})`);
    }
  } catch (error) {
    // Silently fail - don't break UX for analytics
    if (process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Failed to track event:', error);
    }
  }
}
