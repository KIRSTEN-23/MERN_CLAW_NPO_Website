![CLAW virtual adoption campaign banner](docs/assets/Banner%205.jpg)

# CLAW Virtual Adoption — student project

A responsive implementation of the supplied UX200 CLAW design. Visitors can learn about CLAW, browse fictional dog profiles, filter available dogs, create an account and submit demonstration contribution requests. No real payments are taken and demo requests do not activate sponsorships.

## Website previews

![CLAW website on desktop and mobile](docs/assets/Mockup%201.png)

![Additional CLAW website preview](docs/assets/Mockup%202.png)

### Website screenshots

Screenshots of the deployed public websites, captured on 25 October 2026.

<details>
<summary>Azure campaign website</summary>

![Azure homepage](docs/assets/screenshots/azure-home.png)

![Dog listing and filters](docs/assets/screenshots/azure-dogs.png)

![Dog profile](docs/assets/screenshots/azure-dog-profile.png)

![Demonstration contribution form](docs/assets/screenshots/azure-contribution.png)

![Mobile homepage](docs/assets/screenshots/azure-mobile.png)

</details>

<details>
<summary>AWS assessment website</summary>

![AWS homepage](docs/assets/screenshots/aws-home.png)

</details>

<details>
<summary>Local worker app</summary>

The worker app is local-only. This screenshot uses an isolated fictional test fixture, so its metrics do not represent live activity.

![Local worker dashboard with fictional records](docs/assets/screenshots/worker-local-fixture.png)

</details>

## Live deployments

| Platform | Website |
|---|---|
| Microsoft Azure — primary campaign website | https://clawvirtualadoption.azurewebsites.net/ |
| Amazon Web Services — assessment copy | https://51.21.26.27/ |

The deployments have separate databases and accounts. Use fictional details for assessment testing. AWS uses an HTTPS IP address with a publicly trusted certificate; no custom domain is required.

## Project Structure

```text
frontend/
├── src/
│   ├── components/    # Shared controls, public features and API helpers
│   ├── pages/         # Public page compositions
│   ├── styles/        # Brand styling and accessibility adjustments
│   └── worker/        # Separate local staff interface
├── public/            # Images, icons and other public assets
└── server.js          # Local frontend server and API proxy
backend/
├── src/               # Express routes, database access and setup commands
└── test/              # Backend and deployment checks
deployment/aws/        # Docker Compose, Caddy and server setup scripts
scripts/               # Repository-level deployment validation
docs/assets/           # README mockups and screenshots
```

## Architecture

The public website and worker web app share an Express API and MySQL database. React components handle presentation and interaction, the API validates requests and enforces access rules, and the database adapter executes parameterized SQL queries.

A dog-list request follows this path:

```text
DogListing → API helper → GET /api/dogs → MySQL adapter → MySQL
           ← JSON response ←              ← query results
```

During local development, the frontend server forwards `/api` requests to the backend. In production, Express serves both the frontend and API on one origin, keeping session-cookie authentication on the same website.

The worker interface has separate entry files and role-controlled API routes. Public registration does not grant staff access. Database schema setup and fictional-data seeding remain explicit commands, separate from normal startup.

## Stylekit

