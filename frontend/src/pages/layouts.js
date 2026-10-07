import React from 'react';
import { HomeImage } from '../components/home-assets.js';
import { Header, Footer } from '../components/site-shell.js';
import { HeroActions, FeaturedDogs, DogListing, DonationForm, DogAttributes, AdoptionStatus, action } from '../components/public.js';
const h = React.createElement;
// Responsive page layouts, copy, supplied assets and Bootstrap components.
const group = (name, classes, children = [], tag = 'div', source) => h(tag, {
  key: name, className: classes, 'data-layout': name,
  ...(['about', 'donation'].includes(name) ? { id: name } : {}),
  ...(source ? { 'data-figma-node': source } : {}),
  ...(tag === 'section' ? { 'aria-label': name.replaceAll('-', ' ') } : {}),
}, ...children);
const componentHosts = {
  'featured-dogs-collection-parent': () => h(FeaturedDogs, { mobile: true }),
  'featured-dogs-desktop-carousel-parent': () => h(FeaturedDogs),
  'browse-actions-parent': () => action(['Browse All Pups ', h('i', { key: 'arrow', className: 'bi bi-arrow-up-right ms-2', 'aria-hidden': true })], '#/dogs'),
  'in-care-desktop-browse-actions-parent': () => action(['Browse All Pups ', h('i', { key: 'arrow', className: 'bi bi-arrow-up-right ms-2', 'aria-hidden': true })], '#/dogs'),
  'adopt-actions-parent': () => action('View Available Pups', '#/dogs'),
  'adopt-desktop-actions-parent': () => action('View Available Pups', '#/dogs'),
  'donation-form-parent': () => h(DonationForm),
  'dog-attributes-parent': () => h(DogAttributes),
  'dog-status-parent': () => h(AdoptionStatus),
  'adoption-actions-parent': () => action('Adopt Now', '#/virtual-adoption'),
};
const dogsHeroImage = () => group('dogs-hero-assets-parent', 'surface-300 dogs-header-photo', [
  h('img', { src: '/public/assets/dogs/hero-photo.png', width: 1153, height: 532,
    alt: 'A woman holding a happy beagle', className: 'dogs-header-image', decoding: 'async' }),
]);
const imageHosts = {
  'dog-profile-assets-parent': ['bella', 'Bella, a brown Boerboel in CLAW’s care', ''],
  'hero-assets-parent': ['heroSmall', 'A woman spending time with a golden retriever', 'home-hero-mobile-image'],
  'hero-desktop-assets-parent': ['heroPhoto', 'A woman spending time with a golden retriever', 'home-hero-desktop-image'],
  'mission-assets-parent': ['rescue', 'A grey rescue dog at CLAW', ''],
  'care-assets-parent': ['puppy', 'A small white and tan puppy looking out of a box', ''],
  'adopt-assets-parent': ['adoption', 'Two puppies waiting for a home', ''],
  'adopt-desktop-assets-parent': ['adoption', 'Two puppies waiting for a home', ''],
};
const host = (name, size, shade = 200, extra = '') => name === 'dogs-hero-assets-parent' ? dogsHeroImage() : imageHosts[name]
  ? group(name, `surface-${shade} home-image-host ${extra}`, [h(HomeImage, {
      asset: imageHosts[name][0], alt: imageHosts[name][1], className: imageHosts[name][2], eager: name.startsWith('hero'),
    })])
  : componentHosts[name]
  ? group(name, `surface-${shade} ${extra}${['adopt-actions-parent', 'adopt-desktop-actions-parent'].includes(name) ? ' d-flex justify-content-end' : ''}`, [componentHosts[name]()])
  : group(name, `empty-host host-${size} surface-${shade} ${extra}`);
