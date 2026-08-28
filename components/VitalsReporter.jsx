'use client';

import { useEffect } from 'react';

/**
 * Dev-only Core Web Vitals reporter.
 * Prints TTFB / FCP / LCP / CLS / long-task budget to the console so the
 * experience can be profiled on a real device during `next dev`.
 * Never included in production bundles (see conditional import in Portfolio).
 */
export default function VitalsReporter() {
  useEffect(() => {
    const style = 'color:#d7aa50;font-weight:bold';
    const log = (label, value, unit = '') => console.info(`%c[web-vitals] ${label}: %c${value}${unit}`, style, 'color:currentColor');
    const observers = [];
    const pagehideHandlers = [];

    const addPagehide = (handler) => {
      pagehideHandlers.push(handler);
      window.addEventListener('pagehide', handler, { once: true });
    };

    try {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) log('TTFB', Math.round(nav.responseStart), 'ms');
    } catch { /* ignore */ }

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') log('FCP', Math.round(entry.startTime), 'ms');
        }
      });
      observer.observe({ type: 'paint', buffered: true });
      observers.push(observer);
    } catch { /* ignore */ }

    try {
      let lcp = null;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length) {
          lcp = entries[entries.length - 1];
          log('LCP (candidate)', Math.round(lcp.startTime), 'ms');
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(observer);
      addPagehide(() => {
        if (lcp) log('LCP (final)', Math.round(lcp.startTime), 'ms');
      });
    } catch { /* ignore */ }

    try {
      let cls = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) cls += entry.value;
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      observers.push(observer);
      addPagehide(() => log('CLS (final)', +cls.toFixed(4)));
    } catch { /* ignore */ }

    try {
      let slowTasks = 0;
      let worst = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 100) {
            slowTasks += 1;
            worst = Math.max(worst, entry.duration);
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
      observers.push(observer);
      addPagehide(() => log('long tasks >100ms', `${slowTasks} (worst ${Math.round(worst)}ms)`));
    } catch { /* ignore */ }

    return () => {
      observers.forEach((observer) => observer.disconnect());
      pagehideHandlers.forEach((handler) => window.removeEventListener('pagehide', handler));
    };
  }, []);

  return null;
}
