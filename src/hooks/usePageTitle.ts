import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Route-to-title map for centralized document title management
 */
export const PAGE_TITLES: Record<string, string> = {
  '/': 'Fuenzer Journal | Personal Gemini Journal',
  '/login': 'Fuenzer Journal | Login',
  '/privacy': 'Fuenzer Journal | Privacy',
  '/terms': 'Fuenzer Journal | Terms',
  '/app': 'Fuenzer Journal | Reflection Studio',
  '/archive': 'Fuenzer Journal | Archive',
  '/analytics': 'Fuenzer Journal | Analytics',
  '/404': 'Fuenzer Journal | Page Not Found',
};

export const DEFAULT_PAGE_TITLE = 'Fuenzer Journal | Personal Gemini Journal';

/**
 * Helper to get title based on pathname
 */
export function getTitleForPathname(pathname: string): string {
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname];
  }
  if (pathname.startsWith('/archive')) {
    return PAGE_TITLES['/archive'];
  }
  if (pathname.startsWith('/analytics')) {
    return PAGE_TITLES['/analytics'];
  }
  if (pathname.startsWith('/app')) {
    return PAGE_TITLES['/app'];
  }
  return 'Fuenzer Journal | Page Not Found';
}

/**
 * Custom hook to dynamically set document title for a specific component
 */
export function usePageTitle(customTitle?: string) {
  const location = useLocation();

  useEffect(() => {
    const titleToSet = customTitle || getTitleForPathname(location.pathname);
    document.title = titleToSet;
  }, [customTitle, location.pathname]);
}

/**
 * Router component that listens to route changes and synchronizes document.title
 */
export function PageTitleManager() {
  const location = useLocation();

  useEffect(() => {
    const title = getTitleForPathname(location.pathname);
    document.title = title;
  }, [location.pathname]);

  return null;
}
