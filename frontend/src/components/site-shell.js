// Shared header and footer. The header responds to scroll position and page route to choose its visual state.
import React, { useEffect, useState } from "react";
import { Navigation } from "./public.js";
const h = React.createElement;
export function Header() {
  const [scrolled, setScrolled] = useState(() => window.scrollY > 0);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const transparent = !scrolled;
  return h(
    "header",
    {
      className: `home-navigation fixed-top${transparent ? " is-transparent" : " is-solid"}`,
      "data-layout": "navigation-parent",
    },
    h(Navigation, { transparent }),
  );
}
export function Footer() {
  const links = [
    ["Home", "#/"],
    ["About Us", "#/?section=about"],
    ["Our Dogs", "#/dogs"],
    ["Donate", "#/donate"],
    ["Contact Us", "#/?section=footer-container"],
  ];
  return h(
    "footer",
    {
      className: "surface-500",
      id: "footer-container",
      "data-layout": "footer-container",
    },
    h(
      "div",
      { className: "container-fluid layout-width px-3 px-lg-5 py-4 py-lg-5" },
      h(
        "div",
        { className: "row g-4 align-items-stretch", "data-layout": "footer-columns" },
        h(
          "div",
          { className: "col-12 col-lg-6 d-flex flex-column gap-3 footer-brand-group" },
          h(
            "div",
            {
              className:
                "surface-300 d-flex align-items-center gap-3 flex-wrap",
              "data-layout": "brand-assets-parent",
            },
            h(
              "a",
              { href: "#/", "aria-label": "CLAW home" },
              h("img", {
                src: "/public/assets/shared/logo.svg",
                height: 50,
                className: "footer-logo",
                alt: "CLAW",
              }),
            ),
            h("img", {
              src: "/public/assets/home/ifaw-logo.png",
              height: 50,
              alt: "International Fund for Animal Welfare",
              className: "footer-logo",
            }),
          ),
          h(
            "p",
            { className: "page-copy footer-copy footer-brand-copy surface-400" },
            "CLAW is a Community Led Animal Welfare project of the International Fund for Animal Welfare. We rescue, rehabilitate and rehome animals in need.",
          ),
          h(
            "p",
            { className: "page-copy footer-copy fw-semibold" },
            "Thank you for supporting our mission!",
          ),
          h("div", { className: "footer-brand-bottom mt-auto d-flex flex-column gap-3" },
            h("nav", { className: "d-flex gap-2 footer-socials", "aria-label": "CLAW social media" },
              ...[["Facebook", "https://www.facebook.com/228935760482787", "facebook"],
                ["Instagram", "https://www.instagram.com/claw.jhb/", "instagram"]].map(([label, href, symbol]) =>
                h("a", { key: label, href, target: "_blank", rel: "noopener noreferrer", "aria-label": `CLAW on ${label}`, className: "footer-social-link" },
                  h("i", { className: `bi bi-${symbol}`, "aria-hidden": true }))))),
        ),
        h(
          "div",
          { className: "col-12 col-lg-3 d-flex flex-column gap-3 footer-links-group" },
          h("h2", { className: "page-copy footer-heading h5" }, "Links"),
          h(
            "nav",
            {
              className: "d-flex flex-column gap-3 flex-grow-1 justify-content-lg-between",
              "aria-label": "Footer navigation",
            },
            ...links.map(([label, href]) =>
              h("a", { key: label, href }, label),
            ),
          ),
        ),
        h(
          "div",
          { className: "col-12 col-lg-3 d-flex flex-column gap-3" },
          h("h2", { className: "page-copy footer-heading h5" }, "Contact Us"),
          h(
            "p",
            { className: "page-copy footer-copy" },
            "Un-named Rd, Durban Deep, Roodepoort 237-Iq, Johannesburg, 1724",
          ),
          h(
            "a",
            {
              href: "mailto:CLAWsouthafrica@gmail.com",
              className: "footer-copy",
            },
            "CLAWsouthafrica@gmail.com",
          ),
        ),
      ),
    ),
    h("div", { className: "container-fluid layout-width px-3 px-lg-5 pb-4" },
      h("div", { className: "footer-bottom border-top pt-4" },
        h("a", { href: "#/terms", className: "footer-terms" }, "Terms & Conditions"),
        h("p", { className: "page-copy footer-copy footer-copyright" }, "©2005 CLAW. All rights reserved."),
        h("p", { className: "page-copy footer-copy footer-registration" }, "NPO registration: 007-416"))),
  );
}
