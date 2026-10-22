// Composed worker screens reuse the public app's form controls and the dashboard shell.
import React, { useEffect, useRef, useState } from 'react';
import { DogProfileContent } from '../pages/layouts.js';
import { api, useApi } from '../components/api.js';
import { Button, Input, Select, Field } from '../components/ui.js';
import { h, asset, Icon, Notice, Status, SectionHeader, RequestTable, Modal, money, formatDate, formatLoginDate } from './components.js';
const heading = (title, add = false) => h('div', { className: 'worker-page-heading' }, h('h1', null, title), add && h(Button, { href: '#/animals/new', className: 'btn btn-primary worker-add' }, h(Icon, { name: 'add' }), h('span', null, 'Add New Animal')));
const statusOf = dog => dog.archivedAt ? 'archived' : dog.permanentAdoptionDate ? 'adopted' : dog.available ? 'available' : 'sponsored';

function Review({ request, readOnly, onClose, reload }) {
  const [note, setNote] = useState(request.review_note || ''), [state, setState] = useState(request.review_status || 'reviewed'), [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await api(`/worker/requests/${request.id}/review`, { method: 'PUT', body: JSON.stringify({ status: state, note }) }); reload(); onClose(); }
    catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  return h(Modal, { title: readOnly ? 'Request details' : 'Review request', onClose },
    h('p', null, h('strong', null, request.name), h('br'), request.email, request.phone && h('span', null, h('br'), request.phone)),
    h('p', null, `${money(request.amount_cents)} · ${request.frequency === 'monthly' ? 'Monthly' : 'Once'} · ${formatDate(request.created_at)}`),
    h('p', { className: 'worker-footnote mb-3' }, 'Reviewing a request does not confirm payment or activate sponsorship.'),
    h('form', { onSubmit: submit },
      h(Field, { id: 'review-status', label: 'Review outcome', className: 'mb-3' }, h(Select, { id: 'review-status', value: state, disabled: readOnly, onChange: e => setState(e.target.value) }, h('option', { value: 'reviewed' }, 'Reviewed'), h('option', { value: 'approved' }, 'Approved'), h('option', { value: 'declined' }, 'Declined'))),
      h(Field, { id: 'review-note', label: 'Internal note', className: 'mb-4' }, h('textarea', { id: 'review-note', className: 'form-control', value: note, rows: 4, maxLength: 1000, disabled: readOnly, onChange: e => setNote(e.target.value) })),
      error && h(Notice, { error: true }, error), !readOnly && h(Button, { type: 'submit', disabled: busy }, busy ? 'Saving…' : 'Save review')));
}

// Per-worker browser-session history stores only animal IDs and view times.
const recentViewsKey = workerId => `claw-worker-recent-views:${workerId}`;
function recentViews(workerId) {
  try {
    const items = JSON.parse(sessionStorage.getItem(recentViewsKey(workerId)) || '[]');
    return Array.isArray(items) ? items.filter(item => typeof item?.id === 'string' && Number.isFinite(item.viewedAt)).slice(0, 12) : [];
  } catch { return []; }
}
function RecentlyViewed({ animals, workerId }) {
  const viewed = recentViews(workerId).map(item => ({ ...item, dog: animals.find(d => d.id === item.id) })).filter(item => item.dog).slice(0, 3);
  return viewed.length ? h('div', { className: 'worker-panel worker-table-wrap' }, h('table', { className: 'worker-table' },
    h('thead', null, h('tr', null, ...['Animal', 'Last viewed', 'Status', 'Details'].map(label => h('th', { key: label, scope: 'col' }, label)))),
    h('tbody', null, ...viewed.map(({ dog, viewedAt }) => h('tr', { key: dog.id },
      h('td', { className: 'worker-pet-cell' }, h('a', { href: `#/animals/${dog.id}`, className: 'worker-pet' }, h('img', { src: dog.image, alt: dog.name, loading: 'lazy' }), h('span', null, h('strong', null, dog.name), h('small', null, dog.breed)))),
      h('td', { 'data-label': 'Last viewed' }, h('time', { dateTime: new Date(viewedAt).toISOString() }, formatLoginDate(new Date(viewedAt).toISOString()))),
      h('td', { 'data-label': 'Status' }, h(Status, { status: statusOf(dog) })),
      h('td', { 'data-label': 'Details' }, h('a', { href: `#/animals/${dog.id}` }, 'View'))))))) :
    h('div', { className: 'worker-panel worker-empty' }, h('p', null, 'Animal profiles you open will appear here.'));
}

