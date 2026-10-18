// Production-only frontend serving with an explicit path allowlist. Repository files and API misses must never become frontend responses.
import express from "express";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Resolve from this module, never the startup working directory.
const frontend = fileURLToPath(new URL("../../frontend/", import.meta.url));
export function serveFrontend(app, env = process.env) {
  const origin = new URL(env.APP_ORIGIN || "http://localhost:5173").origin;
  const escape = value => value.replaceAll("&", "&amp;").replaceAll("\"", "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  // Only these public settings are exposed; never serialize process.env.
  app.get("/api/public-config", (_req, res) => res.set("Cache-Control", "no-store").json({
    gaMeasurementId: /^G-[A-Z0-9]+$/.test(env.GA_MEASUREMENT_ID || "") ? env.GA_MEASUREMENT_ID : "",
  }));
  app.get("/robots.txt", (_req, res) => res.type("text").send(`User-agent: *\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`));
  // Fragment routes are not separate crawlable pages. Do not publish misleading hash URLs.
  app.get("/sitemap.xml", (_req, res) => res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(origin)}/</loc></url></urlset>`));
  const options = {
    dotfiles: "deny",
    index: false,
    redirect: false,
    fallthrough: true,
  };
  // Only the entry HTML is mapped to the root. Hash routing happens entirely in the browser.
  app.get(["/", "/index.html"], async (_req, res) => {
    let html = await readFile(`${frontend}index.html`, "utf8");
    const verification = /^[A-Za-z0-9_-]+$/.test(env.GOOGLE_SITE_VERIFICATION || "")
      ? `<meta name="google-site-verification" content="${env.GOOGLE_SITE_VERIFICATION}">` : "";
    html = html.replace('<!-- runtime-seo -->', `<link rel="canonical" href="${escape(origin)}/"><meta property="og:url" content="${escape(origin)}/">${verification}`)
      .replace('content="/public/assets/home/hero-photo.png"', `content="${escape(origin)}/public/assets/home/hero-photo.png"`);
    res.set("Cache-Control", "no-cache").type("html").send(html);
  });
  app.use(
    "/src",
    (req, res, next) => {
      // Restrict source serving to browser JavaScript and styles rather than exposing arbitrary project files.
      if (!/\.(js|css)$/.test(req.path)) return res.sendStatus(404);
      next();
    },
    express.static(`${frontend}src`, options),
  );
  app.use("/public", express.static(`${frontend}public`, options));
  // Unknown non-API paths remain actual 404 responses rather than returning unrelated HTML.
  app.use((_req, res) => res.status(404).type("text").send("Not found"));
}
