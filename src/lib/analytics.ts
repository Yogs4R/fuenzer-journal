/**
 * Google Analytics & Cookie Consent Manager for Fuenzer Journal
 * Measurement ID: G-90FWP0F2D3
 */

export const GA_MEASUREMENT_ID = 'G-90FWP0F2D3';
export const COOKIE_CONSENT_KEY = 'fuenzer_cookie_consent_v1';

export type CookieConsentStatus = 'accepted' | 'rejected' | 'undecided';

/**
 * Get current cookie consent status from localStorage
 */
export function getCookieConsentStatus(): CookieConsentStatus {
  try {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (saved === 'accepted' || saved === 'rejected') {
      return saved;
    }
  } catch (e) {
    console.warn('Unable to access localStorage for cookie consent', e);
  }
  return 'undecided';
}

/**
 * Initialize Google Analytics script conditionally upon explicit user consent
 */
export function initializeGoogleAnalytics(): void {
  if (typeof window === 'undefined') return;

  // Ensure not loaded multiple times
  if (document.getElementById('ga-gtag-script')) {
    return;
  }

  try {
    // Inject Google Analytics gtag.js script
    const script = document.createElement('script');
    script.id = 'ga-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag function
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure',
    });

    console.info(`[Fuenzer Analytics] Initialized Google Analytics (${GA_MEASUREMENT_ID})`);
  } catch (err) {
    console.error('Failed to initialize Google Analytics:', err);
  }
}

/**
 * Disable Google Analytics and remove tracking cookies if user rejects
 */
export function disableGoogleAnalytics(): void {
  if (typeof window === 'undefined') return;

  try {
    (window as any)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    const existingScript = document.getElementById('ga-gtag-script');
    if (existingScript) {
      existingScript.remove();
    }
    console.info('[Fuenzer Analytics] Google Analytics tracking disabled (essential storage only)');
  } catch (e) {
    console.warn('Error disabling analytics', e);
  }
}

/**
 * Save user cookie consent choice
 */
export function setCookieConsentStatus(status: 'accepted' | 'rejected'): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, status);
    if (status === 'accepted') {
      initializeGoogleAnalytics();
    } else {
      disableGoogleAnalytics();
    }
  } catch (e) {
    console.warn('Error saving cookie consent', e);
  }
}

/**
 * Track custom user interaction events safely (no-op if user rejected analytics)
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;
  if (getCookieConsentStatus() !== 'accepted') return;

  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
}
