import React, { useEffect, useRef } from 'react';
import { Button, Badge } from '../components/ui.js';
export const h = React.createElement;
export const asset = name => `/public/assets/worker/${name}`;
export const money = cents => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(Number(cents) / 100);
export const formatDate = value => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
export const formatLoginDate = value => {
  if (!value || Number.isNaN(Date.parse(value))) return 'Not available';
  const date = new Date(value);
  return `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
};
export const Icon = ({ name, className = '' }) => h('span', { className: `worker-icon worker-icon-${name} ${className}`, 'aria-hidden': true }, h('img', { src: asset(`${name}.svg`), alt: '' }));
export const Notice = ({ children, error = false }) => h('div', { className: `alert ${error ? 'alert-danger' : 'alert-primary'} worker-note`, role: error ? 'alert' : 'status' }, children);
export const Status = ({ status }) => h(Badge, { className: `worker-status status-${status}` }, ({ reviewed: 'Reviewed', approved: 'Approved', declined: 'Declined', pending_payment: 'Pending', paid: 'Paid', cancelled: 'Cancelled', available: 'Available', sponsored: 'Sponsored', archived: 'Archived', adopted: 'Permanently adopted' })[status] || status);
export function SectionHeader({ title, href }) {
  return h('div', { className: 'worker-section-heading' }, h('h2', null, title), href && h('a', { href }, 'VIEW MORE', h(Icon, { name: 'arrow' })));
}
// Native dialog supplies focus containment, Escape dismissal and a modal backdrop.
export function Modal({ title, onClose, children, className = '' }) {
  const ref = useRef();
  useEffect(() => { const previous = document.activeElement; ref.current.showModal(); const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = overflow; previous?.focus(); }; }, []);
  return h('dialog', { ref, className: `worker-modal ${className}`, 'aria-label': title, onCancel: onClose },
    h('div', { className: 'd-flex align-items-center justify-content-between gap-3 mb-4' }, h('h2', null, title), h(Button, { size: '', variant: 'light', onClick: onClose, 'aria-label': 'Close dialog' }, '×')), children);
}
export function RequestTable({ requests, animals, onReview, readOnly }) {
  return !requests.length ? h('div', { className: 'worker-panel worker-empty' }, h('h3', null, 'No requests yet'), h('p', null, 'Requests submitted through the website will appear here.')) :
    h('div', { className: 'worker-panel worker-table-wrap' }, h('table', { className: 'worker-table worker-request-table' },
      h('thead', null, h('tr', null, ...['Pet ID', 'Adopter', 'Request Date', 'Donation', 'Status', 'Actions'].map(label => h('th', { key: label, scope: 'col' }, label)))),
      h('tbody', null, ...requests.map(request => {
        const dog = animals.find(d => d.id === request.dog_id);
        return h('tr', { key: request.id },
          h('td', { 'data-label': 'Pet ID', className: 'worker-pet-cell' }, dog ? h('a', { href: `#/animals/${dog.id}`, className: 'worker-pet' }, h('img', { src: dog.image, alt: dog.name, loading: 'lazy' }), h('span', null, h('strong', null, dog.name), h('small', null, dog.breed))) : h('strong', null, 'General contribution')),
          h('td', { 'data-label': 'Adopter' }, h('span', null, request.name, h('small', null, request.email))),
          h('td', { 'data-label': 'Request Date' }, formatDate(request.created_at)),
          h('td', { 'data-label': 'Donation' }, money(request.amount_cents)),
          h('td', { 'data-label': 'Status' }, h(Status, { status: request.review_status || request.status })),
          h('td', { 'data-label': 'Actions' }, h(Button, { className: 'worker-more', onClick: () => onReview(request), 'aria-label': `${readOnly ? 'View' : 'Review'} request from ${request.name}` }, h(Icon, { name: 'more' }))));
      }))));
}
