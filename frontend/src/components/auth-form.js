// Login and registration UI with browser validation and API-backed sessions. Desktop panels switch between the two account flows.
import { Button, Input, Field } from './ui.js';
import React, { useEffect, useId, useState } from 'react';
import { trackEvent } from './analytics.js';
import { api } from './api.js';
import { Header } from './site-shell.js';
const h = React.createElement;

function AuthForm({ signup }) {
  const id = useId();
  const [visible, setVisible] = useState({});
  const [validated, setValidated] = useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(() => { setVisible({}); setValidated(false); setError(''); }, [signup]);
  const title = signup ? 'Sign Up' : 'Log In';
  const validatePasswords = form => {
    if (!signup) return;
    const confirmation = form.elements.confirmPassword;
    confirmation.setCustomValidity(confirmation.value === form.elements.password.value ? '' : 'Passwords must match.');
  };
  const field = (name, label, type, placeholder, autocomplete, symbol) => {
    const password = type === 'password';
    return h(Field, { key: name, id: `${id}-${name}`, label, controlClassName: 'position-relative',
      feedback: name === 'confirmPassword' ? 'Enter the same password again.' : type === 'email' ? 'Enter a valid email address.' : name==='username' && signup ? 'Use 3–40 letters, numbers, dots, hyphens or underscores.' : password && signup ? 'Use at least 8 characters.' : `Enter your ${label.toLowerCase()}.` },
        h(Input, { id: `${id}-${name}`, name, type: password && visible[name] ? 'text' : type,
          className: `form-control form-control-lg${password ? ' auth-password-input' : ''}`, placeholder, autoComplete: autocomplete, required: true,
          ...(name === 'username' ? { pattern: signup ? '[A-Za-z0-9_.-]{3,40}' : '.*\\S.*', maxLength: 40 } : {}),
          ...(password ? {minLength: signup ? 8 : 1, maxLength:128} : {}),
          'aria-describedby': `${id}-${name}-feedback` }),
        password ? h(Button, { type: 'button', className: 'btn auth-password-toggle',
          'aria-label': `${visible[name] ? 'Hide' : 'Show'} ${label.toLowerCase()}`, 'aria-pressed': !!visible[name],
          onClick: () => setVisible(previous => ({ ...previous, [name]: !previous[name] })) },
          h('i', { className: `bi bi-eye${visible[name] ? '' : '-slash'}`, 'aria-hidden': true })) : null);
  };
  return h('div', { className: 'claw-theme auth-page' }, h(Header),
    h('main', { className: `auth-scene position-relative d-flex align-items-center${signup ? '' : ' is-login'}` },
      h('img', { className: 'auth-photo', src: '/public/assets/auth/photo.jpg', alt: '' }),
      h('svg', { className: 'auth-curve', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': true },
        h('path', { d: 'M0 0 H80 C91 5 82 29 87 51 C91 70 100 78 100 100 H0 Z', fill: '#fff' })),
      h('div', { className: 'container-fluid position-relative px-3 px-lg-5 py-5' },
        h('div', { className: 'row' }, h('div', { className: 'col-12 col-lg-5 auth-form-column' },
          h('div', { className: 'auth-content claw-form mx-auto' },
            h('div', { className: 'text-center mb-4' },
              h('h1', { className: 'd-flex justify-content-center align-items-center gap-3 fw-bold' },
                h('img', { src: '/public/assets/auth/paw.svg', className: 'auth-paw', alt: '' }), title),
              h('p', { className: 'mb-0' }, signup ? 'Welcome to CLAW. Let’s get you started.' : 'Welcome back to the CLAW family.')),
            h('form', { key: signup ? 'signup' : 'login', noValidate: true, className: `d-flex flex-column gap-3${validated ? ' was-validated' : ''}`,
              onChange: event => { validatePasswords(event.currentTarget); },
              onSubmit: async event => {
                event.preventDefault(); validatePasswords(event.currentTarget); setValidated(true);
                const form=event.currentTarget;
                if (!form.checkValidity()) {form.querySelector(':invalid')?.focus();return;}
                if(busy)return;
                setBusy(true);setError('');
                try {await api(signup ? '/auth/register' : '/auth/login',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(form)))});
                  if (signup) trackEvent('sign_up');
                  window.dispatchEvent(new Event('claw-auth-change'));location.hash='#/dogs';
                } catch(error){setError(error.message);} finally{setBusy(false);}
              } },
              field('username', 'Username', 'text', 'Enter your username', 'username', 'person-fill'),
              field('email', 'Email', 'email', 'Enter your email', 'email', 'envelope-fill'),
              field('password', 'Password', 'password', signup ? 'Set your password' : 'Enter your password', signup ? 'new-password' : 'current-password', 'lock-fill'),
              signup ? field('confirmPassword', 'Confirm password', 'password', 'Confirm your password', 'new-password', 'lock-fill') : null,
              h(Button, { className: 'btn btn-primary btn-lg w-100 mt-3', type: 'submit', disabled:busy }, busy ? 'Please wait…' : title),
              error ? h('div',{className:'alert alert-danger mb-0',role:'alert'},error) : null),
            h('p', { className: 'text-center text-body-secondary mt-4 mb-0' }, signup ? 'Already have an account? ' : 'New to CLAW? ',
              h('a', { href: signup ? '#/login' : '#/signup', className: 'fw-semibold' }, signup ? 'Log In' : 'Sign Up'))))))));
}
export function SignUp() { return h(AuthForm, { signup: true }); }
export function Login() { return h(AuthForm, { signup: false }); }

export function AuthPage({ path }) { return h(AuthForm, { signup: path === '/signup' }); }