// Retain the original filled layout parents when inserting semantic text.
const copySurfaces = {
  'hero-description-parent': 'host-copy surface-300',
  'hero-desktop-description-parent': 'host-copy surface-300',
  'mission-copy-parent': 'host-copy surface-200 ',
  'care-copy-parent': 'host-copy surface-200 ',
  'appreciation-parent': 'host-compact surface-300',
  'in-care-desktop-heading-parent': 'host-heading surface-200',
  'in-care-desktop-tagline-parent': 'host-compact surface-300',
  'in-care-desktop-description-parent': 'host-copy surface-200',
  'adopt-copy-parent': 'host-copy surface-200',
  'adopt-desktop-copy-parent': 'host-copy surface-200',
  'donation-heading-parent': 'host-heading surface-200',
  'dog-name-parent': 'host-compact surface-200',
};
const copy = (name, tag, text, source, extra = '') => {
  const surface = copySurfaces[name] || (
    name.endsWith('-heading-parent') ? 'host-heading surface-200' :
    name.endsWith('-description-parent') ? 'host-compact surface-300' : '');
  const content = h(tag, { className: `page-copy ${extra}` }, text);
  return group(name, surface, [content], 'div', source);
};
const heroHeading = desktop => group(desktop ? 'hero-desktop-heading-parent' : 'hero-heading-parent',
  `host-heading surface-200 d-flex flex-column gap-3 hero-heading-group `, [
    copy('hero-eyebrow', 'p', 'Changing Lives. One Paw at a Time.', desktop ? '6224:32382' : '6373:42148', 'hero-eyebrow'),
    copy('hero-title', 'h1', [h('span', { key: 'adopt', className: 'hero-title-accent' }, 'Adopt'), ' a furry friend Today'], desktop ? '6224:32381' : '6373:42151', 'hero-title'),
  ]);
const heroActions = desktop => group(desktop ? 'hero-desktop-actions-parent' : 'hero-actions-parent',
  'surface-400', [h(HeroActions)], 'div', '6346:41727');
const personality = () => group('dog-personality-parent', 'host-copy surface-200 page-copy d-flex flex-column gap-3 personality-group', [
  copy('personality-heading', 'h2', 'Personality', '6378:42650', 'profile-heading'),
  h('ul', { key: 'traits', className: 'personality-list mb-0' }, ...[
    'Gentle and affectionate', 'Loyal to the people she trusts', 'Playful and energetic',
    'Enjoys attention from volunteers', 'Loves going for walks', 'Enjoys relaxing after playtime',
    'Building confidence every day',
  ].map(text => h('li', { key: text }, text))),
]);

const col = (name, classes, children) => group(name, classes, children);
const row = (name, children) => group(name, 'row g-3', children);
const stack = (name, children, extra = '') => group(name, `d-flex flex-column gap-3 ${extra}`, children);
const section = (name, children, shade = 100, source) => group(name, `surface-${shade} py-4 py-lg-5`,
  [group(`${name}-container`, 'container-fluid layout-width px-3 px-lg-5', children)], 'section', source);
const introductions = {
  about: ['About Us', 'Rescue. Rehabilitate. Rehome. Repeat.', '2844:2856', '6200:29566'],
  'in-care': ['Pups In Our Care', 'Learn their story. Become part of their journey.', '6373:42198', '6373:42201'],
  adopt: ['Virtually Adopt A Pup', 'You don’t have to take them home to give them one.', '6207:29922', '6207:29925'],
  'adopt-desktop': ['Virtually Adopt A Pup', 'You don’t have to take them home to give them one.', '6207:29922', '6207:29925'],
};
const intro = name => {
  if (name === 'dogs') return stack('dogs-intro-group', [
    copy('dogs-eyebrow', 'p', 'Meet our Dogs', '6227:32755', 'dogs-eyebrow'),
    copy('dogs-heading-parent', 'h1', 'Dogs in our Care', '6227:32498', 'dogs-title'),
    copy('dogs-description-parent', 'p', 'Find a Furry Friend whose story speaks to you and become part of their journey.', '2844:3077', 'body-copy'),
  ], 'justify-content-center text-start');
  const [title, tagline, titleSource, taglineSource] = introductions[name];
  return stack(`${name}-intro-group`, [
    copy(`${name}-heading-parent`, 'h2', title, titleSource, 'section-heading'),
    copy(`${name}-description-parent`, 'p', tagline, taglineSource, 'section-tagline'),
  ], 'text-center section-introduction');
};
const header = () => h(Header);
const page = (name, sections, extended = false) => group(name, `claw-theme${name === 'home' ? ' home-assets-page' : ''}`, [
  h(Header, { home: name === 'home' }),
  group(`${name}-main`, '', sections, 'main'), h(Footer),
]);

