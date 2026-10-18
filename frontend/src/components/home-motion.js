// Homepage-only scroll animation lifecycle. Respect reduced motion and clean up observers and animations when the page unmounts.
import { useEffect } from 'react';

// Loaded only when Home mounts; library failure leaves all content readable.
const loadMotion = () => import('https://esm.sh/motion@12.23.24?external=react');
export function useHomeMotion() {
  useEffect(() => {
    const root = document.querySelector('.home-assets-page > main');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!root || preference.matches) return;
    let disposed = false;
    const cleanups = [];
    const animations = new Set();
    const currentAnimations = new Map();
    const originals = new Map();
    const seen = new WeakSet();
    const restore = () => {
      animations.forEach(animation => animation.stop());
      animations.clear();
      originals.forEach((style, element) => {
        element.style.opacity = style.opacity;
        element.style.transform = style.transform;
      });
    };
    const cleanup = () => {
      disposed = true;
      cleanups.forEach(stop => stop());
      restore();
    };
    const onPreference = () => { if (preference.matches) cleanup(); };
    preference.addEventListener('change', onPreference);
    loadMotion().then(({ animate, inView }) => {
      if (disposed || preference.matches) return;
      const reveal = (element, delay = 0.25) => {
        const previous = currentAnimations.get(element);
        if (previous) { previous.stop(); animations.delete(previous); }
        element.style.opacity = '0';
        const animation = animate(element, { opacity: [0, 0, 1], y: [32, 24, 0] }, {
          duration: 1.15, delay, times: [0, 0.18, 1], ease: 'easeOut',
        });
        animations.add(animation);
        currentAnimations.set(element, animation);
        animation.then(() => {
          animations.delete(animation);
          const original = originals.get(element);
          if (original && !disposed && currentAnimations.get(element) === animation) {
            currentAnimations.delete(element);
            element.style.opacity = original.opacity;
            element.style.transform = original.transform;
          }
        });
      };
      const remember = element => {
        originals.set(element, { opacity: element.style.opacity, transform: element.style.transform });
        seen.add(element);
      };
      const hero = root.querySelector(window.innerWidth >= 992
        ? '[data-layout="hero-desktop-content-group"]' : '[data-layout="hero-content-group"]');
      if (hero) [...hero.children].forEach((element, index) => {
        remember(element);
        reveal(element, 0.35 + Math.min(index * 0.18, 0.72));
      });
      const selector = '.section-introduction, [data-layout="mission-columns"], [data-layout="care-columns"], .care-carousel, [data-layout="adopt-desktop-composition-parent"], [data-layout="adopt-information-group"], [data-layout="donation-columns"]';
      const scan = () => root.querySelectorAll(selector).forEach(element => {
        if (seen.has(element) || !element.getClientRects().length) return;
        remember(element);
        element.style.opacity = '0';
        const stop = inView(element, () => {
          reveal(element);
          // Returning a leave callback keeps Motion observing for re-entry.
          return () => {
            const animation = currentAnimations.get(element);
            if (animation) { animation.stop(); animations.delete(animation); }
            currentAnimations.delete(element);
            element.style.transform = originals.get(element).transform;
            element.style.opacity = '0';
          };
        }, { amount: 'some' });
        cleanups.push(stop);
        const onFocus = () => { stop(); element.style.opacity = '1'; };
        element.addEventListener('focusin', onFocus, { once: true });
        cleanups.push(() => element.removeEventListener('focusin', onFocus));
      });
      scan();
      const observer = new MutationObserver(scan);
      observer.observe(root, { childList: true, subtree: true });
      const onResize = () => scan();
      window.addEventListener('resize', onResize);
      cleanups.push(() => observer.disconnect(), () => window.removeEventListener('resize', onResize));
    }).catch(() => { restore(); });
    return () => {
      cleanup();
      preference.removeEventListener('change', onPreference);
    };
  }, []);
}
