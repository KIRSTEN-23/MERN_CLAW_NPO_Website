// Opt-in GA4 measurement. No Google requests before consent; no contact/form data is sent.
import React, { useEffect, useState } from 'react';
const h = React.createElement;
const key = 'claw-analytics-consent';
let measurementId = '', initialized = false, lastPage = '', currentRoute = { path: '/' };
const allowedRoutes = new Set(['/', '/dogs', '/dogs/details', '/virtual-adoption', '/terms', '/donate', '/login', '/signup']);
function savedConsent() { try { return localStorage.getItem(key); } catch { return null; } }
function sendPage() {
  if (!initialized || savedConsent() !== 'granted') return;
  const path = allowedRoutes.has(currentRoute.path) ? currentRoute.path : '/';
  // Ignore arbitrary query strings, dog IDs, section anchors and user-provided URLs.
  const page = `${location.origin}/#${path}`;
  if (lastPage === page) return;
  const previous = lastPage; lastPage = page;
  window.gtag('event', 'page_view', { page_location: page, page_title: document.title, page_referrer: previous });
}
async function enable() {
  if (initialized) return sendPage();
  try {
    const response = await fetch('/api/public-config');
    if (!response.ok) return;
    const config = await response.json();
    if (!/^G-[A-Z0-9]+$/.test(config.gaMeasurementId || '') || savedConsent() !== 'granted' || initialized) return;
    measurementId = config.gaMeasurementId;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    // Manual page views support hash routing. Disable automatic page views in the GA stream too.
    window.gtag('config', measurementId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement('script'); script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(script); initialized = true; sendPage();
  } catch { /* Measurement must never interrupt browsing or a successful form submission. */ }
}
export function trackPage(route) { currentRoute = route; if (savedConsent() === 'granted') enable(); }
export function trackEvent(name) {
  if (!initialized || savedConsent() !== 'granted') return;
  if (name === 'sign_up') window.gtag('event', name, { method: 'email' });
  if (name === 'demo_contribution_request') window.gtag('event', name, { demonstration: true });
}
export function AnalyticsConsent() {
  const [choice, setChoice] = useState(savedConsent);
  const [configured, setConfigured] = useState(false);
  useEffect(() => { fetch('/api/public-config').then(r => r.ok ? r.json() : {}).then(c => setConfigured(/^G-[A-Z0-9]+$/.test(c.gaMeasurementId || ''))).catch(() => {}); }, []);
  const choose = value => {
    try { localStorage.setItem(key, value); } catch { return; }
    setChoice(value);
    if (value === 'granted') enable();
    else if (initialized) { window.gtag('consent', 'update', { analytics_storage: 'denied' }); location.reload(); }
  };
  if (!configured) return null;
  return h('aside', { className: 'claw-theme position-fixed bottom-0 end-0 m-3 p-3 rounded-3 shadow bg-white', style: { zIndex: 1080, maxWidth: '26rem' }, 'aria-label': 'Analytics preferences' },
    choice ? h('button', { className: 'btn btn-sm btn-outline-secondary', onClick: () => setChoice(null) }, 'Analytics preferences') : h(React.Fragment, null,
      h('p', { className: 'mb-2' }, 'Allow optional Google Analytics cookies to help evaluate this student project? We measure page views and successful demo actions. Browsing works without them.'),
      h('div', { className: 'd-flex gap-2' }, h('button', { className: 'btn btn-sm btn-outline-secondary', onClick: () => choose('denied') }, 'Decline'), h('button', { className: 'btn btn-sm btn-dark', onClick: () => choose('granted') }, 'Allow analytics'))));
}
