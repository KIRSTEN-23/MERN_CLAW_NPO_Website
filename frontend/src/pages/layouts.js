import React from 'react';
const h = React.createElement;
// Page copy from Ready for dev: Responsive UI screens; component hosts stay empty.
const group = (name, classes, children = [], tag = 'div', source) => h(tag, {
  key: name, className: classes, 'data-layout': name,
  ...(['about', 'donation'].includes(name) ? { id: name } : {}),
  ...(source ? { 'data-figma-node': source } : {}),
  ...(tag === 'section' ? { 'aria-label': name.replaceAll('-', ' ') } : {}),
}, ...children);
const host = (name, size, shade = 200, extra = '') => group(name, `empty-host host-${size} surface-${shade} ${extra}`);
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
  `host-heading surface-200 d-flex flex-column hero-heading-group `, [
    copy('hero-eyebrow', 'p', 'Changing Lives. One Paw at a Time.', desktop ? '6224:32382' : '6373:42148', 'hero-eyebrow'),
    copy('hero-title', 'h1', 'Adopt a furry friend Today', desktop ? '6224:32381' : '6373:42151', 'hero-title'),
  ]);
const scrollToSection = event => {
  event.preventDefault();
  document.getElementById(event.currentTarget.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
};
const heroActions = desktop => group(desktop ? 'hero-desktop-actions-parent' : 'hero-actions-parent',
  `surface-400 hero-actions d-flex flex-column flex-lg-row gap-3 host-compact`, [
    h('a', { key: 'donate', href: '#donation', onClick: scrollToSection, className: 'btn btn-primary btn-lg rounded-pill' }, 'Donate Now'),
    h('a', { key: 'learn', href: '#about', onClick: scrollToSection, className: 'btn btn-outline-primary btn-lg rounded-pill' }, 'Learn More'),
  ], 'div', '6346:41727');
const personality = () => group('dog-personality-parent', 'host-copy surface-200 page-copy personality-group', [
  copy('personality-heading', 'h2', 'Personality', '6378:42650', 'profile-heading'),
  h('ul', { key: 'traits', className: 'personality-list mb-0' }, ...[
    'Gentle and affectionate', 'Loyal to the people she trusts', 'Playful and energetic',
    'Enjoys attention from volunteers', 'Loves going for walks', 'Enjoys relaxing after playtime',
    'Building confidence every day',
  ].map(text => h('li', { key: text }, text))),
]);

const col = (name, classes, children) => group(name, classes, children);
const row = (name, children) => group(name, 'row g-4 g-lg-5', children);
const stack = (name, children, extra = '') => group(name, `d-flex flex-column gap-4 ${extra}`, children);
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
  ], 'justify-content-center ');
  const [title, tagline, titleSource, taglineSource] = introductions[name];
  return stack(`${name}-intro-group`, [
    copy(`${name}-heading-parent`, 'h2', title, titleSource, 'section-heading'),
    copy(`${name}-description-parent`, 'p', tagline, taglineSource, 'section-tagline'),
  ], 'text-center section-introduction');
};
const header = () => group('navigation-parent', 'empty-host host-navigation surface-400', [], 'header');
const footerText = (name, text, tag = 'p') =>
  copy(name, tag, text, undefined, tag === 'h2' ? 'footer-heading' : 'footer-copy');
const footerVariant = (name, mobile, children) => group(name,
  mobile ? 'd-lg-none d-flex flex-column gap-3' : 'd-none d-lg-flex flex-column gap-3', children);
