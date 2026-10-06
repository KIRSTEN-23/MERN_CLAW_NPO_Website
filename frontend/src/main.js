import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';

// This entry file mounts the application. Page layouts belong in App/components.
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(React.StrictMode, null, React.createElement(App)));
