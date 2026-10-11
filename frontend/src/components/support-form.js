import { Button, Input, Field } from './ui.js';
import React, { useId, useState } from 'react';
import { api } from './api.js';
const h = React.createElement;
const icon = name => h('i', { className: `bi bi-${name}`, 'aria-hidden': true });

export function SupportForm({ adopting, dog }) {
  const id = useId();
  const [frequency, setFrequency] = useState(adopting ? 'monthly' : 'once');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('payfast');
  const [validated, setValidated] = useState(false);
  const [complete, setComplete] = useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const panel = (title, children) => h('fieldset', { className: 'card support-panel shadow-lg' },
    h('div', { className: 'card-body p-4' },
      h('legend', { className: 'h6 text-uppercase fw-semibold mb-3' }, title), ...children));
  const choice = (name, value, selected, change, title, detail, symbol) => h('label', {
    key: value, className: `support-choice d-flex align-items-center gap-3 p-3 rounded-3${selected ? ' is-selected' : ''}` },
    h(Input, { type: 'radio', name, value, checked: selected, onChange: () => change(value), className: 'form-check-input flex-shrink-0' }),
    symbol ? icon(symbol) : null,
    h('span', { className: 'flex-grow-1' }, h('span', { className: 'd-block fw-semibold' }, title),
      detail ? h('small', { className: 'd-block text-body-secondary mt-1' }, detail) : null));
  const field = (label, type, autocomplete, required = true) => h(Field, {
    key: label, id: `${id}-${type}`, label,
    feedback: type === 'email' ? 'Enter a valid email address.' : `Enter your ${label.toLowerCase()}.`,
  }, h(Input, { id: `${id}-${type}`, name: label, type, autoComplete: autocomplete,
    placeholder: label, required, ...(type === 'text' ? { pattern: '.*\\S.*' } : {}),
    'aria-describedby': `${id}-${type}-feedback` }));
  return h('div', { className: 'support-checkout claw-form mx-auto d-flex flex-column gap-4 w-100' },
    adopting ? h('div', { className: 'alert support-period mb-0', role: 'note' },
      h('h2', { className: 'h6 fw-bold' }, 'About your virtual adoption'),
      h('p', { className: 'mb-0' }, 'The virtual adoption period is six months. If your dog finds a home within that time, the adoption period ends early. Virtual adoption supports their care and does not transfer ownership.')) : null,
    adopting ? h('div', { className: 'card support-dog shadow-lg' }, h('div', { className: 'card-body d-flex align-items-center gap-3' },
      h('img', {src:dog.image,alt:dog.name,'data-dog-id':dog.id,className:'home-image dog-data-image'}), h('div', null,
        h('p', { className: 'mb-1 text-body-secondary' }, 'You are virtually adopting'), h('h2', { className: 'h4 mb-0 fw-bold' }, dog.name)))) : null,
    h('form', { noValidate: true, className: `d-flex flex-column gap-4 needs-validation${validated ? ' was-validated' : ''}`,
      onChange: () => setComplete(false), onSubmit: async event => {
        event.preventDefault();const form=event.currentTarget;setValidated(true);
        if(!form.checkValidity()){form.querySelector(':invalid')?.focus();return;}
        if(busy || complete)return;setBusy(true);setError('');
        const values=Object.fromEntries(new FormData(form));
        try {const result=await api('/contributions',{method:'POST',body:JSON.stringify({amount,frequency,paymentMethod:method,name:values['Full name'],email:values['Email address'],phone:values['Phone number (optional)'],...(adopting ? {dogId:dog.id} : {})})});setComplete(`${result.message} Reference: ${result.contribution.id}`);}
        catch(error){setError(error.message);}finally{setBusy(false);}
      } },
      adopting ? h(Input, { type: 'hidden', name: 'dogId', value: dog.id }) : null,
      panel('Contribution frequency', adopting ? [h('p', { className: 'mb-0' }, 'Monthly support for up to six months, ending sooner if your dog finds a home.'),
        h(Input, { type: 'hidden', name: 'frequency', value: 'monthly' })] : [
        h('div', { className: 'row g-3' }, ...[['once', 'Once-off', 'A single contribution', 'credit-card'], ['monthly', 'Monthly', 'Ongoing support', 'arrow-repeat']].map(([value, title, detail, symbol]) =>
          h('div', { key: value, className: 'col-12 col-sm-6' }, choice('frequency', value, frequency === value, setFrequency, title, detail, symbol))))]),
      panel(`Contribution amount (ZAR)${frequency === 'monthly' ? ' — per month' : ''}`, [
        h('div', { className: 'row g-3 mb-3' }, ...[100, 250, 500, 1000, 2500, 5000].map(value => h('div', { key: value, className: 'col-6 col-sm-4' },
          h(Button, { type: 'button', className: `btn w-100 support-amount${amount === String(value) ? ' is-selected' : ''}`, 'aria-pressed': amount === String(value),
            onClick: () => { setAmount(String(value)); setComplete(false); } }, `R${value}`)))),
        h('label', { htmlFor: `${id}-amount`, className: 'form-label' }, 'Enter an amount'),
        h(Input, { id: `${id}-amount`, name: 'amount', type: 'number', inputMode: 'decimal', min: '1', step: '.01', required: true,
          className: 'form-control form-control-lg', placeholder: 'Other amount', value: amount, onChange: event => setAmount(event.target.value), 'aria-describedby': `${id}-amount-feedback` }),
        h('div', { id: `${id}-amount-feedback`, className: 'invalid-feedback' }, 'Enter at least R1, with no more than two decimal places.')]),
      panel('Payment method', [h('div', { className: 'd-flex flex-column gap-3' },
        ...[['payfast', 'Credit / debit card', 'Payfast', 'credit-card'], ['eft', 'Direct EFT', 'Bank transfer', 'bank']].map(([value, title, detail, symbol]) =>
          choice('paymentMethod', value, method === value, setMethod, title, detail, symbol))),
        h('small', { className: 'd-block text-body-secondary mt-3' }, 'Your request will be saved for payment follow-up. No payment is taken on this form.')]),
      panel('Your details', [h('div', { className: 'd-flex flex-column gap-3' }, field('Full name', 'text', 'name'), field('Email address', 'email', 'email'), field('Phone number (optional)', 'tel', 'tel', false))]),
      h(Button, { type: 'submit', className: 'btn btn-primary btn-lg support-submit',disabled:busy || !!complete }, busy ? 'Saving…' : adopting ? `Support ${dog.name}` : 'Donate', icon('arrow-right ms-2')),
      error ? h('div',{className:'alert alert-danger mb-0',role:'alert'},error) : null,
      complete ? h('div', { className: 'alert alert-primary mb-0', role: 'status' }, complete) : null),
    h('div', { className: 'alert support-period mb-0' }, h('h2', { className: 'h6 fw-bold' }, 'Why your support matters'),
      h('p', { className: 'mb-0' }, 'Your contribution helps CLAW provide food, shelter, veterinary care and love to dogs while they wait for their forever homes.')));
}
