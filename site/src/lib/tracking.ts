import { trackEvent } from 'fathom-client';

/**
 * Track host-related clicks for analytics
 * Events will appear in Fathom dashboard under "Events"
 *
 * We track specific host events like "visit_hostinger" or "details_bluehost"
 * so you can see which hosts get the most engagement.
 */

export type ClickAction = 'visit_site' | 'view_details';

export function trackHostClick(hostId: string, hostName: string, action: ClickAction) {
  // Create readable event name: "visit_hostinger" or "details_bluehost"
  const prefix = action === 'visit_site' ? 'visit' : 'details';
  const eventName = `${prefix}_${hostId}`;

  try {
    // Track the specific host event
    trackEvent(eventName);

    // Log in dev for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Fathom] ${eventName} (${hostName})`);
    }
  } catch (error) {
    // Silently fail - don't break UX for analytics
    if (process.env.NODE_ENV === 'development') {
      console.error('[Fathom] Failed to track:', error);
    }
  }
}
