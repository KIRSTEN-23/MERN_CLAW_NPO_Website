import { StudentProjectNotice } from './student-project-notice.js';
import { Button, Badge, Input, Select } from './ui.js';
import React, { useEffect, useLayoutEffect, useId, useRef, useState } from "react";
import { HomeImage } from "./home-assets.js";
import { api, useApi, ageGroup } from "./api.js";
const h = React.createElement;
export const icon = (name) =>
  h("i", { className: `bi bi-${name}`, "aria-hidden": true });
export const action = (label, href, variant = "primary", extra = "") =>
  h(
    Button,
    {
      href,
      className: `btn btn-${variant} btn-lg ${extra}`,
    },
    label,
  );
export function HeroActions() {
  return h(
    "div",
    { className: "d-flex flex-column flex-lg-row gap-3" },
    action("Donate Now", "#/donate"),
    action("Learn More", "#/?section=about", "outline-primary"),
  );
}
export function Navigation({ transparent = false } = {}) {
  const [open, setOpen] = useState(false);
  const [user,setUser]=useState(null);
  const [authError,setAuthError]=useState('');
  useEffect(()=>{const update=()=>api('/auth/me').then(result=>setUser(result.user)).catch(()=>setUser(null));update();window.addEventListener('claw-auth-change',update);return ()=>window.removeEventListener('claw-auth-change',update);},[]);
  const logout=async()=>{try{await api('/auth/logout',{method:'POST'});setUser(null);location.hash='#/';}catch(error){setAuthError(error.message);}};
  const id = useId();
  const path = location.hash.slice(1).split("?")[0] || "/";
  const [activeSection, setActiveSection] = useState("home");
  useEffect(() => {
    if (path !== "/") return;
    const update = () => {
      const header = document.querySelector(
        '[data-layout="navigation-parent"]',
      );
      const marker = Math.max(
        (header?.getBoundingClientRect().bottom || 0) + 1,
        window.innerHeight * 0.5,
      );
      const sections = ["about", "footer-container"];
      let current = window.scrollY <= 1 ? "home" : null;
      const hero = document.querySelector(
        window.innerWidth >= 992
          ? '[data-layout="hero-desktop"]'
          : '[data-layout="hero"]',
      );
      if (hero?.getBoundingClientRect().bottom > marker) current = "home";
      for (const section of sections) {
        const element = document.getElementById(section);
        const bounds = element?.getBoundingClientRect();
        const sectionMarker = element
          ? Math.max(
              marker,
              (parseFloat(window.getComputedStyle(element).scrollMarginTop) ||
                0) + 1,
            )
          : marker;
        if (
          bounds &&
          bounds.top <= sectionMarker &&
          bounds.bottom > sectionMarker
        )
          current = section;
      }
      const footer = document.getElementById("footer-container");
      if (
        window.scrollY > 1 &&
        footer &&
        footer.getBoundingClientRect().top < window.innerHeight &&
        window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 2
      )
        current = "footer-container";
      setActiveSection(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [path]);
  const links = [
    ["Home", "#/"],
    ["About Us", "#/?section=about"],
    ["Our Dogs", "#/dogs"],
    ["Contact Us", "#/?section=footer-container"],
  ];
  return h(
    "nav",
    {
      className: `navbar navbar-expand-lg${transparent ? "" : " bg-body-tertiary"}`,
      "aria-label": "Primary navigation",
      onKeyDown: (event) => {
        if (event.key === "Escape") setOpen(false);
      },
    },
    h(
      "div",
      { className: "container-fluid navigation-container px-0" },
      h(Button,
        {
          type: "button",
          className: "navbar-toggler icon-button",
          onClick: () => setOpen(!open),
          "aria-controls": id,
          "aria-expanded": open,
          "aria-label": open ? "Close navigation" : "Open navigation",
        },
        icon(open ? "x-lg" : "list"),
      ),
      h(
        "a",
        {
          className: "navbar-brand",
          href: "#/",
          onClick: () => setOpen(false),
        },
        h("img", {
          src: "/public/assets/shared/logo.svg",
          height: 48,
          className: "navigation-logo",
          alt: "CLAW",
        }),
      ),
      h("div", { className: "d-flex align-items-center gap-3 ms-auto order-lg-3 navigation-actions" },
        user ? h(Button,{className:"btn btn-lg nav-signup",type:"button",onClick:logout},"Log Out") : h(Button, { className: "btn btn-lg nav-signup", href: "#/signup", onClick: () => setOpen(false) }, "Sign Up"),
        authError ? h('span',{role:'alert',className:'text-danger small'},authError) : null,
        h(Button, { href: "#/donate", className: "btn btn-primary btn-lg nav-donate", onClick: () => setOpen(false) }, "Donate")),
      h(
        "div",
        { id, className: `collapse navbar-collapse${open ? " show" : ""}` },
        h(
          "ul",
          { className: "nav nav-underline flex-column flex-lg-row me-auto" },
          ...links.map(([label, href]) => {
            const section = href === "#/" ? "home" : href.split("section=")[1];
            const active =
              href === "#/dogs"
                ? path.startsWith("/dogs")
                : path === "/" && activeSection === section;
            return h(
              "li",
              { key: label, className: "nav-item" },
              h(
                "a",
                {
                  href,
                  className: `nav-link${active ? " active" : ""}`,
                  "aria-current": active ? "page" : undefined,
                  onClick: () => setOpen(false),
                },
                h("span", { className: "nav-link-label" }, label),
              ),
            );
          }),
        ),
      ),
    ),
  );
}
// All listings and featured cards use this template; active only changes its colour plane.
export function DogCard(props) { return h(CareDogCard, props); }
export function CareDogCard({ dog, active = false }) {
  return h(
    "article",
    {
      className: `card care-dog-card shadow-lg${active ? " is-active" : ""}`,
      "data-dog-id": dog.id,
    },
    h("div", { className: "care-card-colour-layer", "aria-hidden": true }),
    h(
      "div",
      { className: "card-body p-3 d-flex flex-column gap-3 care-card-content" },
      h(
        "div",
        { className: "care-card-media" },
        h("img", { src: dog.image, alt: dog.name, "data-dog-id": dog.id, className: "home-image dog-data-image", loading: "lazy" }),
      ),
      h(
        Button,
        {
          href: `#/dogs/details?dog=${dog.id}`,
          className:
            "btn btn-outline-light btn-lg icon-button care-profile-link",
          "aria-label": `View ${dog.name}’s profile`,
        },
        icon("arrow-up-right"),
      ),
      h(
        "div",
        {
          className: "d-flex align-items-center justify-content-between gap-3",
        },
        h("h3", { className: "h5 mb-0 care-card-name" }, dog.name),
        h(
          Badge,
          { className: `care-availability${dog.available ? "" : " is-unavailable"}` },
          dog.available ? "Available" : "Unavailable",
        ),
      ),
      h(
        "dl",
        { className: "mb-0 care-card-facts" },
        ...[
          ["Breed", dog.breed],
          ["Sex", dog.sex],
          ["Age", String(dog.age)],
        ].map(([label, value], index) =>
          h(
            "div",
            {
              key: label,
              className: `d-flex justify-content-between gap-3 py-2${index < 2 ? " border-bottom" : ""}`,
            },
            h("dt", null, label),
            h("dd", { className: "mb-0" }, value),
          ),
        ),
      ),
      dog.available ? action("Adopt", `#/donate?mode=adopt&dog=${dog.id}`, "primary", "w-100") : h(Button,{type:'button',className:'btn btn-primary btn-lg w-100',disabled:true},'Already sponsored'),
    ),
  );
}
export function FeaturedDogs({ mobile = false }) {
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [trackHeight, setTrackHeight] = useState(0);
  const track = useRef(null);
  const touch = useRef(null);
  const {data,error,loading,retry}=useApi('/dogs?available=true');
  const featured = data?.dogs || [];
  const current = Math.min(index, Math.max(0, featured.length - 1));
  const move = delta => setIndex(previous => Math.max(0, Math.min(featured.length - 1, previous + delta)));
  useLayoutEffect(() => {
    if (mobile || !track.current) return;
    const element = track.current;
    const measure = () => {
      // Every preceding slide settles at the preview width. Target that final
      // position directly instead of chasing widths during their transition.
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const previewWidth = Math.min(element.clientWidth * 0.28, 18 * rem);
      const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
      setOffset(current * (previewWidth + gap));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [current, mobile, data]);
  useLayoutEffect(() => {
    if (mobile || !track.current) return;
    const element = track.current;
    let previousWidth = -1;
    const measureHeight = (force = false) => {
      const width = element.clientWidth;
      if (!width || (!force && width === previousWidth)) return;
      previousWidth = width;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const widths = [Math.min(width * 0.28, 18 * rem), Math.min(width * 0.36, 22 * rem)];
      const probe = document.createElement('div');
      Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', pointerEvents: 'none', left: '0', top: '0' });
      probe.setAttribute('aria-hidden', 'true');
      probe.inert = true;
      element.parentElement.appendChild(probe);
      let height = 0;
      // Reserve the tallest card at either settled width. Selection and
      // intermediate wrapping then cannot change the section's geometry.
      for (const slide of element.children) {
        for (const cardWidth of widths) {
          const card = slide.firstElementChild.cloneNode(true);
          card.style.width = `${cardWidth}px`;
          probe.replaceChildren(card);
          height = Math.max(height, card.getBoundingClientRect().height);
        }
      }
      probe.remove();
      setTrackHeight(Math.ceil(height));
    };
    measureHeight();
    const observer = new ResizeObserver(() => measureHeight());
    observer.observe(element);
    let active = true;
    document.fonts?.ready.then(() => { if (active) measureHeight(true); });
    return () => { active = false; observer.disconnect(); };
  }, [mobile, data]);
  if(loading)return h('p',{role:'status'},'Loading dogs…');
  if(error)return h('div',{className:'alert alert-danger'},error,h(Button,{className:'btn btn-outline-primary ms-2',onClick:retry},'Retry'));
  if(!featured.length)return h('p',null,'No dogs available at the moment.');
  return h(
    "div",
    {
      className: `d-flex flex-column gap-3 care-carousel${mobile ? " care-carousel-mobile" : ""}`,
      role: "region",
      "aria-label": "Pups in our care",
      "aria-roledescription": "carousel",
      tabIndex: 0,
      onKeyDown: event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
        }
      },
      onTouchStart: event => { const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; },
      onTouchEnd: event => {
        const start = touch.current; touch.current = null;
        if (!start) return;
        const end = event.changedTouches[0];
        const dx = end.clientX - start.x, dy = end.clientY - start.y;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      },
    },
    mobile
      ? h(
          "div",
          { className: "care-mobile-stack mx-auto" },
          h(DogCard, { dog: featured[current], active: true }),
        )
      : h(
          "div",
          { className: "care-carousel-viewport" },
          h(
            "div",
            {
              className: "care-carousel-track d-flex gap-3 align-items-start",
              ref: track,
              style: { "--care-offset": `${offset}px`, ...(trackHeight ? { height: `${trackHeight}px` } : {}) },
            },
            ...featured.map((dog, position) =>
              h(
                "div",
                {
                  key: dog.id,
                  className: `care-carousel-slide${position === current ? " is-active" : ""}`,
                  "data-active": position === current,
                  "aria-hidden": position !== current,
                  inert:
                    position !== current ? true : undefined,
                },
                h(DogCard, { dog, active: position === current }),
              ),
            ),
          ),
        ),
    h(
          "div",
          {
            className:
              `d-flex justify-content-${mobile ? 'center' : 'end'} gap-3 featured-dogs-controls`,
          },
          h(Button,
            {
              type: "button",
              className: "btn btn-outline-primary btn-lg icon-button",
              disabled: current === 0,
              onClick: () => move(-1),
              "aria-label": "Previous dog",
            },
            icon("arrow-left"),
          ),
          h(Button,
            {
              type: "button",
              className: "btn btn-primary btn-lg icon-button",
              disabled: current === featured.length - 1,
              onClick: () => move(1),
              "aria-label": "Next dog",
            },
            icon("arrow-right"),
          ),
        ),
    h('p', { className: 'visually-hidden', 'aria-live': 'polite', 'aria-atomic': true }, `${current + 1} of ${featured.length}: ${featured[current].name}`),
  );
}
export function DogListing() {
  const {data,error,loading,retry}=useApi('/dogs');
  const dogs=data?.dogs || [];
  const [filters, setFilters] = useState({
    available: false,
    Age: [],
    Size: [],
    Sex: [],
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [open, setOpen] = useState(false);
  const id = useId();
  const visible = dogs.filter(
    (d) =>
      (!appliedFilters.available || d.available) &&
      (!appliedFilters.Size.length || appliedFilters.Size.includes(d.size)) &&
      (!appliedFilters.Sex.length || appliedFilters.Sex.includes(d.sex)) &&
      (!appliedFilters.Age.length || appliedFilters.Age.includes(ageGroup(d.ageMonths))),
  );
  const clear = () => { const empty={available:false,Age:[],Size:[],Sex:[]};setFilters(empty);setAppliedFilters(empty); };
  const toggle = (group, value) =>
    setFilters((f) => ({
      ...f,
      [group]: f[group].includes(value)
        ? f[group].filter((v) => v !== value)
        : [...f[group], value],
    }));
  return h(
    "div",
    { className: "row g-4 dog-browse-columns" },
    h(
      "aside",
      { className: "col-12 col-lg-3 dog-filters" },
      h(Button,
        {
          type: "button",
          className: "btn btn-outline-primary btn-lg w-100 d-lg-none",
          onClick: () => setOpen(!open),
          "aria-expanded": open,
          "aria-controls": id,
        },
        "Filter Dogs ",
        icon(open ? "dash" : "plus"),
      ),
      h(
        "div",
        { id, className: `collapse d-lg-block${open ? " show" : ""}` },
        h(
          "div",
          { className: "d-flex flex-column gap-4" },
          h(
            "div",
            {
              className:
                "d-flex align-items-center justify-content-between gap-3 border-bottom pb-3",
            },
            h("h2", { className: "h5 mb-0" }, "Filter Dogs"),
            h(Button,
              {
                type: "button",
                className: "btn btn-link btn-lg p-0 flex-shrink-0",
                onClick: clear,
              },
              "Clear All",
            ),
          ),
          ...Object.entries({
            Age: [
              "Puppy (0–1 years old)",
              "Young (1–3 years old)",
              "Adult (3–7 years old)",
              "Adult (7+ years old)",
            ],
            Size: ["Small", "Medium", "Large", "Extra Large"],
            Sex: ["Unknown", "Male", "Female"],
          }).map(([group, options]) =>
            h(
              "fieldset",
              { key: group, className: "d-flex flex-column gap-3" },
              h("legend", { className: "h6 mb-0 fw-semibold text-uppercase" }, group),
              ...options.map((value, index) => {
                const inputId = `${id}-${group}-${index}`;
                return h(
                  "div",
                  { key: value, className: "form-check" },
                  h(Input, {
                    id: inputId,
                    type: "checkbox",
                    className: "form-check-input",
                    checked: filters[group].includes(value),
                    onChange: () => toggle(group, value),
                  }),
                  h(
                    "label",
                    { className: "form-check-label", htmlFor: inputId },
                    value,
                  ),
                );
              }),
            ),
          ),
          h("div", { className: "border-top pt-3" }, h(Button,
            {
              type: "button",
              className: "btn btn-primary btn-lg w-100",
              disabled: JSON.stringify(filters) === JSON.stringify(appliedFilters),
              onClick: () => { setAppliedFilters(filters); setOpen(false); },
            },
            "Apply",
          )),
        ),
      ),
    ),
    h(
      "div",
      { className: "col-12 col-lg-9 dog-browse-results d-flex flex-column gap-3" },
      h("div", { className: "alert support-period support-period-compact mb-0", role: "note" }, "Virtual adoption provides financial support for six months and does not transfer ownership."),
      h(
        "p",
        { className: "mb-0", role: "status" },
        loading ? "Loading dogs…" : `${visible.length} dogs found`,
      ),
      h(
        "div",
        { className: "row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4" },
        ...visible.map((dog) =>
          h("div", { key: dog.id, className: "col" }, h(DogCard, { dog })),
        ),
      ),
      visible.length === 0
        ? error ? h("div", {className:"alert alert-danger",role:"alert"},error,h(Button,{className:"btn btn-outline-primary ms-2",onClick:retry},"Retry")) : h("p", null, loading ? "Loading dogs…" : "No dogs match these filters.")
        : null,
    ),
  );
}
const paymentMethods = [
  ["eft", "EFT", null],
  ["google-pay", "Google Pay", "google"],
  ["apple-pay", "Apple Pay", "apple"],
  ["payfast", "Payfast", null],
];

function PaymentDropdown({ id, validated, onChange }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const wrapper = useRef(null);
  const trigger = useRef(null);
  const selected = paymentMethods.find(([key]) => key === value);
  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (!wrapper.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  const focusOption = (index) =>
    requestAnimationFrame(() => {
      wrapper.current?.querySelectorAll('[role="option"]')[index]?.focus();
    });
  const choose = (key) => {
    setValue(key);
    setOpen(false);
    onChange();
    trigger.current?.focus();
  };
  return h(
    "div",
    {
      className: "dropdown payment-dropdown",
      ref: wrapper,
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      },
      onKeyDown: (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          trigger.current?.focus();
        }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const options = [
            ...wrapper.current.querySelectorAll('[role="option"]'),
          ];
          const current = options.indexOf(document.activeElement);
          const next =
            current < 0
              ? event.key === "ArrowDown"
                ? 0
                : paymentMethods.length - 1
              : (current +
                  (event.key === "ArrowDown" ? 1 : -1) +
                  options.length) %
                options.length;
          setOpen(true);
          focusOption(next);
        }
        if (open && (event.key === "Home" || event.key === "End")) {
          event.preventDefault();
          focusOption(event.key === "Home" ? 0 : paymentMethods.length - 1);
        }
      },
    },
    h(Button,
      {
        ref: trigger,
        id: `${id}-payment`,
        type: "button",
        className: `form-select form-select-lg text-start${validated ? (value ? " is-valid" : " is-invalid") : ""}`,
        "aria-haspopup": "listbox",
        "aria-expanded": open,
        "aria-controls": `${id}-payment-options`,
        "aria-describedby": `${id}-payment-feedback`,
        "aria-invalid": validated && !value,
        onClick: () => setOpen(!open),
      },
      selected?.[1] || "Select a payment method",
    ),
    // Keep native constraint validation and FormData without showing a second control.
    h(Select,
      {
        className: "payment-validation-control",
        name: "paymentMethod",
        tabIndex: -1,
        "aria-hidden": true,
        value,
        required: true,
        onChange: (event) => choose(event.target.value),
        onFocus: () => {
          trigger.current?.focus();
          setOpen(true);
        },
      },
      h("option", { value: "" }, "Select a payment method"),
      ...paymentMethods.map(([key, label]) =>
        h("option", { key, value: key }, label),
      ),
    ),
    h(
      "div",
      {
        id: `${id}-payment-options`,
        role: "listbox",
        "aria-label": "Payment Method",
        className: `dropdown-menu w-100${open ? " show" : ""}`,
      },
      ...paymentMethods.map(([key, label, symbol]) =>
        h(Button,
          {
            key,
            type: "button",
            role: "option",
            tabIndex: open ? 0 : -1,
            "aria-selected": key === value,
            className: `dropdown-item d-flex align-items-center justify-content-between${key === value ? " active" : ""}`,
            onClick: () => choose(key),
          },
          h("span", null, label),
          h(
            "span",
            { className: "payment-method-mark", "aria-hidden": true },
            symbol ? icon(symbol) : label,
          ),
        ),
      ),
    ),
    h(
      "div",
      {
        id: `${id}-payment-feedback`,
        className: `invalid-feedback${validated && !value ? " d-block" : ""}`,
      },
      "Select a payment method.",
    ),
  );
}

export function DonationForm() {
  const id = useId();
  const [validated, setValidated] = useState(false);
  const [complete, setComplete] = useState(false);
  const field = (label, type, autoComplete) =>
    h(
      "div",
      { key: label },
      h(
        "label",
        { className: "form-label", htmlFor: `${id}-${type}-${label}` },
        label,
      ),
      h(
        "div",
        { className: "input-group input-group-lg has-validation" },
        type !== "number"
          ? h(
              "span",
              { className: "input-group-text", "aria-hidden": true },
              icon(type === "email" ? "envelope" : "person"),
            )
          : null,
        h(Input, {
          id: `${id}-${type}-${label}`,
          name: label,
          type,
          autoComplete,
          className: "form-control form-control-lg",
          placeholder: `Enter your ${label.toLowerCase()}`,
          required: true,
          "aria-describedby": `${id}-${type}-${label}-feedback`,
          ...(type === "text" ? { pattern: ".*\\S.*" } : {}),
          ...(type === "number" ? { min: "1", step: "0.01" } : {}),
        }),
        h(
          "div",
          {
            className: "invalid-feedback",
            id: `${id}-${type}-${label}-feedback`,
          },
          type === "email"
            ? "Enter a valid email address."
            : type === "number"
              ? "Enter an amount of at least R1, with no more than two decimal places."
              : `Enter your ${label.toLowerCase()}.`,
        ),
      ),
    );
  return h(
    "form",
    {
      className: `claw-form d-flex flex-column gap-3 p-3 needs-validation${validated ? " was-validated" : ""}`,
      noValidate: true,
      onChange: () => setComplete(false),
      onSubmit: (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const valid = form.checkValidity();
        setValidated(true);
        setComplete(valid);
        if (!valid) form.querySelector(":invalid")?.focus();
      },
    },
    h(StudentProjectNotice),
    ...[
      ["Name", "text", "given-name"],
      ["Surname", "text", "family-name"],
      ["Email", "email", "email"],
    ].map(([label, type, autoComplete]) => field(label, type, autoComplete)),
    h(
      "div",
      { className: "row g-3 align-items-end" },
      h(
        "div",
        { className: "col-4" },
        field("Donation Amount", "number", "off"),
      ),
      h(
        "div",
        { className: "col-8" },
        h(
          "label",
          { className: "form-label", htmlFor: `${id}-payment` },
          "Payment Method",
        ),
        h(PaymentDropdown, {
          id,
          validated,
          onChange: () => setComplete(false),
        }),
      ),
    ),
    h(Button,
      { type: "submit", className: "btn btn-primary btn-lg mt-3" },
      "Donate Now",
    ),
    complete
      ? h(
          "p",
          { className: "mb-0", role: "status" },
          "Your details are valid. Payment processing is not connected yet; no donation has been submitted.",
        )
      : null,
  );
}
export function DogAttributes({ dog }) {
  return h(
    "div",
    { className: "dog-profile-attributes d-flex flex-column gap-3" },
    h("p", { className: "mb-0 dog-profile-facts" }, `${dog.breed} • ${dog.sex} • ${dog.age}`),
    ...[
      ["imgAttributeIcon", "Size", dog.size],
      ["imgAttributeIcon1", "Energy Level", dog.energyLevel],
      ["imgSimplification", "Good with People", dog.goodWithPeople],
      ["imgSimplification1", "Good with Other Animals", dog.goodWithAnimals],
      ["imgSimplification2", "Location", dog.location],
    ].map(([symbol, label, value]) =>
      h(
        "div",
        { key: label, className: "d-flex align-items-center gap-3" },
        h("span", {className:"dog-attribute-icon", "aria-hidden":true}, h("img",{src:`/public/assets/dogs/details/${symbol}.svg`,alt:""})),
        h("span", null, h("strong", null, `${label} `), value),
      ),
    ),
  );
}
export function AdoptionStatus({dog}) {
 const date=value=>new Date(`${value}T00:00:00`).toLocaleDateString('en-ZA',{year:'numeric',month:'long',day:'numeric'});
 const dates=[dog.sponsorshipStartedAt ? `Sponsored since ${date(dog.sponsorshipStartedAt)}` : null, dog.intakeDate ? `In care since ${date(dog.intakeDate)}` : null].filter(Boolean);
 return h('div',{className:'d-flex flex-column gap-1'},
  h('div',{className:'d-flex align-items-center flex-wrap gap-3'},h('strong',{className:'adoption-status-label'},'Virtual Adoption Status'),h(Badge,{className:`care-availability${dog.available?'':' is-unavailable'}`},dog.available?'Available':'Unavailable')),
  dates.length ? h('p',{className:'adoption-status-dates mb-0'},dates.join(' • ')) : null);
}
