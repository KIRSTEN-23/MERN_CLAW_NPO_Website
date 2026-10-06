import React from 'react';
const h = React.createElement;
// Layout parents only: no fake cards, controls, text lines or asset components.
const group = (name, classes, children = [], tag = 'div', source) => h(tag, {
  key: name, className: classes, 'data-layout': name,
  ...(source ? { 'data-figma-node': source } : {}),
  ...(tag === 'section' ? { 'aria-label': name.replaceAll('-', ' ') } : {}),
}, ...children);
const host = (name, size, shade = 200, extra = '') => group(name, `host-${size} surface-${shade} ${extra}`);
const col = (name, classes, children) => group(name, classes, children);
const row = (name, children) => group(name, 'row g-4 g-lg-5', children);
const stack = (name, children, extra = '') => group(name, `d-flex flex-column gap-4 ${extra}`, children);
const section = (name, children, shade = 100, source) => group(name, `surface-${shade} py-4 py-lg-5`,
  [group(`${name}-container`, 'container-fluid layout-width px-3 px-lg-5', children)], 'section', source);
const intro = name => stack(`${name}-intro-group`, [host(`${name}-heading-parent`, 'heading'), host(`${name}-description-parent`, 'compact', 300)]);
const header = () => group('navigation-parent', 'host-navigation surface-400', [], 'header');
const footer = (extended = false) => group('footer-container', 'surface-500', [
  group('footer-groups', 'container-fluid layout-width px-3 px-lg-5 py-4 py-lg-5', [row('footer-columns', [
    col('brand-column', extended ? 'col-12 col-lg-4' : 'col-12 col-lg-6', [stack('brand-group', [
      host('brand-assets-parent', 'compact', 300), host('brand-description-parent', 'copy', 400)])]),
    col('links-column', extended ? 'col-12 col-lg-2' : 'col-12 col-lg-3', [host('footer-links-parent', 'footer', 400)]),
    ...(extended ? [col('support-column', 'col-12 col-lg-2', [host('footer-support-parent', 'footer', 400)])] : []),
    col('contact-column', extended ? 'col-12 col-lg-4' : 'col-12 col-lg-3', [host('footer-contact-parent', 'footer', 400)]),
  ])]), host('copyright-parent', 'copyright', 300),
], 'footer');
const page = (name, sections, extended = false) => group(name, '', [
  name === 'home' ? group('mobile-navigation-wrapper', 'd-lg-none', [header()]) : header(),
  group(`${name}-main`, '', sections, 'main'), footer(extended),
]);

export function Home() {
  return page('home', [
    // Mobile hero stacks copy, full-width Bootstrap actions and the asset host.
    group('hero-mobile-variant', 'd-lg-none', [
    section('hero', [row('hero-columns', [
      col('hero-content-column', 'col-12 col-lg-5', [stack('hero-content-group', [
        host('hero-heading-parent', 'heading'), host('hero-description-parent', 'copy', 300),
        group('hero-actions-parent', 'host-compact surface-400', [], 'div', '6346:41727'),
      ], 'h-100 justify-content-center')]),
      col('hero-visual-column', 'col-12 col-lg-7', [host('hero-assets-parent', 'media', 300, 'h-100')]),
    ])], 100, '6373:42116 / 2844:2846')
    ]),
    // Desktop hero retains the original viewport-sized image area and overlay navigation.
    group('hero-desktop-variant', 'd-none d-lg-block', [
      group('hero-desktop', 'position-relative surface-100 min-vh-100', [
        group('desktop-navigation-wrapper', 'position-absolute top-0 start-0 w-100 z-1', [header()]),
        group('hero-desktop-columns', 'row g-0 min-vh-100', [
          col('hero-desktop-content-column', 'col-5 d-flex align-items-center hero-desktop-content-inset', [
            stack('hero-desktop-content-group', [
              host('hero-desktop-heading-parent', 'heading', 200, 'hero-desktop-heading-size'),
              host('hero-desktop-description-parent', 'copy', 300, 'hero-desktop-copy-size'),
              group('hero-desktop-actions-parent', 'surface-400 hero-desktop-actions-size', [], 'div', '6346:41727'),
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
        col('mission-copy-column', 'col-12 col-lg-6', [host('mission-copy-parent', 'copy', 200, 'h-100')]),
      ]), row('care-columns', [
        col('care-visual-column', 'col-12 col-lg-6 order-lg-2', [host('care-assets-parent', 'media', 300)]),
        col('care-copy-column', 'col-12 col-lg-6 order-lg-1', [host('care-copy-parent', 'copy', 200, 'h-100')]),
      ])
      ], 'about-body-width w-100 mx-auto'), host('appreciation-parent', 'compact', 300),
    ])], 50),
    group('in-care-mobile-variant', 'd-lg-none', [
    section('in-care', [stack('in-care-groups', [intro('in-care'), host('featured-dogs-collection-parent', 'collection', 300), host('browse-actions-parent', 'compact', 400)])])
    ]),
    group('in-care-desktop-variant', 'd-none d-lg-block', [
      section('in-care-desktop', [
        group('in-care-desktop-columns', 'row g-4 g-lg-5 align-items-center', [
          col('in-care-desktop-information-column', 'col-4', [
            stack('in-care-desktop-information-parent', [
              host('in-care-desktop-heading-parent', 'heading', 200),
              host('in-care-desktop-tagline-parent', 'compact', 300),
              host('in-care-desktop-description-parent', 'copy', 200),
              host('in-care-desktop-browse-actions-parent', 'compact', 400),
            ]),
          ]),
          col('in-care-desktop-collection-column', 'col-8', [
            stack('in-care-desktop-collection-group', [
              // A single carousel parent: no individual card placeholders.
              host('featured-dogs-desktop-carousel-parent', 'collection', 300),
              group('featured-dogs-desktop-controls-row', 'row g-0 justify-content-end', [
                col('featured-dogs-desktop-controls-column', 'col-4', [
                  host('featured-dogs-desktop-controls-parent', 'compact', 400),
                ]),
              ]),
            ]),
          ]),
        ]),
      ], 100, '6227:32996'),
    ]),
    group('adopt-mobile-variant', 'd-lg-none', [
    section('adopt', [stack('adopt-groups', [intro('adopt'), row('adopt-columns', [
      col('adopt-visual-column', 'col-12 col-lg-6', [host('adopt-assets-parent', 'media', 300)]),
      col('adopt-information-column', 'col-12 col-lg-6', [stack('adopt-information-group', [host('adopt-copy-parent', 'copy', 200), host('adopt-actions-parent', 'compact', 400)], 'h-100 justify-content-center')]),
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
                host('adopt-desktop-copy-parent', 'copy', 200, 'adopt-desktop-copy-size'),
              ]),
              group('adopt-desktop-action-group', 'position-absolute bottom-0 end-0 w-50', [
                host('adopt-desktop-actions-parent', 'compact', 400),
              ]),
            ]),
          ]),
        ]),
      ])], 50, '6227:32871'),
    ]),
    section('donation', [group('donation-columns', 'row g-4 g-lg-5 align-items-lg-center', [
      col('donation-information-column', 'col-12 col-lg-5', [stack('donation-information-group', [host('donation-heading-parent', 'heading', 200), host('donation-copy-parent', 'copy', 300)])]),
      col('donation-form-column', 'col-12 col-lg-7', [host('donation-form-parent', 'form', 300)]),
    ])]),
  ]);
}

