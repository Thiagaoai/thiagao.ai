'use client';

import { useEffect } from 'react';

type NewsletterEvent = {
  eventType: 'page_view' | 'cta_click';
  path: string;
  source: string;
  metadata?: Record<string, unknown>;
};

function track(event: NewsletterEvent) {
  const payload = JSON.stringify(event);

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/newsletter/track', new Blob([payload], { type: 'application/json' }));
    return;
  }

  fetch('/api/newsletter/track', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

export default function NewsletterTelemetry() {
  useEffect(() => {
    track({
      eventType: 'page_view',
      path: window.location.pathname,
      source: 'newsletter-page',
      metadata: {
        referrer: document.referrer || null,
        hash: window.location.hash || null,
      },
    });

    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest('a') : null;
      const href = target?.getAttribute('href');
      if (!href) return;

      const isTrackedCta =
        href === '#assinar' ||
        href === '#weekly-news' ||
        href.includes('open.spotify.com') ||
        href.includes('/admin/login');

      if (!isTrackedCta) return;

      track({
        eventType: 'cta_click',
        path: window.location.pathname,
        source: 'newsletter-page',
        metadata: {
          href,
          label: target?.textContent?.trim().slice(0, 80) || null,
        },
      });
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
