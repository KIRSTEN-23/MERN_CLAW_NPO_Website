// Worker authentication and navigation are isolated from the public-site entry.
import React, { useEffect, useRef, useState } from 'react';
import { api, useApi } from '../components/api.js';
import { Button, Input, Field } from '../components/ui.js';
import { h, Icon, Notice, asset, formatLoginDate } from './components.js';
import { Dashboard, AnimalGallery, AnimalProfile, AnimalEditor, Requests, Staff } from './worker-pages.js';
const readRoute = () => (location.hash.slice(1) || '/').split('?')[0];
const navigation = [['/', 'Dashboard', 'dashboard'], ['/animals', 'Animal Profiles', 'animals'], ['/adoptions', 'Adoptions', 'adoptions'], ['/settings', 'Settings', 'settings']];

function Login({ onLogin }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [show, setShow] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try { await api('/auth/login', { method: 'POST', body: JSON.stringify(fields) }); onLogin((await api('/worker/session')).worker); }
    catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  return h('main', { className: 'worker-login', 'data-figma-node': '6075:4635' },
    h('div', { className: 'worker-login-art', 'aria-hidden': true }, h('img', { src: asset('login-photo.png'), alt: '' })),
    h('div', { className: 'worker-login-content' },
      h('form', { onSubmit: submit, className: 'worker-login-form' },
        h('h1', null, h('img', { src: asset('login-paw.svg'), alt: '' }), 'Log In'),
        h('p', { className: 'text-center mb-4' }, 'Welcome back to the CLAW family.'),
        ...[['username', 'Name', 'text'], ['email', 'Email', 'email'], ['password', 'Password', show ? 'text' : 'password']].map(([name, label, type]) => h(Field, { key: name, id: `worker-${name}`, label, className: 'mb-3' }, h(Input, { id: `worker-${name}`, name, type, required: true, autoComplete: name === 'password' ? 'current-password' : name, maxLength: name === 'password' ? 128 : name === 'email' ? 254 : 40 }))),
        h('label', { className: 'd-flex gap-2 align-items-center small mb-4' }, h('input', { type: 'checkbox', checked: show, onChange: e => setShow(e.target.checked) }), 'Show password'),
        error && h(Notice, { error: true }, error),
        h(Button, { type: 'submit', className: 'btn btn-primary w-100', disabled: busy }, busy ? 'Logging in…' : 'Log In'),
        h('p', { className: 'worker-login-help mt-4' }, 'Worker access is assigned by an administrator. ', h('a', { href: '/' }, 'Return to website')))));
}

