# CLAW Virtual Adoption — student project

A responsive implementation of the supplied UX200 CLAW design. Visitors can learn about CLAW, browse fictional dog profiles, filter available dogs, create an account and submit demonstration contribution requests. No real payments are taken and demo requests do not activate sponsorships.

## Live deployments

| Platform | Website |
|---|---|
| Microsoft Azure — primary campaign website | https://clawvirtualadoption.azurewebsites.net/ |
| Amazon Web Services — assessment copy | https://51.21.26.27/ |

The deployments have separate databases and accounts. Use fictional details for assessment testing. AWS uses an HTTPS IP address with a publicly trusted certificate; no custom domain is required. Deployment verification is recorded in [DEPLOYMENT_AWS.md](DEPLOYMENT_AWS.md).

## Design reference and implementation

Based on the supplied UX200 CLAW Figma design, with source-node references retained in the page compositions. The design source/designer credit and shareable Figma link still need to be supplied for final submission. The current implementation covers the public website; the worker application is not implemented yet.

Shared components provide navigation, dog cards, badges, buttons and form controls. Home-page animations and a swipeable mobile carousel support reduced-motion preferences. Available and already-sponsored states are distinct; permanent placements are excluded from the public dog API.

## Technologies

- React loaded as browser ES modules through CDNs; Bootstrap and Bootstrap Icons.
- Node.js and Express, serving the same-origin frontend and `/api` in production.
- MySQL through mysql2, with parameterized queries and verified TLS.
- Cookie sessions: hashed tokens in MySQL; HttpOnly, SameSite=Lax and production Secure cookies.
- Optional consent-based Google Analytics, page metadata, robots.txt and a homepage sitemap.
- Azure App Service / Azure Database for MySQL; AWS Lightsail with Docker Compose and Caddy.

## Run locally

Use Node.js 22.10+ and a local MySQL service. Install backend dependencies from the repository root:

```sh
npm ci
cp backend/.env.example backend/.env
```

Fill in your own local database credentials. Never commit `.env`. Create the local database and run the explicit schema/fictional-data setup described in [backend/README.md](backend/README.md). Do not point setup commands at an existing production database.

For this machine, ports 5001 and 5173 may already be occupied by another project. In separate terminals:

```sh
cd backend
PORT=5002 npm run dev
```

```sh
cd frontend
PORT=5174 API_URL=http://127.0.0.1:5002 npm run dev
```

Set `APP_ORIGIN=http://localhost:5174` in the local backend environment when using that frontend port, so registration and other writes pass the origin check. Open http://localhost:5174 and check http://localhost:5002/api/health. The frontend needs no npm package installation or build pipeline.

## Validation and deployment

```sh
npm test
npm run check:deployment
```

Tests use test adapters; the dedicated real-MySQL integration case skips unless explicitly configured. No production database should be used for tests.

- [Azure setup, deployment and recovery](DEPLOYMENT_AZURE.md)
- [AWS setup, deployment and recovery](DEPLOYMENT_AWS.md)
- [SEO and performance evidence](reports/seo/SEO_REPORT.md)

Both platforms run the same application source. Production startup serves only frontend entry HTML, browser modules and public assets; unknown API routes return JSON rather than frontend HTML. Database setup and seed commands are separate from startup.

## Challenges and limitations

Linux filename casing, runtime ports, same-origin cookies, restricted database access and CA verification required explicit deployment checks. Mobile wave clipping was addressed with fixed-depth decoration and a separate SVG bottom edge. AWS startup scripts must be POSIX-shell compatible because Lightsail wraps user data in its initialization script.

Hash routing is retained from the supplied implementation. Google cannot treat each fragment screen as an independently crawlable URL; the sitemap lists the homepage only. The SEO report records accessibility findings and remaining performance work. The AWS copy is marked noindex and has Analytics disabled to keep the primary campaign reporting separate.

This is an assessment demonstration, not an official CLAW fundraising service. The AWS single-server setup has no high availability; its database volume must be backed up before future schema changes. Keep both deployments available for assessment and review ongoing costs afterward.
