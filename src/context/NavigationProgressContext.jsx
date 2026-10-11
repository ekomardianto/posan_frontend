'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import LoadingPage from '../components/ui/LoadingPage.jsx';

const NavigationProgressContext = createContext(null);
const MINIMUM_VISIBLE_MS = 320;
const NAVIGATION_TIMEOUT_MS = 12000;

export function NavigationProgressProvider({ children }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const startedAt = useRef(0);
  const hideTimer = useRef(null);
  const timeoutTimer = useRef(null);
  const progressTimer = useRef(null);

  const clearProgressTimer = useCallback(() => {
    clearInterval(progressTimer.current);
    progressTimer.current = null;
  }, []);

  const startNavigation = useCallback(() => {
    if (!startedAt.current) startedAt.current = Date.now();
    setIsNavigating(true);
    setProgress((current) => (current >= 90 ? current : Math.max(current, 8)));
    clearTimeout(hideTimer.current);
    clearTimeout(timeoutTimer.current);
    clearProgressTimer();
    progressTimer.current = setInterval(() => {
      setProgress((current) => current >= 90 ? 90 : Math.min(90, current + Math.max(1, (90 - current) * 0.08)));
    }, 120);
    timeoutTimer.current = setTimeout(() => {
      clearProgressTimer();
      setProgress(100);
      hideTimer.current = setTimeout(() => {
        startedAt.current = 0;
        setIsNavigating(false);
        setProgress(0);
      }, 340);
    }, NAVIGATION_TIMEOUT_MS);
  }, [clearProgressTimer]);

  const finishNavigation = useCallback(() => {
    if (!startedAt.current) return;
    clearTimeout(timeoutTimer.current);
    clearProgressTimer();
    setProgress(100);
    const elapsed = Date.now() - startedAt.current;
    hideTimer.current = setTimeout(() => {
      startedAt.current = 0;
      setIsNavigating(false);
      setProgress(0);
    }, Math.max(340, MINIMUM_VISIBLE_MS - elapsed));
  }, [clearProgressTimer]);

  useEffect(() => {
    finishNavigation();
  }, [pathname, finishNavigation]);

  useEffect(() => {
    const handleNavigationClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const link = target.closest('a[href]');
      if (link && !link.target && !link.hasAttribute('download')) {
        const destination = new URL(link.href, window.location.href);
        if (destination.origin === window.location.origin && destination.pathname !== window.location.pathname) {
          startNavigation();
          return;
        }
      }

      const adminNavButton = target.closest('.sidebar-nav-list .nav-item-btn, .sidebar-footer .nav-item-btn:not(.btn-logout)');
      if (adminNavButton && !adminNavButton.classList.contains('active')) {
        startNavigation();
      }
    };

    document.addEventListener('click', handleNavigationClick, true);
    return () => document.removeEventListener('click', handleNavigationClick, true);
  }, [startNavigation]);

  useEffect(() => () => {
    clearTimeout(hideTimer.current);
    clearTimeout(timeoutTimer.current);
    clearProgressTimer();
  }, [clearProgressTimer]);

  const value = { startNavigation, finishNavigation };

  return (
    <NavigationProgressContext.Provider value={value}>
      {children}
      {isNavigating && <LoadingPage title="Memuat halaman..." progress={progress} />}
    </NavigationProgressContext.Provider>
  );
}

export function useNavigationProgress() {
  const context = useContext(NavigationProgressContext);
  if (!context) throw new Error('useNavigationProgress must be used within NavigationProgressProvider');
  return context;
}

export function useProgressRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const { startNavigation } = useNavigationProgress();

  const push = useCallback((href, options) => {
    const destination = typeof href === 'string' ? new URL(href, window.location.href).pathname : href?.pathname;
    if (destination && destination !== pathname) startNavigation();
    router.push(href, options);
  }, [pathname, router, startNavigation]);

  const replace = useCallback((href, options) => {
    const destination = typeof href === 'string' ? new URL(href, window.location.href).pathname : href?.pathname;
    if (destination && destination !== pathname) startNavigation();
    router.replace(href, options);
  }, [pathname, router, startNavigation]);

  return useMemo(() => ({ ...router, push, replace }), [router, push, replace]);
}