export function Dashboard({ data, worker, readOnly, reload }) {
  const [review, setReview] = useState(null);
  const summary = data.summary;
  const recent = data.requests.filter(r => r.dog_id).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 3);
  return h(React.Fragment, null,
    heading(`Welcome Back, ${worker.username}`, !readOnly),
    h('div', { className: 'worker-kpis' },
      ...[['Total Dogs', summary.totalDogs, 'total-dogs'], ['Successful Adoptions', summary.successfulAdoptions, 'successful'], ['Pending Adoptions', summary.pendingAdoptions, 'pending'], ['Monthly Donations', money(summary.monthlyDonations), 'donations']].map(([label, count, icon], index) => h('section', { key: label, className: `worker-kpi ${index === 0 ? 'worker-kpi-total' : ''}` },
        h('h2', null, h(Icon, { name: icon }), label), h('p', { className: 'worker-kpi-value' }, index === 1 ? h('a', { href: '#/animals?filter=successful', 'aria-label': `View ${count} successful adoptions` }, count) : count), index === 0 && h('p', { className: 'worker-kpi-detail' }, h('span', null, `+${summary.newThisMonth}`), ' this month'), index === 0 && h('img', { className: 'worker-kpi-dog', src: asset('dashboard-dog.png'), alt: '' })))),
    h('section', { className: 'worker-section' }, h(SectionHeader, { title: 'Recently Viewed', href: '#/animals' }), h(RecentlyViewed, { animals: data.animals, workerId: worker.id })),
    h('section', { className: 'worker-section' }, h(SectionHeader, { title: 'Recent Adoptions', href: '#/adoptions' }), h(RequestTable, { requests: recent, animals: data.animals, onReview: setReview, readOnly })),
    review && h(Review, { request: review, readOnly, reload, onClose: () => setReview(null) }));
}

