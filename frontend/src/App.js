import React, { useEffect, useState } from "react";
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
  useEffect(() => updateSeo(route), [route]);
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
  return React.createElement(pages[route.path] || Home, route);
}
