import express from 'express';
import { fileURLToPath } from 'node:url';

// Resolve from this module, never the startup working directory.
const frontend = fileURLToPath(new URL('../../frontend/', import.meta.url));
export function serveFrontend(app) {
 const options = {dotfiles: 'deny', index: false, redirect: false, fallthrough: true};
 app.get(['/', '/index.html'], (_req, res) => res.sendFile('index.html', {root: frontend}));
 app.use('/src', (req, res, next) => {
  if (!/\.(js|css)$/.test(req.path)) return res.sendStatus(404);
  next();
 }, express.static(`${frontend}src`, options));
 app.use('/public', express.static(`${frontend}public`, options));
 app.use((_req, res) => res.status(404).type('text').send('Not found'));
}
