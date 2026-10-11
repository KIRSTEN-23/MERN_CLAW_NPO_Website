const home = {
  title: 'CLAW Virtual Adoption | Support a Dog’s Journey',
  description: 'You don’t have to take them home to give them care. Meet CLAW’s dogs and explore six-month virtual adoption supporting food, shelter and veterinary care.',
};
const pages = {
  '/': home,
  '/dogs': { title: 'Our Dogs | CLAW Virtual Adoption', description: 'Meet the dogs in CLAW’s care. Discover their stories, personalities and virtual adoption availability, and choose a dog to support.' },
  '/dogs/details': { title: 'Dog Profile | CLAW Virtual Adoption', description: 'Get to know a dog in CLAW’s care: their story, personality and sponsorship status. Virtual adoption supports care for six months.' },
  '/virtual-adoption': { title: 'How Virtual Adoption Works | CLAW', description: 'Learn how six-month virtual adoption helps CLAW provide food, veterinary treatment, shelter and care without transferring ownership.' },
  '/terms': { title: 'Terms and Conditions | CLAW Virtual Adoption', description: 'Read the terms and conditions for CLAW’s virtual adoption student project, including sponsorship periods and contribution policies.' },
  '/donate': { title: 'Support CLAW | Contribution Demo', description: 'Explore the CLAW student project contribution form. This demonstration does not accept official donations or process payments.', private: true },
  '/login': { title: 'Log In | CLAW Virtual Adoption', description: 'Log in to your CLAW Virtual Adoption account.', private: true },
  '/signup': { title: 'Sign Up | CLAW Virtual Adoption', description: 'Create your CLAW Virtual Adoption account.', private: true },
};

function meta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

export function updateSeo(route) {
  const page = pages[route.path] || home;
  document.title = page.title;
  meta('name', 'description', page.description);
  meta('name', 'robots', page.private ? 'noindex, follow' : 'index, follow');
  meta('property', 'og:title', page.title);
  meta('property', 'og:description', page.description);
  meta('property', 'og:image', new URL('/public/assets/home/hero-photo.png', location.origin).href);
  meta('name', 'twitter:title', page.title);
  meta('name', 'twitter:description', page.description);
  meta('name', 'twitter:image', new URL('/public/assets/home/hero-photo.png', location.origin).href);
}