export function Home() {
  const heroPaw = () => h('div', { className: 'hero-paw-layer', 'aria-hidden': true },
    h('img', { src: '/public/assets/home/hero-paw.svg', width: 1082, height: 1080, alt: '' }));
  return page('home', [
    h('svg', { width: 0, height: 0, 'aria-hidden': true, style: { position: 'absolute' } },
      h('defs', null, h('clipPath', { id: 'care-section-wave', clipPathUnits: 'objectBoundingBox' },
        h('path', { d: 'M0 .105 C.06 .01 .16 .115 .32 .105 S.55 0 .76 .07 S.94 .115 1 .1 L1 .94 C.94 1 .91 .98 .84 .94 S.68 .91 .52 .96 S.34 .995 .2 .955 S.07 1 0 .95 Z' })))),
    // Mobile hero stacks copy, full-width Bootstrap actions and the asset host.
    group('hero-mobile-variant', 'd-lg-none', [
    section('hero', [heroPaw(), row('hero-columns', [
      col('hero-content-column', 'col-12 col-lg-5', [stack('hero-content-group', [
        heroHeading(false), copy('hero-description-parent', 'p', "Virtually adopt a pup — help us provide the care, love and support they need while they wait for their forever home.", '6373:42154', 'hero-description'),
        heroActions(false),
      ], 'justify-content-center')]),
      col('hero-visual-column', 'col-12 col-lg-7', [host('hero-assets-parent', 'media', 300, 'h-100')]),
    ])], 100, '6373:42116 / 2844:2846')
    ]),
    // Desktop hero retains the original viewport-sized image area and overlay navigation.
    group('hero-desktop-variant', 'd-none d-lg-block', [
      group('hero-desktop', 'position-relative surface-100 min-vh-100', [
        h('div', { className: 'hero-curved-copy-surface', 'aria-hidden': true }),
        heroPaw(),
        group('hero-desktop-columns', 'row g-0 min-vh-100', [
          col('hero-desktop-content-column', 'col-5 d-flex align-items-center hero-desktop-content-inset', [
            stack('hero-desktop-content-group', [
              heroHeading(true),
              copy('hero-desktop-description-parent', 'p', "Virtually adopt a pup - help us provide the care, love and support they need while they wait for their forever home.", '6224:32386', 'hero-description'),
              heroActions(true),
            ], 'w-100 hero-copy-width py-5'),
          ]),
          col('hero-desktop-visual-column', 'col-7', [
            host('hero-desktop-assets-parent', 'media', 300, 'min-vh-100 h-100'),
          ]),
        ]),
      ], 'section', '6224:32377'),
    ]),
    section('about', [stack('about-groups', [intro('about'),
      // One shared parent around both image/copy rows; narrower desktop measure.
      stack('about-body-parent', [
      row('mission-columns', [
        col('mission-visual-column', 'col-12 col-lg-6', [host('mission-assets-parent', 'media', 300)]),
        col('mission-copy-column', 'col-12 col-lg-6', [copy('mission-copy-parent', 'p', "CLAW (Community Led Animal Welfare) is a non-profit organisation based in South Africa dedicated to improving the lives of dogs in need. From rescue missions and second chances to rehabilitation and rehoming, we are committed to giving every dog a second chance.", '2844:2857', 'body-copy')]),
      ]), row('care-columns', [
        col('care-visual-column', 'col-12 col-lg-6 order-lg-2', [host('care-assets-parent', 'media', 300)]),
        col('care-copy-column', 'col-12 col-lg-6 order-lg-1', [copy('care-copy-parent', 'p', "Our Virtual Adoption programme allows you to support a specific dog from anywhere in the world. Your monthly contribution provides food, shelter, healthcare and love, helping us continue our mission and creating a brighter future for our furry friends.", '6200:29570', 'body-copy')]),
      ])
      ], 'about-body-width w-100 mx-auto'), copy('appreciation-parent', 'p', "Thank you for being part of the change!", '6200:29561', 'appreciation text-center'),
    ])], 50),
    group('in-care-mobile-variant', 'd-lg-none', [
    section('in-care', [stack('in-care-groups', [intro('in-care'), copy('in-care-description-parent', 'p', 'Meet the dogs currently in CLAW’s care. Choose a dog whose story speaks to you and become part of their journey by supporting their care through virtual adoption.', '6373:42203', 'body-copy text-center'), host('featured-dogs-collection-parent', 'collection', 300), host('browse-actions-parent', 'compact', 400)])])
    ]),
    group('in-care-desktop-variant', 'd-none d-lg-block', [
      section('in-care-desktop', [
        group('in-care-desktop-columns', 'row g-3 align-items-center', [
          col('in-care-desktop-information-column', 'col-4', [
            stack('in-care-desktop-information-parent', [
              copy('in-care-desktop-heading-parent', 'h2', "Pups In Our Care", '6520:47386', 'section-heading'),
              copy('in-care-desktop-tagline-parent', 'p', "Learn their story. Become part of their journey.", '6520:47393', 'section-tagline'),
              copy('in-care-desktop-description-parent', 'p', "Meet the dogs currently in CLAW’s care. Choose a dog whose story speaks to you and become part of their journey by supporting their care through virtual adoption.", '6520:47387', 'body-copy'),
              host('in-care-desktop-browse-actions-parent', 'compact', 400),
            ]),
          ]),
          col('in-care-desktop-collection-column', 'col-8', [
            stack('in-care-desktop-collection-group', [
              // A single carousel parent: no individual card placeholders.
              host('featured-dogs-desktop-carousel-parent', 'collection', 300),

            ]),
          ]),
        ]),
      ], 100, '6227:32996'),
    ]),
    group('adopt-mobile-variant', 'd-lg-none', [
    section('adopt', [stack('adopt-groups', [intro('adopt'), row('adopt-columns', [
      col('adopt-visual-column', 'col-12 col-lg-6', [host('adopt-assets-parent', 'media', 300)]),
      col('adopt-information-column', 'col-12 col-lg-6', [stack('adopt-information-group', [copy('adopt-copy-parent', 'p', "CLAW Virtual Adoption is a digital campaign created to help dogs in need while giving people a meaningful way to make a difference. We understand that not everyone is able to physically adopt a dog, but that doesn’t mean they can’t be part of a dog’s journey.", '6207:29939', 'body-copy'), host('adopt-actions-parent', 'compact', 400)], 'justify-content-center')]),
    ])])], 50)
    ]),
    group('adopt-desktop-variant', 'd-none d-lg-block', [
      section('adopt-desktop', [stack('adopt-desktop-groups', [
        group('adopt-desktop-introduction-parent', 'col-8 mx-auto', [intro('adopt-desktop')]),
        group('adopt-desktop-composition-row', 'row g-0 justify-content-center', [
          col('adopt-desktop-composition-column', 'col-10', [
            group('adopt-desktop-composition-parent', 'position-relative adopt-desktop-scene pt-5', [
              host('adopt-desktop-assets-parent', 'media', 300, 'w-75 ms-auto adopt-desktop-media-size'),
              group('adopt-desktop-information-parent', 'position-absolute top-0 start-0 w-50', [
                copy('adopt-desktop-copy-parent', 'p', "CLAW Virtual Adoption is a digital campaign created to help dogs in need while giving people a meaningful way to make a difference. We understand that not everyone is able to physically adopt a dog, but that doesn’t mean they can’t be part of a dog’s journey.", '6207:29939', 'body-copy'),
                group('adopt-desktop-action-group', 'd-flex justify-content-end', [
                  host('adopt-desktop-actions-parent', 'compact', 400),
                ]),
              ]),
            ]),
          ]),
        ]),
      ])], 50, '6227:32871'),
    ]),
    section('donation', [group('donation-columns', 'row g-3 align-items-lg-center', [
      col('donation-information-column', 'col-12 col-lg-5', [stack('donation-information-group', [copy('donation-heading-parent', 'h2', "Make a Donation. Make a Difference.", '6222:32250', 'section-heading'), stack('donation-copy-parent', [copy('donation-introduction', 'p', 'Every contribution, big or small, helps CLAW continue caring for animals while they wait for their forever homes.', '2844:2878', 'body-copy fw-semibold'), copy('donation-support', 'p', 'Your support helps provide food, shelter, veterinary care and love to dogs in need.', '6222:32248', 'body-copy')], 'host-copy surface-300')])]),
      col('donation-form-column', 'col-12 col-lg-7', [host('donation-form-parent', 'form', 300)]),
    ])]),
  ]);
}

