import React from 'react';
const h = React.createElement;
export const homeAssets = {
  hero: ['/public/assets/home/hero.png', 1225, 1080],
  heroPhoto: ['/public/assets/home/hero-photo.png', 1920, 1496],
  heroSmall: ['/public/assets/home/hero-small.png', 2177, 1920],
  rescue: ['/public/assets/home/about-rescue.png', 688, 604],
  puppy: ['/public/assets/home/about-puppy.png', 681, 519],
  adoption: ['/public/assets/home/adoption-puppies.png', 1046, 757],
  bella: ['/public/assets/home/bella.png', 439, 415],
  ifaw: ['/public/assets/home/ifaw-logo.png', 193, 69],
};
export function HomeImage({ asset, alt, className = '', eager = false }) {
  const [src, width, height] = homeAssets[asset];
  return h('img', { src, width, height, alt, className: `home-image ${className}`,
    loading: eager ? 'eager' : 'lazy', decoding: 'async' });
}