The supplied UX200 [CLAW Figma design](https://www.figma.com/design/1NsI5xa1XPe75tz7dLW3ag?node-id=6138-10854) is the visual reference. Designer attribution still needs confirmation for final submission.

- **Colours and typography:** Shared brand styles are defined in `frontend/src/styles/base.css`, with contrast adjustments in `frontend/src/styles/accessibility.css`.
- **Components:** Shared buttons, badges and form controls are defined in `frontend/src/components/ui.js`; dog cards and public profile features are reused across page compositions.
- **Responsive behaviour:** Bootstrap layout utilities and targeted CSS adapt the design to smaller screens.
- **Motion:** Home-page animations and the swipeable mobile carousel support reduced-motion preferences.

Available and already-sponsored states remain distinct; permanent placements are excluded from the public dog API.

## Roadmap

- [x] Implement the responsive public campaign website.
- [x] Deploy the public website on Azure and AWS.
- [x] Build the local worker interface with role-controlled access.
- [ ] Complete manual accessibility and performance reviews across devices.
- [ ] Implement in-app availability and permanent-placement notifications.
- [ ] Assess worker deployment requirements before publishing the staff interface.

Real payment processing is outside the current assessment implementation.

## Worker web app

Open `/worker` locally for the separate staff interface. It includes dashboard metrics, animal profile/photo management, archive/restore, demonstration-request reviews and administrator-controlled staff access. Run `npm run db:worker` from `backend/` to apply the additive worker schema. To grant the first administrator, run `npm run db:worker -- existing-user@example.com admin` for an account already registered locally. Public signup never grants worker access.

Worker roles are view-only, editor and administrator. The dashboard includes recent views and requests of all review statuses. Animal viewing and editing are separate; archives are reversible. Request approval never confirms payment or activates sponsorship. For fictional local worker data, run `npm run db:seed:worker` from `backend/`; this refuses production and non-local database hosts.

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

Deploy from the repository root. Azure App Service uses `npm ci --omit=dev` and startup command `npm start`; configure production environment variables from `backend/.env.example`, the exact HTTPS `APP_ORIGIN`, verified MySQL TLS and restricted database access. Let Azure supply `PORT`. Schema setup is an explicit operator step, never automatic startup work.

AWS uses the Dockerfile and Compose configuration in `deployment/aws/`, with Caddy serving HTTPS and persistent MySQL and animal-photo volumes. Back up database and upload volumes before updating; rebuild/restart the application service without deleting volumes. To recover, deploy the last working source revision. Keep credentials in server environment files, outside Git.

After either deployment, verify `/api/health`, dog data, images and session login/logout. Uploaded photos require persistent storage (`UPLOAD_DIR`); do not overwrite production data with fictional seeds.

Both platforms run the same application source. Production startup serves only frontend entry HTML, browser modules and public assets; unknown API routes return JSON rather than frontend HTML. Database setup and seed commands are separate from startup.

## Challenges and limitations

Linux filename casing, runtime ports, same-origin cookies, restricted database access and CA verification required explicit deployment checks. Mobile wave clipping was addressed with fixed-depth decoration and a separate SVG bottom edge. AWS startup scripts must be POSIX-shell compatible because Lightsail wraps user data in its initialization script.

Hash routing is retained from the supplied implementation. Google cannot treat each fragment screen as an independently crawlable URL; the sitemap lists the homepage only. Accessibility contrast checks run with the test suite; manual accessibility and performance review remain necessary. The AWS copy is marked noindex and has Analytics disabled to keep the primary campaign reporting separate.

## Contributing

This repository is maintained as a student assessment project. To suggest a change, open an issue describing the problem or proposed improvement. For code contributions, use a separate branch, keep changes focused and run `npm test` and `npm run check:deployment` before opening a pull request.

Never include credentials, environment files or real personal data. Use a local database and fictional records for development and testing.

## License

No software licence has been declared in this repository. Public access to the source does not grant permission to reuse or redistribute it. CLAW branding, supplied designs and third-party assets remain subject to their respective owners’ permissions and licences.

## Acknowledgements

Thank you to the UX200 students for supplying the [CLAW design documentation](https://www.figma.com/design/1NsI5xa1XPe75tz7dLW3ag?node-id=6138-10854), and to the maintainers of the open-source tools used in this project.

CLAW is the subject of this assessment demonstration; the project is not an official CLAW fundraising service.

## Contact

For project questions or feedback, [open an issue on GitHub](https://github.com/KIRSTEN-23/MERN_CLAW_NPO_Website/issues).

## Final Note

This is an assessment demonstration, not an official CLAW fundraising service. The AWS single-server setup has no high availability; its database volume must be backed up before future schema changes. Keep both deployments available for assessment and review ongoing costs afterward.