const footerLinks = (name, title, labels) => [
  footerText(`${name}-heading`, title, 'h2'),
  group(`${name}-list`, 'd-flex flex-column gap-3', labels.map((label, index) =>
    footerText(`${name}-${index}`, label))),
];
const footer = (extended = false, pageName = 'home') => {
  const fullDescription = 'We Are a Community Led Animal Welfare project of the International Fund for Animal Welfare dedicated to rescuing, rehabilitating and rehoming animals in need.';
  const shortDescription = 'We Are dedicated to rescuing rehabilitating and rehoming animals in need. Thank you for supporting our mission';
  const address = 'Un-named Rd, Durban Deep, Roodepoort 237-Iq, Johannesburg, 1724';
  const desktopLinks = pageName === 'dogs'
    ? ['Home', 'About Us', 'Dog Gallery', 'Virtual Adoption']
    : ['Home', 'About Us', 'Our Dogs', 'Donate'];
  const mobileLinks = pageName === 'dog-details'
    ? ['Home', 'About Us', 'Dog Gallery', 'Virtual Adoption', 'Donation', 'Contact Us']
    : ['Home', 'About Us', 'Our Dogs', 'Donate', 'Contact Us'];
  return group('footer-container', 'surface-500', [
    group('footer-groups', 'container-fluid layout-width px-3 px-lg-5 py-4 py-lg-5', [row('footer-columns', [
      col('brand-column', extended ? 'col-12 col-lg-4' : 'col-12 col-lg-6', [stack('brand-group', [
        host('brand-assets-parent', 'compact', 300),
        group('brand-description-parent', 'host-copy surface-400', [
          footerVariant('brand-description-desktop', false, [
            footerText('brand-description-desktop-copy', extended ? shortDescription : fullDescription),
            ...(!extended ? [footerText('brand-desktop-thanks', 'Thank you for supporting our mission!')] : []),
          ]),
          footerVariant('brand-description-mobile', true, [
            footerText('brand-description-mobile-copy', pageName === 'dog-details' ? shortDescription : fullDescription),
            ...(pageName !== 'dog-details' ? [footerText('brand-mobile-thanks', 'Thank you for supporting our mission!')] : []),
          ]),
        ]),
      ])]),
      col('links-column', extended ? 'col-12 col-lg-2' : 'col-12 col-lg-3', [
        group('footer-links-parent', 'host-footer surface-400', [
          footerVariant('footer-links-desktop', false, footerLinks('desktop-links', extended ? 'Quick Links' : 'Links', desktopLinks)),
          footerVariant('footer-links-mobile', true, footerLinks('mobile-links', pageName === 'dog-details' ? 'Quick Links' : 'Links', mobileLinks)),
        ]),
      ]),
      ...(extended ? [col('support-column', 'col-12 col-lg-2 d-none d-lg-block', [
        group('footer-support-parent', 'host-footer surface-400', footerLinks('footer-support', 'Support', [
          'Donate Now', 'Monthly Giving', 'Corporate - Partnership', 'Volunteer', 'FAQs',
        ])),
      ])] : []),
      col('contact-column', extended ? 'col-12 col-lg-4' : 'col-12 col-lg-3', [
        group('footer-contact-parent', 'host-footer surface-400', [
          footerVariant('footer-contact-desktop', false, [
            footerText('desktop-contact-heading', extended ? 'CONTACT US' : 'Contact Us', 'h2'),
            footerText('desktop-contact-address', address),
            footerText('desktop-contact-email', extended ? 'info@claw.co.za' : 'CLAWsouthafrica@gmail.com'),
          ]),
          footerVariant('footer-contact-mobile', true, [
            footerText('mobile-contact-heading', pageName === 'dog-details' ? 'CONTACT US' : 'Contact Us', 'h2'),
            footerText('mobile-contact-address', address),
            footerText('mobile-contact-email', pageName === 'dog-details' ? 'info@claw.co.za' : 'CLAWsouthafrica@gmail.com'),
          ]),
        ]),
      ]),
    ])]),
    group('copyright-parent', 'host-copyright surface-300', [
      footerVariant('copyright-desktop', false, [footerText('desktop-copyright', '©2005 Claw.All rights reserved')]),
      footerVariant('copyright-mobile', true, [footerText('mobile-copyright', '©2005 CLAW. All rights reserved.')]),
    ]),
  ], 'footer');
};
const page = (name, sections, extended = false) => group(name, '', [
  name === 'home' ? group('mobile-navigation-wrapper', 'd-lg-none', [header()]) : header(),
  group(`${name}-main`, '', sections, 'main'), footer(extended, name),
]);

export function Home() {
  return page('home', [
    // Mobile hero stacks copy, full-width Bootstrap actions and the asset host.
    group('hero-mobile-variant', 'd-lg-none', [
    section('hero', [row('hero-columns', [
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
        group('desktop-navigation-wrapper', 'position-absolute top-0 start-0 w-100 z-1', [header()]),
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
        group('in-care-desktop-columns', 'row g-4 g-lg-5 align-items-center', [
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
      col('donation-information-column', 'col-12 col-lg-5', [stack('donation-information-group', [copy('donation-heading-parent', 'h2', "Make a Donation. Make a Difference.", '6222:32250', 'section-heading'), stack('donation-copy-parent', [copy('donation-introduction', 'p', 'Every contribution, big or small, helps CLAW continue caring for animals while they wait for their forever homes.', '2844:2878', 'body-copy'), copy('donation-support', 'p', 'Your support helps provide food, shelter, veterinary care and love to dogs in need.', '6222:32248', 'body-copy')], 'host-copy surface-300')])]),
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
    col('profile-summary-column', 'col-12 col-lg-4', [stack('profile-summary-group', [host('dog-profile-assets-parent', 'media', 300), copy('dog-name-parent', 'h1', "Bella", '6378:42513', 'dog-name'), host('dog-attributes-parent', 'copy', 300)])]),
    col('profile-story-column', 'col-12 col-lg-8', [stack('profile-story-group', [host('dog-status-parent', 'compact', 400), stack('dog-overview-parent', [copy('dog-overview-parent-heading', 'h2', 'Meet Bella', '6378:42637', 'profile-heading'), copy('dog-overview-parent-copy', 'p', "Bella is a beautiful, loving Boerboel with a gentle personality and a big heart. She can be a little shy when meeting new people, but once she feels comfortable, she loves attention and enjoys spending time with the CLAW volunteers. Bella is looking for someone who will support her journey and help give her the care, love and attention she deserves while she waits for her forever home.", '6378:42637', 'profile-copy')], 'host-copy surface-200 profile-editorial-group'), stack('dog-story-parent', [copy('dog-story-parent-heading', 'h2', 'Her Story', '6378:42645', 'profile-heading'), copy('dog-story-parent-copy', 'p', "Bella came to CLAW needing a safe place where she could receive the care and attention she needed. Since arriving at CLAW, Bella has become more comfortable around people and has developed a strong bond with the volunteers who care for her. She still has plenty of love to give and is hoping that someone will choose to support her through a virtual adoption.", '6378:42645', 'profile-copy')], 'host-copy surface-300 profile-editorial-group'), personality(), host('adoption-actions-parent', 'compact', 400)])]),
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