export function Dogs() {
  return page('dogs', [
    section('dogs-hero', [row('dogs-hero-columns', [
      col('dogs-heading-column', 'col-12 col-lg-6', [intro('dogs')]),
      h('div', { 'aria-hidden': true, className: 'dogs-header-overlay' }),
      col('dogs-visual-column', 'col-12 col-lg-6', [host('dogs-hero-assets-parent', 'media', 300)]),
    ])], 100, '6402:43371 / 2844:2901'),
    section('dog-listing', [h(DogListing)], 50),
  ], true);
}

export function DogDetails() {
  return page('dog-details', [section('dog-profile', [row('profile-columns', [
    col('profile-summary-column', 'col-12 col-lg-4', [stack('profile-summary-group', [host('dog-profile-assets-parent', 'media', 300), copy('dog-name-parent', 'h1', "Bella", '6378:42513', 'dog-name'), host('dog-attributes-parent', 'copy', 300)])]),
    col('profile-story-column', 'col-12 col-lg-8', [stack('profile-story-group', [host('dog-status-parent', 'compact', 400), stack('dog-overview-parent', [copy('dog-overview-parent-heading', 'h2', 'Meet Bella', '6378:42637', 'profile-heading'), copy('dog-overview-parent-copy', 'p', "Bella is a beautiful, loving Boerboel with a gentle personality and a big heart. She can be a little shy when meeting new people, but once she feels comfortable, she loves attention and enjoys spending time with the CLAW volunteers. Bella is looking for someone who will support her journey and help give her the care, love and attention she deserves while she waits for her forever home.", '6378:42637', 'profile-copy')], 'host-copy surface-200 profile-editorial-group'), stack('dog-story-parent', [copy('dog-story-parent-heading', 'h2', 'Her Story', '6378:42645', 'profile-heading'), copy('dog-story-parent-copy', 'p', "Bella came to CLAW needing a safe place where she could receive the care and attention she needed. Since arriving at CLAW, Bella has become more comfortable around people and has developed a strong bond with the volunteers who care for her. She still has plenty of love to give and is hoping that someone will choose to support her through a virtual adoption.", '6378:42645', 'profile-copy')], 'host-copy surface-300 profile-editorial-group'), personality(), host('adoption-actions-parent', 'compact', 400)])]),
  ])], 50, '6378:42501 / 6270:35445')]);
}

function informationPage(name, groups, source) {
  // Reference information pages use a reading layout and copyright footer.
  return group(name, '', [group(`${name}-main`, 'surface-50 py-4 py-lg-5', [
    group(`${name}-container`, 'container-fluid reading-width px-3 px-lg-5', [stack(`${name}-reading-groups`, [host(`${name}-heading-parent`, 'heading', 300), ...groups.map(label => host(`${name}-${label}-parent`, 'copy'))], 'gap-4')]),
  ], 'main', source), group(`${name}-footer`, 'surface-300', [host('copyright-parent', 'copyright', 300)], 'footer')]);
}
export function VirtualAdoption() {
  return informationPage('virtual-adoption', ['introduction', 'process', 'support-includes', 'contribution-use', 'after-six-months', 'closing'], '6028:4960 / 2844:3343');
}
export function Terms() {
  return informationPage('terms', ['introduction', 'scope', 'ownership', 'payments', 'non-refundable-fees', 'no-ownership', 'changes', 'duration', 'cancellations', 'personal-information', 'misrepresentation', 'updates', 'modifications', 'responsibility', 'changes-to-terms', 'contact'], '6028:4966 / 2844:3351');
}
