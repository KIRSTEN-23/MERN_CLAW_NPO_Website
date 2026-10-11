import React from 'react';
const h = React.createElement;
const classes = (...values) => values.filter(Boolean).join(' ');

// Shared primitives preserve native attributes, validation, refs and event handlers.
export function Button({ href, variant = 'primary', size = 'lg', className = '', children, ...props }) {
  const custom = /\b(btn|navbar-toggler|dropdown-item|form-select)\b/.test(className);
  return h(href ? 'a' : 'button', {
    ...(!href ? { type: 'button' } : { href }), ...props,
    className: classes(!custom && `btn btn-${variant}`, !custom && size && `btn-${size}`, className),
  }, children);
}
export function Badge({ className = '', children, ...props }) {
  return h('span', { ...props, className: classes('badge', className) }, children);
}
export function Input({ className = '', type = 'text', ...props }) {
  const plain = ['hidden', 'checkbox', 'radio'].includes(type);
  return h('input', { ...props, type, className: classes(!plain && !className.includes('payment-validation-control') && 'form-control form-control-lg', className) });
}
export function Select({ className = '', children, ...props }) {
  return h('select', { ...props, className: classes(!className.includes('payment-validation-control') && 'form-select form-select-lg', className) }, children);
}
export function Field({ id, label, feedback, children, className = '', controlClassName = '' }) {
  const control = [children, feedback && h('div', { id: `${id}-feedback`, className: 'invalid-feedback' }, feedback)];
  return h('div', { className },
    h('label', { className: 'form-label', htmlFor: id }, label),
    controlClassName ? h('div', { className: controlClassName }, ...control) : control);
}