function Workspace({ worker, onLogout }) {
  const [route, setRoute] = useState(readRoute), [open, setOpen] = useState(false);
  const toggle = useRef(), drawer = useRef();
  const data = useApi('/worker/dashboard');
  useEffect(() => { const update = () => { setRoute(readRoute()); setOpen(false); window.scrollTo(0, 0); }; window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update); }, []);
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; drawer.current.querySelector('button, a')?.focus();
    const key = event => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab') return;
      const nodes = [...drawer.current.querySelectorAll('a,button')].filter(el => !el.disabled);
      if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === nodes.at(-1)) { event.preventDefault(); nodes[0]?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); toggle.current?.focus(); };
  }, [open]);
  const active = route.startsWith('/animals') ? '/animals' : route.startsWith('/adoptions') ? '/adoptions' : route.startsWith('/settings') ? '/settings' : '/';
  const title = navigation.find(n => n[0] === active)[1];
  const readOnly = worker.role === 'viewer';
  const props = { worker, readOnly, data: data.data, reload: data.retry };
  return h('div', { className: 'worker-app', 'data-figma-node': '6138:10854' },
    h('a', { href: '#worker-main', className: 'visually-hidden-focusable worker-skip', onClick: event => { event.preventDefault(); document.getElementById('worker-main')?.focus(); } }, 'Skip to content'),
    h('header', { className: 'worker-topbar', inert: open || undefined },
      h('a', { href: '#/', className: 'worker-brand', 'aria-label': 'CLAW worker dashboard' }, h('img', { src: asset('brand.svg'), alt: 'CLAW Virtual Adoption' })),
      h('div', { className: 'worker-topbar-title' }, h('span', null, title), h('small', null, 'Last Log in: ', worker.lastLoginAt ? h('time', { dateTime: worker.lastLoginAt }, formatLoginDate(worker.lastLoginAt)) : 'Not available')),
      h('div', { className: 'worker-account' }, h('span', { className: 'worker-avatar' }, worker.username[0].toUpperCase()), h('span', null, worker.username, h('small', null, `CLAW ${worker.role === 'admin' ? 'Administrator' : worker.role === 'viewer' ? 'Read-only worker' : 'Worker'}`))),
      h('button', { ref: toggle, className: 'worker-menu-toggle', 'aria-label': 'Open navigation menu', 'aria-expanded': open, 'aria-controls': 'worker-navigation', onClick: () => setOpen(true) }, '☰')),
    open && h('button', { className: 'worker-backdrop', onClick: () => setOpen(false), 'aria-label': 'Close navigation', tabIndex: -1 }),
    h('aside', { id: 'worker-navigation', ref: drawer, className: `worker-sidebar ${open ? 'is-open' : ''}`, ...(open ? { role: 'dialog', 'aria-modal': true, 'aria-label': 'Worker navigation' } : {}) },
      h('div', { className: 'worker-drawer-heading' }, h('img', { src: '/public/assets/shared/logo.svg', alt: 'CLAW Virtual Adoption' }), h(Button, { variant: 'light', onClick: () => setOpen(false), 'aria-label': 'Close navigation' }, '×')),
      h('nav', { 'aria-label': 'Worker navigation' }, ...navigation.map(([path, label, icon]) => h('a', { key: path, href: `#${path}`, className: active === path ? 'is-active' : '', 'aria-current': active === path ? 'page' : undefined, onClick: () => setOpen(false) }, h(Icon, { name: icon }), label))),
      h('button', { className: 'worker-logout', onClick: onLogout }, h(Icon, { name: 'logout' }), 'Log out'),
      h('div', { className: 'worker-drawer-account' }, h('span', { className: 'worker-avatar' }, worker.username[0].toUpperCase()), h('span', null, worker.username, h('small', null, 'CLAW Worker')))),
    h('main', { id: 'worker-main', className: 'worker-main', tabIndex: -1, inert: open || undefined },
      data.loading ? h('p', { role: 'status' }, 'Loading workspace…') : data.error ? h(Notice, { error: true }, data.error, ' ', h(Button, { size: '', onClick: data.retry }, 'Retry')) :
        active === '/animals' ? (route === '/animals/new' ? (readOnly ? h(Notice, { error: true }, 'Your account has view-only access.') : h(AnimalEditor, { ...props, key: route, id: 'new' })) : route.startsWith('/animals/') ? h(!readOnly && route.endsWith('/edit') ? AnimalEditor : AnimalProfile, { ...props, key: route, id: route.split('/')[2] }) : h(AnimalGallery, props)) :
        active === '/adoptions' ? h(Requests, props) : active === '/settings' ? h(Staff, props) : h(Dashboard, props)));
}

export function WorkerApp() {
  const [worker, setWorker] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => { let active = true; api('/worker/session').then(data => { if (active) setWorker(data.worker); }).catch(failure => { if (active && failure.status !== 401) setError(failure.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  async function logout() { try { await api('/auth/logout', { method: 'POST', body: '{}' }); setWorker(null); location.hash = '/'; } catch (failure) { setError(failure.message); } }
  return h('div', { className: 'claw-theme worker-root' }, error && h('div', { className: 'worker-global-error' }, h(Notice, { error: true }, error, h(Button, { size: '', variant: 'light', onClick: () => setError('') }, 'Dismiss'))), loading ? h('p', { className: 'p-4', role: 'status' }, 'Checking worker access…') : worker ? h(Workspace, { worker, onLogout: logout }) : h(Login, { onLogin: user => { setError(''); setWorker(user); } }));
}
