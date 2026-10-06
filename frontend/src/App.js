import React, { useEffect, useState } from 'react';
import { Home, Dogs, DogDetails, VirtualAdoption, Terms } from './pages/layouts.js';

const pages = { '/': Home, '/dogs': Dogs, '/dogs/details': DogDetails,
  '/virtual-adoption': VirtualAdoption, '/terms': Terms };

export default function App() {
  const [path, setPath] = useState(() => location.hash.slice(1) || '/');
  useEffect(() => {
    const update = () => { setPath(location.hash.slice(1) || '/'); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return React.createElement(pages[path] || Home);
}
