// Independent worker entry: no public-site navigation or campaign analytics are mounted here.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorkerApp } from './worker-app.js';
createRoot(document.getElementById('root')).render(React.createElement(WorkerApp));
