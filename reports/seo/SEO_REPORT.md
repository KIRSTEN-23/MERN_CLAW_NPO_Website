# CLAW SEO and Analytics Report

Website: https://clawvirtualadoption.azurewebsites.net/  
Assessment evidence collected: 16–17 October 2026 (South Africa time).  
Status: implementation and baseline audit; live deployment/verification outcomes are recorded below. Google Ads/AdWords is excluded from scope.

## Purpose and audience

This student project helps visitors discover CLAW dogs and understand six-month virtual sponsorship. Search intent includes “virtual dog adoption South Africa”, “sponsor a rescue dog”, and “CLAW dog sponsorship”. These are editorial target phrases, not claims of measured search volume or ranking. The contribution forms are demonstrations and do not process payments.

## Implementation and page metadata

The site retains browser-based React, Bootstrap CDNs, Express, MySQL and hash routing. Initial HTML includes a descriptive title, description, language en-ZA, viewport, keywords, Open Graph metadata, social image and favicon. Express injects the final-origin canonical URL, og:url, absolute social-image URL and Search Console verification meta tag. Runtime metadata updates distinguish Home, Our Dogs, Dog Profile, How Virtual Adoption Works, Terms, Sign Up, Login and Contribution Demo. Login, signup and contribution hash screens set noindex on the client.

Keywords are included for the assessment requirement; Google does not use the keywords meta tag as a ranking signal. Route metadata helps browser navigation but social crawlers may only read the initial homepage HTML. A Lighthouse SEO score does not prove indexing or ranking.

## HTML, accessibility and crawlability

The source uses main, navigation, sections, headings, real links, labelled form controls and descriptive image alternatives. Decorative images use empty alternatives. Baseline automated homepage accessibility scored 100; this is not an all-pages WCAG certification or a replacement for keyboard/screen-reader review. The baseline reports include outstanding unsized-image diagnostics. Existing loading/error UI and lazy images are retained.