export function AnimalGallery({ data, readOnly, reload }) {
  const [search, setSearch] = useState(''), [filter, setFilter] = useState(() => new URLSearchParams(location.hash.split('?')[1] || '').get('filter') === 'successful' ? 'successful' : 'current'), [page, setPage] = useState(1), [confirm, setConfirm] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [filters, setFilters] = useState({ breed: '', sex: '', size: '', energyLevel: '', status: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const changeFilter = (key, value) => { setFilters(current => ({ ...current, [key]: value })); setPage(1); };
  const animals = data.animals.filter(d =>
    (filter === 'successful' ? Boolean(d.permanentAdoptionDate) : filter === 'all' || filter === 'archived' ? filter === 'all' || d.archivedAt : !d.archivedAt) &&
    d.name.toLowerCase().includes(search.trim().toLowerCase()) &&
    Object.entries(filters).every(([key, value]) => !value || (key === 'status' ? statusOf(d) : d[key]) === value));
  const filterControl = (key, label, options, prefix = 'animal') => h(Field, { key, id: `${prefix}-${key}-filter`, label },
    h(Select, { id: `${prefix}-${key}-filter`, value: filters[key], onChange: e => changeFilter(key, e.target.value) },
      h('option', { value: '' }, `All ${label.toLowerCase()}`), ...options.map(option => {
        const [value, text] = Array.isArray(option) ? option : [option, option];
        return h('option', { key: value, value }, text);
      })));
  const breeds = [...new Set(data.animals.map(d => d.breed))].sort();
  const statuses = [['available', 'Available'], ['sponsored', 'Sponsored'], ['adopted', 'Permanently adopted'], ['archived', 'Archived']];
  const showControl = id => h(Field, { id, label: 'Show' }, h(Select, { id, value: filter, onChange: e => { setFilter(e.target.value); setPage(1); } },
    ...[['current', 'Current profiles'], ['archived', 'Archived profiles'], ['all', 'All profiles'], ['successful', 'Successful adoptions']].map(([value, label]) => h('option', { key: value, value }, label))));
  const pageCount = Math.max(1, Math.ceil(animals.length / 10)), currentPage = Math.min(page, pageCount);
  async function archive() {
    setBusy(true); setError('');
    try { await api(`/worker/animals/${confirm.id}/archive`, { method: 'PATCH', body: JSON.stringify({ revision: Number(confirm.revision) || 0, archived: !confirm.archivedAt }) }); setConfirm(null); reload(); }
    catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  return h(React.Fragment, null, heading('Animal Profiles', !readOnly),
    h('div', { className: 'worker-toolbar worker-panel worker-animal-toolbar', 'aria-label': 'Animal filters' },
      showControl('animal-filter'),
      filterControl('breed', 'Breed', breeds),
      filterControl('status', 'Status', statuses),
      h(Button, { variant: 'secondary', size: '', className: 'btn btn-secondary worker-more-filters', 'aria-haspopup': 'dialog', onClick: () => setFiltersOpen(true) }, h('i', { className: 'bi bi-sliders', 'aria-hidden': true }), ' More filters')),
    h('div', { className: 'worker-animal-search', role: 'search' },
      h('label', { className: 'visually-hidden', htmlFor: 'animal-search' }, 'Search by name'),
      h('i', { className: 'bi bi-search', 'aria-hidden': true }),
      h(Input, { id: 'animal-search', type: 'search', placeholder: 'Search animal name', value: search, onChange: e => { setSearch(e.target.value); setPage(1); } })),
    filtersOpen && h(Modal, { title: 'Filter animals', className: 'worker-filter-drawer', onClose: () => setFiltersOpen(false) },
      h('div', { className: 'worker-filter-fields' }, showControl('drawer-animal-filter'),
        filterControl('breed', 'Breed', breeds, 'drawer'), filterControl('status', 'Status', statuses, 'drawer'),
        filterControl('sex', 'Sex', ['Female', 'Male', 'Unknown'], 'drawer'),
        filterControl('size', 'Size', ['Small', 'Medium', 'Large'], 'drawer'),
        filterControl('energyLevel', 'Energy level', ['Low', 'Medium', 'High'], 'drawer')),
      h('div', { className: 'worker-filter-actions' },
        h(Button, { variant: 'outline-secondary', onClick: () => { setFilter('current'); setFilters({ breed: '', sex: '', size: '', energyLevel: '', status: '' }); setPage(1); } }, 'Reset filters'),
        h(Button, { onClick: () => setFiltersOpen(false) }, 'Show results'))),
    h('div', { className: 'worker-panel worker-table-wrap' }, h('table', { className: 'worker-table' },
      h('thead', null, h('tr', null, ...['Animals', 'Age', 'Date Came In', 'Status', 'View', 'Archive'].map(label => h('th', { key: label, scope: 'col' }, label)))),
      h('tbody', null, ...animals.slice((currentPage - 1) * 10, currentPage * 10).map(dog => h('tr', { key: dog.id },
        h('td', { className: 'worker-pet-cell' }, h('a', { href: `#/animals/${dog.id}`, className: 'worker-pet' }, h('img', { src: dog.image, alt: dog.name, loading: 'lazy' }), h('span', null, h('strong', null, dog.name), h('small', null, dog.breed)))),
        h('td', { 'data-label': 'Age' }, dog.age), h('td', { 'data-label': 'Date Came In' }, formatDate(dog.intakeDate)), h('td', { 'data-label': 'Status' }, h(Status, { status: statusOf(dog) })),
        h('td', { 'data-label': 'View' }, h('a', { href: `#/animals/${dog.id}` }, 'View')),
        h('td', { 'data-label': 'Archive' }, h(Button, { className: 'worker-text-button', disabled: readOnly, onClick: () => { setError(''); setConfirm(dog); } }, dog.archivedAt ? 'Restore' : 'Archive'))))),
      !animals.length && h('caption', { className: 'p-4' }, 'No animals match your search.')),
      h('nav', { className: 'worker-pagination', 'aria-label': 'Animal pages' }, h('span', null, `Page ${currentPage} of ${pageCount}`), h(Button, { size: '', variant: 'outline-secondary', disabled: currentPage === 1, onClick: () => setPage(currentPage - 1) }, 'Previous'), h(Button, { size: '', variant: 'outline-secondary', disabled: currentPage === pageCount, onClick: () => setPage(currentPage + 1) }, 'Next'))),
    confirm && h(Modal, { title: `${confirm.archivedAt ? 'Restore' : 'Archive'} ${confirm.name}?`, onClose: () => setConfirm(null) }, h('p', null, confirm.archivedAt ? 'This profile will return to the website if the animal is still in care.' : 'This hides the profile from the public website. Its history stays saved and you can restore it later.'), error && h(Notice, { error: true }, error), h(Button, { disabled: busy, onClick: archive }, busy ? 'Saving…' : confirm.archivedAt ? 'Restore profile' : 'Archive profile')));
}

// Viewing a profile uses semantic content, separate from the editing form.
export function AnimalProfile({ id, data, readOnly, reload, worker }) {
  const [confirm, setConfirm] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const actionsRef = useRef(null), editRef = useRef(null);
  const [showScroll, setShowScroll] = useState(false);
  // Observe the actual buttons, so footer padding cannot hide the cue prematurely.
  useEffect(() => {
    if (readOnly || !editRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setShowScroll(!entry.isIntersecting));
    observer.observe(editRef.current);
    return () => observer.disconnect();
  }, [id, readOnly]);
  function scrollToActions() {
    editRef.current?.focus({ preventScroll: true });
    actionsRef.current?.scrollIntoView({ block: 'end', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  const dog = data.animals.find(animal => animal.id === id);
  useEffect(() => {
    if (!dog || !worker?.id) return;
    try {
      const history = [{ id: dog.id, viewedAt: Date.now() }, ...recentViews(worker.id).filter(item => item.id !== dog.id)].slice(0, 12);
      sessionStorage.setItem(recentViewsKey(worker.id), JSON.stringify(history));
    } catch { /* Browsers that block storage still allow normal profile viewing. */ }
  }, [id, worker?.id, Boolean(dog)]);

  if (!dog) return h(Notice, { error: true }, 'Animal not found. ', h('a', { href: '#/animals' }, 'Back to profiles'));
  async function archive() {
    setBusy(true); setError('');
    try { await api(`/worker/animals/${dog.id}/archive`, { method: 'PATCH', body: JSON.stringify({ revision: Number(dog.revision) || 0, archived: !dog.archivedAt }) }); setConfirm(false); reload(); }
    catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  return h(React.Fragment, null,
    h('a', { href: '#/animals', className: 'worker-back-link' }, '← Animal Profiles'),
    h('div', { className: 'worker-animal-display', 'data-figma-node': '6105:5905' },
      h(DogProfileContent, { dog, actions: h(React.Fragment) }),
      !readOnly && h('footer', { ref: actionsRef, id: 'worker-profile-actions', className: 'worker-profile-actions', 'aria-label': 'Animal profile actions' },
        h(Button, { ref: editRef, href: `#/animals/${dog.id}/edit`, variant: 'primary' }, h(Icon, { name: 'edit' }), 'Edit'),
        h(Button, { variant: 'secondary', className: 'btn btn-secondary worker-archive-button', onClick: () => setConfirm(true) }, h(Icon, { name: 'delete' }), dog.archivedAt ? 'Restore' : 'Archive'))),
    !readOnly && showScroll && !confirm && h('button', { type: 'button', className: 'worker-scroll-cue', 'aria-label': 'Scroll to animal profile actions', 'aria-controls': 'worker-profile-actions', onClick: scrollToActions }, h('i', { className: 'bi bi-chevron-down', 'aria-hidden': true })),
    confirm && h(Modal, { title: `${dog.archivedAt ? 'Restore' : 'Remove'} ${dog.name}?`, onClose: () => setConfirm(false) },
      h('p', null, dog.archivedAt ? 'Restore this animal profile to the current listing.' : 'This archives the profile and hides it from the public website. Its history stays saved and you can restore it later.'),
      error && h(Notice, { error: true }, error), h(Button, { disabled: busy, onClick: archive }, busy ? 'Saving…' : dog.archivedAt ? 'Restore profile' : 'Archive profile')));
}

const emptyAnimal = { name: '', breed: '', ageMonths: '', size: 'Medium', sex: 'Unknown', energyLevel: 'Medium', intakeDate: '', location: 'CLAW Animal Shelter', overview: '', story: '', personality: [], goodWithPeople: '', goodWithAnimals: '', image: '', sponsorshipStartedAt: '', sponsorshipEndsAt: '', permanentAdoptionDate: '', revision: 0 };
export function AnimalEditor({ id, data, readOnly, reload }) {
  const original = id === 'new' ? emptyAnimal : data.animals.find(d => d.id === id);
  const [form, setForm] = useState(() => ({ ...(original || emptyAnimal), personality: (original?.personality || []).join('\n') }));
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState('');
  const set = (name, value) => { setForm(current => ({ ...current, [name]: value })); setSaved(''); };
  if (!original) return h(Notice, { error: true }, 'Animal not found. ', h('a', { href: '#/animals' }, 'Back to profiles'));
  async function upload(event) {
    const file = event.target.files[0]; if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) { setError('Choose a JPEG, PNG or WebP up to 2 MB.'); return; }
    setBusy(true); setError('');
    try { const result = await api('/worker/images', { method: 'POST', body: file, headers: { 'Content-Type': file.type } }); set('image', result.image); } catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setSaved('');
    try {
      const result = await api(`/worker/animals${id === 'new' ? '' : `/${id}`}`, { method: id === 'new' ? 'POST' : 'PUT', body: JSON.stringify({ ...form, ageMonths: Number(form.ageMonths), revision: Number(form.revision) || 0, personality: form.personality.split('\n').map(s => s.trim()).filter(Boolean) }) });
      setForm({ ...result.animal, personality: result.animal.personality.join('\n') });
      reload(); location.hash = `/animals/${result.animal.id}`;
    } catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  function field(name, label, type = 'text', required = false) { return h(Field, { id: `animal-${name}`, label, key: name }, h(Input, { id: `animal-${name}`, type, required, value: form[name] ?? '', maxLength: ['name', 'breed'].includes(name) ? 80 : 250, ...(type === 'number' ? { min: 0, max: 360, step: '0.5' } : {}), onChange: e => set(name, e.target.value) })); }
  function select(name, label, options) { return h(Field, { id: `animal-${name}`, label }, h(Select, { id: `animal-${name}`, value: form[name], onChange: e => set(name, e.target.value) }, ...options.map(value => h('option', { key: value, value }, value)))); }
  function textarea(name, label, max) { return h(Field, { id: `animal-${name}`, label }, h('textarea', { id: `animal-${name}`, className: 'form-control', rows: name === 'story' ? 6 : 4, value: form[name], required: name !== 'personality', maxLength: max, onChange: e => set(name, e.target.value) })); }
  return h(React.Fragment, null, h('a', { href: '#/animals', className: 'worker-back-link' }, '← Animal Profiles'), heading(id === 'new' ? 'Add New Animal' : form.name),
    h('form', { className: 'worker-panel worker-editor', onSubmit: submit },
      h('fieldset', { disabled: readOnly || busy }, h('legend', { className: 'visually-hidden' }, 'Animal profile'),
        h('div', { className: 'worker-editor-grid' },
          h('div', { className: 'worker-editor-photo' }, form.image ? h('img', { src: form.image, alt: form.name || 'Animal photo' }) : h('div', { className: 'worker-photo-placeholder' }, 'Add an animal photo'),
            h(Field, { id: 'animal-photo', label: 'Upload photo (up to 2 MB)', className: 'mt-3' }, h(Input, { id: 'animal-photo', type: 'file', accept: 'image/jpeg,image/png,image/webp', onChange: upload })),
            h(Field, { id: 'animal-existing-photo', label: 'Or select an existing photo', className: 'mt-3' }, h(Select, { id: 'animal-existing-photo', value: form.image, onChange: e => set('image', e.target.value) }, h('option', { value: '' }, 'Select photo'), !data.animals.some(d => d.image === form.image) && form.image && h('option', { value: form.image }, 'Uploaded photo'), ...data.animals.filter((d, i, all) => all.findIndex(other => other.image === d.image) === i).map(d => h('option', { key: d.id, value: d.image }, d.name))))),
          h('div', { className: 'worker-form-grid' }, field('name', 'Name', 'text', true), field('breed', 'Breed', 'text', true), field('ageMonths', 'Age in months', 'number', true), select('sex', 'Sex', ['Female', 'Male', 'Unknown']), select('size', 'Size', ['Small', 'Medium', 'Large']), select('energyLevel', 'Energy level', ['Low', 'Medium', 'High']), field('intakeDate', 'In care since', 'date', true), field('location', 'Location', 'text', true))),
        h('div', { className: 'worker-copy-fields' }, textarea('overview', 'Overview', 4000), textarea('story', 'Their Story', 6000), textarea('personality', 'Personality (one trait per line)', 1900),
          h('div', { className: 'worker-form-grid' }, field('goodWithPeople', 'Good with people'), field('goodWithAnimals', 'Good with animals'))),
        h('section', { className: 'worker-status-fields' }, h('h2', null, 'Care and adoption status'), h('p', { className: 'worker-footnote' }, 'Record verified care information here. Virtual sponsorship is separate from permanent adoption. Request reviews never change these dates automatically.'),
          h('div', { className: 'worker-form-grid' }, field('sponsorshipStartedAt', 'Sponsored since', 'date'), field('sponsorshipEndsAt', 'Sponsorship ends (optional)', 'date'), field('permanentAdoptionDate', 'Permanent adoption date', 'date')),
          h('p', { className: 'worker-footnote mt-3' }, 'A permanent adoption date removes this dog from the public virtual-adoption listing. Clear it only to correct the record.'))),
      error && h(Notice, { error: true }, error), saved && h(Notice, null, saved),
      h('div', { className: 'worker-form-actions' }, h(Button, { href: id === 'new' ? '#/animals' : `#/animals/${id}`, variant: 'outline-secondary' }, 'Cancel'), !readOnly && h(Button, { type: 'submit', disabled: busy }, busy ? 'Saving…' : 'Save animal'))));
}

export function Requests({ data, readOnly, reload }) {
  const [review, setReview] = useState(null), [filter, setFilter] = useState('all'), [search, setSearch] = useState('');
  const requests = data.requests.filter(r => (filter === 'all' || (r.review_status || r.status) === filter) && `${r.name} ${r.email} ${data.animals.find(d => d.id === r.dog_id)?.name || ''}`.toLowerCase().includes(search.toLowerCase()));
  return h(React.Fragment, null, heading('Adoptions'),
    h('div', { className: 'worker-toolbar' }, h(Field, { id: 'request-search', label: 'Search requests' }, h(Input, { id: 'request-search', type: 'search', value: search, placeholder: 'Search animal, name or email', onChange: e => setSearch(e.target.value) })), h(Field, { id: 'request-filter', label: 'Status' }, h(Select, { id: 'request-filter', value: filter, onChange: e => setFilter(e.target.value) }, ...[['all', 'All requests'], ['pending_payment', 'Pending'], ['reviewed', 'Reviewed'], ['approved', 'Approved'], ['declined', 'Declined']].map(([value, label]) => h('option', { value, key: value }, label))))),
    h(RequestTable, { requests, animals: data.animals, onReview: setReview, readOnly }), review && h(Review, { request: review, readOnly, reload, onClose: () => setReview(null) }));
}

export function Staff({ worker }) {
  // Only mount the staff API hook for administrators; other roles receive their own access summary.
  return worker.role !== 'admin' ? h(React.Fragment, null, heading('Settings'), h('div', { className: 'worker-panel p-4' }, h('h2', null, 'Your access'), h('p', null, `${worker.username} · ${worker.role === 'viewer' ? 'View only' : 'Edit'}`), h('p', null, 'Contact an administrator to manage worker access.'))) : h(StaffManagement, { worker });
}
function StaffManagement({ worker }) {
  const staff = useApi('/worker/staff'), [add, setAdd] = useState(false), [remove, setRemove] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  async function save(event) {
    event.preventDefault(); setBusy(true); setError('');
    const body = Object.fromEntries(new FormData(event.currentTarget));
    try { await api('/worker/staff', { method: 'POST', body: JSON.stringify(body) }); setAdd(false); staff.retry(); } catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  async function revoke() {
    setBusy(true); setError('');
    try { await api(`/worker/staff/${remove.id}`, { method: 'DELETE' }); setRemove(null); staff.retry(); } catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  return h(React.Fragment, null, h('div', { className: 'worker-page-heading' }, h('h1', null, 'Settings'), h(Button, { onClick: () => { setError(''); setAdd(true); } }, 'Add New Staff')),
    staff.loading ? h('p', { role: 'status' }, 'Loading staff…') : staff.error ? h(Notice, { error: true }, staff.error, h(Button, { onClick: staff.retry }, 'Retry')) :
      h('div', { className: 'worker-panel worker-table-wrap' }, h('table', { className: 'worker-table' }, h('thead', null, h('tr', null, ...['Accounts', 'Date Added', 'Access', 'Actions'].map(label => h('th', { key: label, scope: 'col' }, label)))), h('tbody', null, ...staff.data.staff.map(person => h('tr', { key: person.id }, h('td', null, h('strong', null, person.username), h('small', null, person.email)), h('td', { 'data-label': 'Date Added' }, formatDate(person.granted_at)), h('td', { 'data-label': 'Access' }, ({ admin: 'Admin', editor: 'Edit', viewer: 'View only' })[person.role]), h('td', { 'data-label': 'Actions' }, h(Button, { className: 'worker-text-button', disabled: person.id === worker.id, onClick: () => { setError(''); setRemove(person); } }, person.id === worker.id ? 'Your account' : 'Remove'))))))),
    add && h(Modal, { title: 'Add or update staff', onClose: () => setAdd(false) }, h('p', null, 'The person must first register an account on this website. Assigning a role grants access to this worker app.'), h('form', { onSubmit: save },
      h(Field, { id: 'staff-email', label: 'Existing account email', className: 'mb-3' }, h(Input, { id: 'staff-email', name: 'email', type: 'email', required: true, maxLength: 254 })),
      h(Field, { id: 'staff-role', label: 'Access', className: 'mb-4' }, h(Select, { id: 'staff-role', name: 'role', defaultValue: 'viewer' }, h('option', { value: 'viewer' }, 'View only'), h('option', { value: 'editor' }, 'Edit'), h('option', { value: 'admin' }, 'Admin — can manage staff'))), error && h(Notice, { error: true }, error), h(Button, { type: 'submit', disabled: busy }, busy ? 'Saving…' : 'Save access'))),
    remove && h(Modal, { title: `Remove ${remove.username}?`, onClose: () => setRemove(null) }, h('p', null, 'Worker access will be revoked immediately. Their public account and saved records will be kept.'), error && h(Notice, { error: true }, error), h(Button, { variant: 'danger', disabled: busy, onClick: revoke }, busy ? 'Removing…' : 'Remove access')));
}
