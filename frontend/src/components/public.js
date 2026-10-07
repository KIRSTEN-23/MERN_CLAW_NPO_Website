import React, { useEffect, useId, useRef, useState } from 'react';
import { HomeImage } from './home-assets.js';
const h = React.createElement;
export const icon = name => h('i', { className: `bi bi-${name}`, 'aria-hidden': true });
export const action = (label, href, variant = 'primary', extra = '') => h('a', {
  href, className: `btn btn-${variant} btn-lg ${extra}`,
}, label);
export function HeroActions() {
  return h('div', { className: 'd-flex flex-column flex-lg-row gap-3' },
    action('Donate Now', '#/?section=donation'), action('Learn More', '#/?section=about', 'outline-primary'));
}
export function Navigation({ transparent = false } = {}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const path = location.hash.slice(1).split('?')[0] || '/';
  const [activeSection, setActiveSection] = useState('home');
  useEffect(() => {
    if (path !== '/') return;
    const update = () => {
      const header = document.querySelector('[data-layout="navigation-parent"]');
      const marker = Math.max((header?.getBoundingClientRect().bottom || 0) + 1,
        window.innerHeight * 0.5);
      const sections = ['about', 'donation', 'footer-container'];
      let current = window.scrollY <= 1 ? 'home' : null;
      const hero = document.querySelector(window.innerWidth >= 992
        ? '[data-layout="hero-desktop"]' : '[data-layout="hero"]');
      if (hero?.getBoundingClientRect().bottom > marker) current = 'home';
      for (const section of sections) {
        const element = document.getElementById(section);
        const bounds = element?.getBoundingClientRect();
        const sectionMarker = element ? Math.max(marker,
          (parseFloat(window.getComputedStyle(element).scrollMarginTop) || 0) + 1) : marker;
        if (bounds && bounds.top <= sectionMarker && bounds.bottom > sectionMarker) current = section;
      }
      const footer = document.getElementById('footer-container');
      if (window.scrollY > 1 && footer && footer.getBoundingClientRect().top < window.innerHeight
        && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = 'footer-container';
      setActiveSection(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [path]);
  const links = [['Home', '#/'], ['About Us', '#/?section=about'], ['Our Dogs', '#/dogs'],
    ['Donation', '#/?section=donation'], ['Contact Us', '#/?section=footer-container']];
  return h('nav', { className: `navbar navbar-expand-lg${transparent ? '' : ' bg-body-tertiary'}`, 'aria-label': 'Primary navigation', onKeyDown: event => { if (event.key === 'Escape') setOpen(false); } },
    h('div', { className: 'container-fluid navigation-container px-0' },
      h('button', { type: 'button', className: 'navbar-toggler icon-button', onClick: () => setOpen(!open),
        'aria-controls': id, 'aria-expanded': open, 'aria-label': open ? 'Close navigation' : 'Open navigation' }, icon(open ? 'x-lg' : 'list')),
      h('a', { className: 'navbar-brand', href: '#/', onClick: () => setOpen(false) }, h('img', { src: '/public/assets/shared/logo.svg', width: 123, height: 32, alt: 'CLAW' })),
      h('button', { className: 'btn btn-primary btn-lg ms-auto order-lg-3', type: 'button', disabled: true }, 'Sign Up'),
      h('div', { id, className: `collapse navbar-collapse${open ? ' show' : ''}` },
        h('ul', { className: 'nav nav-underline flex-column flex-lg-row me-auto' }, ...links.map(([label, href]) => {
          const section = href === '#/' ? 'home' : href.split('section=')[1];
          const active = href === '#/dogs' ? path.startsWith('/dogs')
            : path === '/' && activeSection === section;
          return h('li', { key: label, className: 'nav-item' }, h('a', {
            href, className: `nav-link${active ? ' active' : ''}`, 'aria-current': active ? 'page' : undefined,
            onClick: () => setOpen(false),
          }, label));
        })))));
}
const dogs = Array.from({ length: 15 }, (_, index) => ({ id: index, name: index === 1 ? 'Rolo' : 'Bella',
  breed: 'Boerboel', age: 7, size: 'Large', sex: 'Female', available: index !== 0 }));
export function DogCard({ dog = dogs[0], homeImage = true }) {
  return h('article', { className: 'card' },
    homeImage ? h('div', { className: 'surface-300 home-card-image', 'data-layout': 'dog-card-image-parent' }, h(HomeImage, { asset: 'bella', alt: `${dog.name}, a brown Boerboel in CLAW’s care` })) : h('div', { className: 'empty-host host-media surface-300', 'data-layout': 'dog-card-image-parent', 'aria-hidden': true }),
    h('div', { className: 'card-body' },
      h('dl', { className: 'mb-3' }, ...[['Name', dog.name], ['Breed', dog.breed], ['Age', String(dog.age)]].map(([label, value]) =>
        h('div', { key: label, className: 'd-flex justify-content-between border-bottom' },
          h('dt', null, label), h('dd', { className: 'mb-0' }, value)))),
      action('View Profile', '#/dogs/details', 'primary', 'w-100')));
}
export function CareDogCard({ dog, active = false }) {
  return h('article', { className: `card care-dog-card shadow-lg${active ? ' is-active' : ''}`, 'data-dog-id': dog.id },
    h('div', { className: 'care-card-colour-layer', 'aria-hidden': true }),
    h('div', { className: 'card-body p-3 d-flex flex-column gap-3 care-card-content' },
      h('div', { className: 'care-card-media' }, h(HomeImage, { asset: 'bella', alt: `${dog.name}, a brown Boerboel in CLAW’s care` })),
      h('a', { href: '#/dogs/details', className: 'btn btn-outline-light btn-lg icon-button care-profile-link', 'aria-label': `View ${dog.name}’s profile` }, icon('arrow-up-right')),
      h('div', { className: 'd-flex align-items-center justify-content-between gap-3' },
        h('h3', { className: 'h5 mb-0 care-card-name' }, dog.name),
        h('span', { className: 'badge care-availability' }, dog.available ? 'Available' : 'Unavailable')),
      h('dl', { className: 'mb-0 care-card-facts' }, ...[['Breed', dog.breed], ['Sex', dog.sex], ['Age', String(dog.age)]].map(([label, value], index) =>
        h('div', { key: label, className: `d-flex justify-content-between gap-3 py-2${index < 2 ? ' border-bottom' : ''}` },
          h('dt', null, label), h('dd', { className: 'mb-0' }, value)))),
      action('Adopt', '#/virtual-adoption', 'primary', 'w-100')));
}
export function FeaturedDogs({ mobile = false }) {
  const [index, setIndex] = useState(0);
  const featured = dogs.map(dog => ({ ...dog, available: true }));
  return h('div', { className: `d-flex flex-column gap-3 care-carousel${mobile ? ' care-carousel-mobile' : ''}`, role: 'region', 'aria-label': 'Pups in our care' },
    mobile ? h('div', { className: 'care-mobile-stack mx-auto' }, h(DogCard, { dog: { ...featured[index], age: '3 years' } }))
      : h('div', { className: 'care-carousel-viewport' },
          h('div', { className: 'care-carousel-track d-flex gap-3 align-items-start', style: { '--care-index': index } },
            ...featured.map((dog, position) => h('div', { key: dog.id, className: `care-carousel-slide${position === index ? ' is-active' : ''}`, 'data-active': position === index,
              'aria-hidden': position < index || position > index + 2, inert: position < index || position > index + 2 ? true : undefined },
              h(CareDogCard, { dog, active: position === index }))))),
    !mobile ? h('div', { className: 'd-flex justify-content-end gap-3 featured-dogs-controls' },
      h('button', { type: 'button', className: 'btn btn-outline-primary btn-lg icon-button', disabled: index === 0,
        onClick: () => setIndex(Math.max(0, index - 1)), 'aria-label': 'Previous dog' }, icon('arrow-left')),
      h('button', { type: 'button', className: 'btn btn-primary btn-lg icon-button', disabled: index === featured.length - 1,
        onClick: () => setIndex(Math.min(featured.length - 1, index + 1)), 'aria-label': 'Next dog' }, icon('arrow-right'))) : null);
}
export function DogListing() {
  const [filters, setFilters] = useState({ available: false, Age: [], Size: [], Sex: [] });
  const [open, setOpen] = useState(false);
  const id = useId();
  const visible = dogs.filter(d => (!filters.available || d.available)
    && (!filters.Size.length || filters.Size.includes(d.size)) && (!filters.Sex.length || filters.Sex.includes(d.sex))
    && (!filters.Age.length || filters.Age.includes('Adult (3–7 years old)')));
  const clear = () => setFilters({ available: false, Age: [], Size: [], Sex: [] });
  const toggle = (group, value) => setFilters(f => ({ ...f, [group]: f[group].includes(value)
    ? f[group].filter(v => v !== value) : [...f[group], value] }));
  return h('div', { className: 'row g-3' },
    h('aside', { className: 'col-12 col-lg-3 dog-filters' },
      h('button', { type: 'button', className: 'btn btn-outline-primary btn-lg w-100 d-lg-none',
        onClick: () => setOpen(!open), 'aria-expanded': open, 'aria-controls': id }, 'Filter Dogs ', icon(open ? 'dash' : 'plus')),
      h('div', { id, className: `collapse d-lg-block${open ? ' show' : ''}` },
        h('div', { className: 'd-flex flex-column gap-4' },
          h('div', { className: 'd-flex align-items-center justify-content-between gap-3 border-bottom pb-3' }, h('h2', { className: 'h5 mb-0' }, 'Filter Dogs'),
            h('button', { type: 'button', className: 'btn btn-link btn-lg p-0 flex-shrink-0', onClick: clear }, 'Clear All')),
          h('div', { className: 'btn-group btn-group-lg', role: 'group', 'aria-label': 'Availability' },
            ...[['All', false], ['Available', true]].map(([label, value]) => h('button', { key: label, type: 'button',
              className: `btn btn-${filters.available === value ? 'primary' : 'outline-primary'}`,
              'aria-pressed': filters.available === value, onClick: () => setFilters(f => ({ ...f, available: value })) }, label))),
          ...Object.entries({ Age: ['Puppy (0–1 years old)', 'Young (1–3 years old)', 'Adult (3–7 years old)', 'Adult (7+ years old)'],
            Size: ['Small', 'Medium', 'Large', 'Extra Large'], Sex: ['Unknown', 'Male', 'Female'] }).map(([group, options]) =>
            h('fieldset', { key: group, className: 'd-flex flex-column gap-3' }, h('legend', { className: 'h6 mb-0' }, group), ...options.map((value, index) => {
              const inputId = `${id}-${group}-${index}`;
              return h('div', { key: value, className: 'form-check' }, h('input', { id: inputId, type: 'checkbox', className: 'form-check-input',
                checked: filters[group].includes(value), onChange: () => toggle(group, value) }),
              h('label', { className: 'form-check-label', htmlFor: inputId }, value));
            }))),
          h('button', { type: 'button', className: 'btn btn-primary btn-lg', onClick: () => setOpen(false) }, 'Apply')))),
    h('div', { className: 'col-12 col-lg-9 d-flex flex-column gap-3' },
      h('p', { className: 'mb-0', role: 'status' }, `${visible.length} dogs found`),
      h('div', { className: 'row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3' }, ...visible.map(dog =>
        h('div', { key: dog.id, className: 'col' }, h(CareDogCard, { dog })))),
      visible.length === 0 ? h('p', null, 'No dogs match these filters.') : null));
}
const paymentMethods = [['eft', 'EFT', null], ['google-pay', 'Google Pay', 'google'],
  ['apple-pay', 'Apple Pay', 'apple'], ['payfast', 'Payfast', null]];

function PaymentDropdown({ id, validated, onChange }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const wrapper = useRef(null);
  const trigger = useRef(null);
  const selected = paymentMethods.find(([key]) => key === value);
  useEffect(() => {
    if (!open) return;
    const close = event => {
      if (!wrapper.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  const focusOption = index => requestAnimationFrame(() => {
    wrapper.current?.querySelectorAll('[role="option"]')[index]?.focus();
  });
  const choose = key => {
    setValue(key);
    setOpen(false);
    onChange();
    trigger.current?.focus();
  };
  return h('div', { className: 'dropdown payment-dropdown', ref: wrapper,
    onBlur: event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); },
    onKeyDown: event => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const options = [...wrapper.current.querySelectorAll('[role="option"]')];
        const current = options.indexOf(document.activeElement);
        const next = current < 0 ? (event.key === 'ArrowDown' ? 0 : paymentMethods.length - 1)
          : (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        setOpen(true);
        focusOption(next);
      }
      if (open && (event.key === 'Home' || event.key === 'End')) {
        event.preventDefault(); focusOption(event.key === 'Home' ? 0 : paymentMethods.length - 1);
      }
    } },
    h('button', { ref: trigger, id: `${id}-payment`, type: 'button',
      className: `form-select form-select-lg text-start${validated ? value ? ' is-valid' : ' is-invalid' : ''}`,
      'aria-haspopup': 'listbox', 'aria-expanded': open, 'aria-controls': `${id}-payment-options`,
      'aria-describedby': `${id}-payment-feedback`, 'aria-invalid': validated && !value,
      onClick: () => setOpen(!open) }, selected?.[1] || 'Select a payment method'),
    // Keep native constraint validation and FormData without showing a second control.
    h('select', { className: 'payment-validation-control', name: 'paymentMethod', tabIndex: -1,
      'aria-hidden': true, value, required: true, onChange: event => choose(event.target.value),
      onFocus: () => { trigger.current?.focus(); setOpen(true); } },
      h('option', { value: '' }, 'Select a payment method'),
      ...paymentMethods.map(([key, label]) => h('option', { key, value: key }, label))),
    h('div', { id: `${id}-payment-options`, role: 'listbox', 'aria-label': 'Payment Method',
      className: `dropdown-menu w-100${open ? ' show' : ''}` },
      ...paymentMethods.map(([key, label, symbol]) => h('button', { key, type: 'button', role: 'option',
        tabIndex: open ? 0 : -1, 'aria-selected': key === value,
        className: `dropdown-item d-flex align-items-center justify-content-between${key === value ? ' active' : ''}`,
        onClick: () => choose(key) }, h('span', null, label),
        h('span', { className: 'payment-method-mark', 'aria-hidden': true }, symbol ? icon(symbol) : label)))),
    h('div', { id: `${id}-payment-feedback`, className: `invalid-feedback${validated && !value ? ' d-block' : ''}` }, 'Select a payment method.'));
}

export function DonationForm() {
  const id = useId();
  const [validated, setValidated] = useState(false);
  const [complete, setComplete] = useState(false);
  const field = (label, type, autoComplete) => h('div', { key: label },
    h('label', { className: 'form-label', htmlFor: `${id}-${type}-${label}` }, label),
    h('div', { className: 'input-group input-group-lg has-validation' },
    type !== 'number' ? h('span', { className: 'input-group-text', 'aria-hidden': true }, icon(type === 'email' ? 'envelope' : 'person')) : null,
    h('input', { id: `${id}-${type}-${label}`, name: label, type, autoComplete,
      className: 'form-control form-control-lg', placeholder: `Enter your ${label.toLowerCase()}`,
      required: true, 'aria-describedby': `${id}-${type}-${label}-feedback`,
      ...(type === 'text' ? { pattern: '.*\\S.*' } : {}),
      ...(type === 'number' ? { min: '1', step: '0.01' } : {}) }),
    h('div', { className: 'invalid-feedback', id: `${id}-${type}-${label}-feedback` },
      type === 'email' ? 'Enter a valid email address.' : type === 'number' ? 'Enter an amount of at least R1, with no more than two decimal places.' : `Enter your ${label.toLowerCase()}.`)));
  return h('form', { className: `d-flex flex-column gap-3 p-3 needs-validation${validated ? ' was-validated' : ''}`, noValidate: true,
    onChange: () => setComplete(false), onSubmit: event => {
      event.preventDefault();
      const form = event.currentTarget;
      const valid = form.checkValidity();
      setValidated(true);
      setComplete(valid);
      if (!valid) form.querySelector(':invalid')?.focus();
    } },
    ...[['Name', 'text', 'given-name'], ['Surname', 'text', 'family-name'], ['Email', 'email', 'email']]
      .map(([label, type, autoComplete]) => field(label, type, autoComplete)),
    h('div', { className: 'row g-3 align-items-end' },
      h('div', { className: 'col-4' }, field('Donation Amount', 'number', 'off')),
      h('div', { className: 'col-8' },
        h('label', { className: 'form-label', htmlFor: `${id}-payment` }, 'Payment Method'),
        h(PaymentDropdown, { id, validated, onChange: () => setComplete(false) }))),
    h('button', { type: 'submit', className: 'btn btn-primary btn-lg mt-3' }, 'Donate Now'),
    complete ? h('p', { className: 'mb-0', role: 'status' }, 'Your details are valid. Payment processing is not connected yet; no donation has been submitted.') : null);
}
export function DogAttributes() {
  return h('div', { className: 'd-flex flex-column gap-3' },
    h('p', { className: 'mb-0' }, 'Boerboel • Female • 7 Years Old'),
    ...[['rulers', 'Size', 'Large'], ['lightning-fill', 'Energy Level', 'Medium'], ['person-fill', 'Good with People', 'Yes'],
      ['heart-fill', 'Good with Other Animals', 'Yes, with introductions'], ['geo-alt-fill', 'Location', 'CLAW Animal Shelter']].map(([symbol, label, value]) =>
      h('div', { key: label, className: 'd-flex align-items-center gap-3' }, icon(symbol), h('span', null, h('strong', null, `${label} `), value))));
}
export function AdoptionStatus() {
  return h('div', { className: 'd-flex flex-column flex-lg-row gap-3' },
    h('div', null, 'Current Adoption Model ', h('span', { className: 'badge text-bg-success' }, 'Virtual')),
    h('div', null, 'Virtual Adoption Status ',
      h('span', { className: 'badge text-bg-secondary d-lg-none' }, 'Unavailable'),
      h('span', { className: 'badge text-bg-primary d-none d-lg-inline' }, 'Available')));
}