export function Dogs() {
  return page('dogs', [
    section('dogs-hero', [row('dogs-hero-columns', [
      col('dogs-heading-column', 'col-12 col-lg-6', [intro('dogs')]),
      col('dogs-visual-column', 'col-12 col-lg-6', [host('dogs-hero-assets-parent', 'media', 300)]),
    ])], 100, '6402:43371 / 2844:2901'),
    section('dog-listing', [row('listing-columns', [
      col('filter-column', 'col-12 col-lg-3', [host('mobile-filter-controls-parent', 'compact', 400, 'd-lg-none'),
        stack('desktop-filter-groups', [host('filter-heading-parent', 'compact', 300), host('availability-filter-parent', 'compact'),
          host('age-filter-parent', 'copy'), host('size-filter-parent', 'copy'), host('sex-filter-parent', 'copy'),
          host('filter-actions-parent', 'compact', 400)], 'd-none d-lg-flex')]),
      col('results-column', 'col-12 col-lg-9', [stack('results-groups', [row('results-toolbar', [
        col('results-summary-column', 'col-12 d-lg-none', [host('result-summary-parent', 'compact')]),
        col('search-column', 'd-none d-lg-block col-lg-7 offset-lg-5', [host('search-parent', 'compact', 300)]),
      ]), host('dog-card-collection-parent', 'collection', 300)])]),
    ])], 50),
  ], true);
}

export function DogDetails() {
  return page('dog-details', [section('dog-profile', [row('profile-columns', [
    col('profile-summary-column', 'col-12 col-lg-4', [stack('profile-summary-group', [host('dog-profile-assets-parent', 'media', 300), host('dog-name-parent', 'compact', 200), host('dog-attributes-parent', 'copy', 300)])]),
    col('profile-story-column', 'col-12 col-lg-8', [stack('profile-story-group', [host('dog-status-parent', 'compact', 400), host('dog-overview-parent', 'copy', 200), host('dog-story-parent', 'copy', 300), host('dog-personality-parent', 'copy'), host('adoption-actions-parent', 'compact', 400)])]),
  ])], 50, '6378:42501 / 6270:35445')]);
}

function informationPage(name, groups, source) {
  // Reference information pages use a reading layout and copyright footer.
  return group(name, '', [group(`${name}-main`, 'surface-50 py-4 py-lg-5', [
    group(`${name}-container`, 'container-fluid reading-width px-3 px-lg-5', [stack(`${name}-reading-groups`, [host(`${name}-heading-parent`, 'heading', 300), ...groups.map(label => host(`${name}-${label}-parent`, 'copy'))])]),
  ], 'main', source), group(`${name}-footer`, 'surface-300', [host('copyright-parent', 'copyright', 300)], 'footer')]);
}
export function VirtualAdoption() {
  return informationPage('virtual-adoption', ['introduction', 'process', 'support-includes', 'contribution-use', 'after-six-months', 'closing'], '6028:4960 / 2844:3343');
}
export function Terms() {
  return informationPage('terms', ['introduction', 'scope', 'ownership', 'payments', 'non-refundable-fees', 'no-ownership', 'changes', 'duration', 'cancellations', 'personal-information', 'misrepresentation', 'updates', 'modifications', 'responsibility', 'changes-to-terms', 'contact'], '6028:4966 / 2844:3351');
}
