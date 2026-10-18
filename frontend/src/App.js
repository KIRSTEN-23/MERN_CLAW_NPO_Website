// Hash-based page routing, page metadata and section scrolling. Routes stay in the browser and need no server-side SPA fallback.
import React, { useEffect, useState } from "react";
import { AnalyticsConsent, trackPage } from './components/analytics.js';
import { updateSeo } from './components/seo.js';
import { AuthPage } from "./components/auth-form.js";
import {
  Home,
  Donation,
  Dogs,
  DogDetails,
  VirtualAdoption,
  Terms,
} from "./pages/layouts.js";

// Query parameters inside the hash select a dog, contribution mode or home section.
const readLocation = () => {
  const [path, query = ""] = (location.hash.slice(1) || "/").split("?");
  const params = new URLSearchParams(query);
  return { path, section: params.get("section"), mode: params.get("mode"), dogId: params.get("dog") };
};

const pages = {
  "/signup": AuthPage,
  "/login": AuthPage,
  "/": Home,
  "/dogs": Dogs,
  "/donate": Donation,
  "/dogs/details": DogDetails,
  "/virtual-adoption": VirtualAdoption,
  "/terms": Terms,
};

export default function App() {
  const [route, setRoute] = useState(readLocation);
  useEffect(() => { updateSeo(route); trackPage(route); }, [route]);
  useEffect(() => {
    const update = () => setRoute(readLocation());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    if (route.section) {
      const target =
        document.getElementById(route.section) ||
        document.querySelector(`[data-layout="${CSS.escape(route.section)}"]`);
      target?.scrollIntoView({ behavior: "smooth" });
    } else window.scrollTo(0, 0);
  }, [route]);
  return React.createElement(React.Fragment, null, React.createElement(pages[route.path] || Home, route), React.createElement(AnalyticsConsent));
}