Hash routes (for example /#/dogs and /#/dogs/details?dog=bella) identify browser state, not separate documents Google should be expected to index. `/sitemap.xml` therefore lists only the homepage. It does not invent database URLs that would return 404. `/robots.txt` advertises the sitemap and excludes /api/. API access is still controlled by application security, not robots.txt. A future move to real path URLs with matching server handling/rendered metadata is needed for independently indexable dog profiles. That architectural change was not made here because the project requires preserving hash routing.

## GA4 measurement plan

Property observed: account 370129084 / property 507144088; stream CLAW_virtual adoption; final HTTPS website URL. Public Measurement ID: G-GV1EHLBMZV. The identifier is stored in Azure environment configuration (`GA_MEASUREMENT_ID`), not repeated through components. `/api/public-config` exposes only this public identifier. Local/staging environments can leave it empty. Database credentials are never returned.

Optional Analytics requires consent. Before consent, the implementation loads no Google tag. Visitors can decline or revisit Analytics preferences. Advertising storage, advertising user data, ad personalization and Google signals are disabled. URLs sent by our page-view code contain an allowlisted route only, excluding arbitrary queries, dog IDs and contact information. Automatic Enhanced measurement was switched OFF in the stream to avoid double page views and automatic form capture.

| Event | Trigger | Meaning |
|---|---|---|
| page_view | Initial allowed route or a different hash-route path after opt-in | Screen interest; repeated StrictMode effects/section links do not double-count |
| sign_up | Registration API confirms success | Account created using email; no name/email/password parameters |
| demo_contribution_request | API confirms a pending demonstration request was saved | Demo engagement, not revenue, payment or completed sponsorship |

This site sends no purchase event and takes no payments. sign_up is configured as a nonmonetary key event; demo_contribution_request remains an ordinary engagement event. Automated tests verify consent gating, duplicate prevention and event allowlisting. GA Realtime receipt was verified after a real consented test visit: page_view (2), first_visit (1) and session_start (1) were visible. This verifies collection, not organic audience growth. The user completed a registration; its hostname and Analytics success-event receipt are not yet confirmed. No fictitious traffic or conversions were inserted to manufacture report findings.

## Search Console

A URL-prefix property for the exact HTTPS origin was added using the signed-in school Google account. An HTML verification token was obtained and configured through `GOOGLE_SITE_VERIFICATION`. Ownership verification succeeded on the deployed HTML. Keep the token in place thereafter. The sitemap was submitted successfully and its status is Success. URL Inspection reported “URL is on Google” / “Page is indexed”; the live test reported “URL is available to Google”. A refresh indexing request was accepted and the URL was added to the priority crawl queue. Submission/requesting indexing is not a promise Google will index it. Hash screens cannot honestly be reported as three separately inspected/indexed pages. On 17 October 2026 the property was successfully linked to CLAW_virtual adoption (stream ID 16145209872). Search Console reporting collection publication is tracked separately below.

## Performance evidence

Google’s unauthenticated PageSpeed API returned HTTP 429 quota exhaustion; the raw response is saved in evidence/pagespeed-mobile.json. Official Lighthouse CLI was used instead, against the actual public website, using headless Chrome with simulated mobile and desktop defaults. No frontend build tools or dependencies were introduced.

| Run | Performance | Accessibility | Best practices | SEO | LCP |
|---|---:|---:|---:|---:|---|
| Mobile baseline | 59 | 100 | 96 | 100 | 51.2 s |
| Desktop baseline | 68 | 100 | 96 | 100 | 7.3 s |

These are single-run lab results, not Chrome UX Report field data. Scores depend on the network, CPU simulation and Free App Service startup/quota state. Mobile baseline transferred roughly 11,974 KiB and reported zero layout shift. Large hero PNGs dominated network cost. The browser-console issue in the desktop baseline was a missing favicon; an explicit SVG favicon link was added.

Six homepage PNG assets were converted to WebP at quality 85, retaining dimensions and alpha transparency. Combined originals: 11,558,616 bytes; WebP replacements: 788,354 bytes (approximately 93% smaller). Original source assets remain available. Homepage code/CSS use the new files. The hero silhouette mask remains its original SVG/PNG geometry. Post-deployment measurements are recorded below. Avoid comparing before/after runs if either receives a quota error page.

## Evidence and validation

- evidence/mobile.report.html and .json: mobile baseline audit, diagnostics and screenshot.
- evidence/desktop.report.html and .json: desktop baseline audit, diagnostics and screenshot.
- evidence/pagespeed-mobile.json: API quota failure, not a performance result.
- Backend suite: 12 passed, 1 skipped (dedicated MySQL integration database not configured); no production database used for tests.
- Deployment casing/import/asset checks passed.
- New SEO endpoint tests confirm canonical/verification output, sitemap without fragments, allowlisted public configuration and private-file protection.

## Remaining evidence and limitations

The release is deployed. Initial DNS failures were resolved by retrying; Express was restarted to load the new server routes. Live checks returned HTTP 200 for health, allowlisted public configuration, initial HTML metadata, robots.txt and sitemap.xml. The MySQL readiness check remained healthy. See evidence/live-checks.json.

GA4–Search Console linking is confirmed. The Search Console collection is confirmed Published to all in the report Library. sign_up key-event configuration is confirmed; live receipt remains pending. The user was asked to complete a live test registration privately because the assistant must not create or enter account passwords. No production accounts or contributions were fabricated. Raw collect-request inspection and DebugView parameter inspection have not been captured; Realtime receipt is confirmed instead. The reported hash routing limitation remains.

Collect genuine data for at least several days before analysing users, traffic sources, screen engagement, sign-ups and demo requests. Standard reports can lag; Search Console queries may remain empty for a new low-traffic site. Report “insufficient data” when applicable. Filter known development/test traffic only after identifying the correct IP and checking the rule in test mode; no unknown IP filter was activated. Do not invent a top-five query list or count consent-declining visitors as tracked users.

## Official references

- [GA4 SPA measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications)
- [Page-view collection and duplicate prevention](https://developers.google.com/analytics/devguides/collection/ga4/views)
- [Search Console verification](https://support.google.com/webmasters/answer/9008080)
- [Google JavaScript SEO and fragment limitations](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

## Live completion log

- Deployed and restarted successfully; public configuration contains the correct G-GV1EHLBMZV identifier.
- Search Console ownership verified using the initial-HTML meta tag.
- Sitemap accepted with Success; homepage reported indexed and available in the live test; indexing refresh requested successfully.
- Consented test navigation generated real GA4 page_view/first_visit/session_start receipts.
- A post-deployment consent-button contrast failure was corrected (blue primary → dark button); the focused final accessibility audit scored 100. This changes only the new consent control, not the existing website button theme.
- No Google Ads/AdWords setup, paid upgrades, GitHub pushes or database migrations were performed.

## Before/after lab comparison

| Run | Performance | Accessibility | Best practices | SEO | LCP |
|---|---:|---:|---:|---:|---|
| Mobile baseline | 59 | 100 | 96 | 100 | 51.2 s |
| Mobile after WebP (before consent contrast correction) | 59 | 96 | 100 | 100 | 9.6 s |
| Desktop baseline | 68 | 100 | 96 | 100 | 7.3 s |
| Desktop after WebP (before consent contrast correction) | 89 | 96 | 100 | 100 | 1.8 s |
| Focused final accessibility check | — | 100 | — | — | — |

The mobile score did not improve even though LCP and transfer size improved. Remaining render-blocking/CDN, font, unused-code and animation-related timing diagnostics should be prioritised in a future performance pass. Do not claim a score of 100 performance or field Core Web Vitals compliance. The focused accessibility run verifies the contrast correction and does not replace the full performance runs. Post-change HTML and JSON audits are saved as evidence/mobile-after.report.*, evidence/desktop-after.report.* and evidence/accessibility-final.report.*. Each full Lighthouse HTML report includes a screenshot of the actual audited page.

Additional official guidance: [supported meta tags, including the ignored keywords tag](https://developers.google.com/search/docs/crawling-indexing/special-tags), [marking key events](https://support.google.com/analytics/answer/13128484).

## Additional page checks

Rendered-route Lighthouse audits also checked Our Dogs and Terms & Conditions. Our Dogs scored SEO 100 and accessibility 94; Terms scored SEO 100 and accessibility 96. The dog listing has low-contrast fact values and mobile Filter Dogs text, plus a heading-level skip between the banner and card names. The Terms last-updated text has insufficient contrast. These existing design choices were retained rather than silently changing previously approved styling. Evidence: evidence/dogs.report.* and evidence/terms.report.*. These scores are automated checks, not a complete accessibility certification.

The user confirmed completing a test registration on 17 October. The foreground website tab was subsequently observed on the older claw-web-kv-2026 hostname, so this does not establish receipt of sign_up from the new release. Verify a consented registration specifically on https://clawvirtualadoption.azurewebsites.net/ before reporting that event as validated.

## 17 October continuation

- Search Console linking completed successfully for the final HTTPS origin and the CLAW stream (16145209872).
- `sign_up` is now marked as a key event using the existing coded event, once per event, with no default monetary value. The key-event list currently reports “No stream data detected”; configuration must not be confused with verified event receipt.
- The existing property also contains a CERT SA stream. For CLAW-specific reporting, use the CLAW stream filter; property-wide totals can otherwise mix projects. No unrelated stream or existing key-event settings were changed.

- Search Console report collection was verified in Library as **Published to all**, with Queries and Google organic search traffic available in the report navigation. No publication change was required. [Google integration and reporting guidance](https://support.google.com/analytics/answer/10737381).
