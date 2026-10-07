import React, { useEffect, useState } from 'react';
import { Home, Dogs, DogDetails, VirtualAdoption, Terms } from './pages/layouts.js';

const readLocation = () => {
  const [path, query = ''] = (location.hash.slice(1) || '/').split('?');
  return { path, section: new URLSearchParams(query).get('section') };
};

const pages = { '/': Home, '/dogs': Dogs, '/dogs/details': DogDetails,
  '/virtual-adoption': VirtualAdoption, '/terms': Terms };

export default function App() {
  const [route, setRoute] = useState(readLocation);
  useEffect(() => {
    const update = () => setRoute(readLocation());
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => {
    if (route.section) {
      const target = document.getElementById(route.section)
        || document.querySelector(`[data-layout="${CSS.escape(route.section)}"]`);
      target?.scrollIntoView({ behavior: 'smooth' });
    } else window.scrollTo(0, 0);
  }, [route]);
  return React.createElement(pages[route.path] || Home);
}
