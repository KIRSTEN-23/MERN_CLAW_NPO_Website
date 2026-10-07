import React, { useEffect, useState } from 'react';
import { Navigation } from './public.js';
import { HomeImage } from './home-assets.js';
const h = React.createElement;
export function Header({ home = false }) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > 0);
  useEffect(() => {
    if (!home) return;
    const update = () => setScrolled(window.scrollY > 0);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [home]);
  const transparent = home && !scrolled;
  return h('header', { className: home ? `home-navigation fixed-top${transparent ? ' is-transparent' : ' is-solid'}` : 'surface-400',
    'data-layout': 'navigation-parent' }, h(Navigation, { transparent }));
}
export function Footer() {
  const links = [['Home', '#/'], ['About Us', '#/?section=about'], ['Our Dogs', '#/dogs'],
    ['Donate', '#/?section=donation'], ['Contact Us', '#/?section=footer-container']];
  return h('footer', { className: 'surface-500', id: 'footer-container', 'data-layout': 'footer-container' },
    h('div', { className: 'container-fluid layout-width px-3 px-lg-5 py-4 py-lg-5' },
      h('div', { className: 'row g-3', 'data-layout': 'footer-columns' },
        h('div', { className: 'col-12 col-lg-6 d-flex flex-column gap-3' },
          h('div', { className: 'surface-300 d-flex flex-column flex-lg-row align-items-start gap-3', 'data-layout': 'brand-assets-parent' },
            h('a', { href: '#/', 'aria-label': 'CLAW home' }, h('img', { src: '/public/assets/shared/logo.svg', width: 123, height: 32, alt: 'CLAW' })),
            h(HomeImage, { asset: 'ifaw', alt: 'International Fund for Animal Welfare', className: 'home-ifaw-logo' })),
          h('p', { className: 'page-copy footer-copy surface-400' }, 'We Are a Community Led Animal Welfare project of the International Fund for Animal Welfare dedicated to rescuing, rehabilitating and rehoming animals in need.'),
          h('p', { className: 'page-copy footer-copy fw-semibold' }, 'Thank you for supporting our mission!')),
        h('div', { className: 'col-12 col-lg-3 d-flex flex-column gap-3' },
          h('h2', { className: 'page-copy footer-heading' }, 'Links'),
          h('nav', { className: 'd-flex flex-column gap-3', 'aria-label': 'Footer navigation' },
            ...links.map(([label, href]) => h('a', { key: label, href }, label)))),
        h('div', { className: 'col-12 col-lg-3 d-flex flex-column gap-3' },
          h('h2', { className: 'page-copy footer-heading' }, 'Contact Us'),
          h('p', { className: 'page-copy footer-copy' }, 'Un-named Rd, Durban Deep, Roodepoort 237-Iq, Johannesburg, 1724'),
          h('a', { href: 'mailto:CLAWsouthafrica@gmail.com', className: 'footer-copy' }, 'CLAWsouthafrica@gmail.com')))),
    h('div', { className: 'surface-300 p-2', 'data-layout': 'copyright-parent' },
      h('p', { className: 'page-copy footer-copy' }, '©2005 CLAW. All rights reserved.')));
}
