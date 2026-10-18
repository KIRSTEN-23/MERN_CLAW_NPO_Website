# CLAW on Azure

## Architecture and deployment root

Use **one Linux App Service (Node.js)** for Express and the existing CDN-based React/Bootstrap frontend, plus **Azure Database for MySQL Flexible Server**. Browser requests remain relative `/api` requests on the same origin; no CORS/API-host change is needed. Hash routes such as `/#/dogs` stay unchanged. Production serves only `frontend/index.html`, `/src/` and `/public/`; repository/backend files are not HTTP-accessible. Local development still uses two servers.

Deploy the **repository root**, containing root `package.json`, `package-lock.json`, `backend/` and `frontend/`—not either subfolder by itself. App Service startup command: **`npm start`**. Select a currently supported Node LTS runtime meeting Node **22.10+**; Node 24 LTS is a suitable choice if available for the selected service. Confirm with `az webapp list-runtimes --os linux`. Root dependencies include Express and mysql2; no frontend installation or compilation is required.

Enable **`SCM_DO_BUILD_DURING_DEPLOYMENT=true`** so App Service installs the root npm dependencies during deployment. For a deterministic local/CI clean install use `npm ci --omit=dev`; do not upload `node_modules`. Do not configure `WEBSITE_RUN_FROM_PACKAGE` for this source/build-on-deploy workflow. Microsoft documents [Node startup/build automation](https://learn.microsoft.com/en-us/azure/app-service/configure-language-nodejs) and [deployment-root/build requirements](https://learn.microsoft.com/en-us/azure/app-service/deploy-zip).

## 1. Check account, cost, region and database network

Before creating anything, confirm the subscription's eligibility, credit balance, provider registration, quotas and available SKUs. Student-account eligibility differs from ordinary free-account offers. Check [Azure education eligibility](https://learn.microsoft.com/en-us/azure/education-hub/faq), [Linux App Service pricing](https://azure.microsoft.com/en-us/pricing/details/app-service/linux/) and [MySQL pricing](https://azure.microsoft.com/en-us/pricing/details/mysql/). Neither free hosting nor a free MySQL tier is promised. Include compute, storage, backups and networking in the estimate.

Choose a region where **both** services and the needed SKUs are actually available to this subscription. Prefer proximity and a shared region where practical. West Europe was the presentation's workaround, not a requirement or a guarantee. If creation fails for region/capacity/eligibility, resolve that condition before retrying rather than changing application code.

Create MySQL Flexible Server with secure transport enforced. Prefer private connectivity with App Service VNet integration and working private DNS when the plan supports it. Alternatively allow only the app's outbound IP set and a temporary setup-machine IP through the MySQL firewall; review rules after scaling/plan changes. Avoid broad “all Azure services” and all-internet access. Use the server's `<server>.mysql.database.azure.com` FQDN. See [MySQL networking](https://learn.microsoft.com/en-us/azure/mysql/flexible-server/concepts-networking) and [App Service private connectivity](https://learn.microsoft.com/en-us/azure/mysql/flexible-server/tutorial-webapp-server-vnet).

Create database `claw` (utf8mb4). Use an administrative/setup identity for schema creation and a separate restricted application user for runtime queries (SELECT/INSERT/UPDATE/DELETE on `claw.*`). The application never creates the database itself.

## 2. Configure TLS and explicitly set up schema/data

Production requires verified TLS (`MYSQL_SSL=true`); disabling it is rejected. The driver verifies the root chain **and hostname**, with TLS 1.2 minimum. Node's maintained CA store is used by default. Keep the Node runtime patched. For an explicitly managed trust store, set `MYSQL_SSL_CA` to a PEM root-CA bundle: absolute path or relative to `backend/`, independent of working directory. It must be readable at runtime and on the machine running setup. Public CA certificates are not secrets, but do not include private keys.

Microsoft's current global guidance identifies **DigiCert Global Root G2** and **Microsoft RSA Root Certificate Authority 2017**; its rotation guidance includes legacy DigiCert Global Root CA during transition/affected regions. Download roots only through the official guidance, combine the applicable PEM roots if using a custom bundle, and recheck before deployment. Do not pin intermediate/server certificates or disable certificate verification. See [current TLS guidance](https://learn.microsoft.com/en-us/azure/mysql/security/security-tls) and [root rotation instructions](https://learn.microsoft.com/en-us/azure/mysql/security/security-tls-root-certificate-rotation).

From an approved network location, install root dependencies and export the target database settings securely. Then run from the repository root:

```sh
npm ci --omit=dev
npm run db:schema
# Optional: only for this project's fictional demo dataset
npm run db:seed
```

`db:schema` only creates missing tables. `db:seed` inserts missing fictional records without overwriting existing dogs. `db:setup` explicitly does both for convenience. Normal startup does neither. Back up and plan any real-data import separately; these commands are not a real-data migration system. Never point test commands at the production database.

## 3. Application deployment settings

Set secrets in App Service Environment variables (or Key Vault references), not files/source/browser code. `backend/.env.example` contains placeholders.

| Setting | Production value |
|---|---|
| `NODE_ENV` | `production` (enables single-server frontend hosting and Secure cookies) |
| `APP_ORIGIN` | Exact HTTPS origin, e.g. `https://<app-name>.azurewebsites.net`; no slash/path |
| `MYSQL_HOST` | Flexible Server FQDN |
| `MYSQL_PORT` | `3306`, unless deliberately configured otherwise |
| `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` | Database name and restricted runtime credentials |
| `MYSQL_SSL` | `true` |
| `MYSQL_SSL_CA` | Empty/unset for Node roots; optional verified PEM root bundle path |
| `TRUST_PROXY_HOPS` | `1` only for direct App Service ingress; otherwise keep `0` until topology is reviewed |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |

**Do not set `PORT`: Azure supplies it.** Server binds `0.0.0.0`, with local fallback 5001. Enable App Service **HTTPS Only**. Keep `APP_ORIGIN` aligned with the domain actually used by the browser (including any custom domain). With direct ingress, proxy trust accepts only the immediate hop, never an arbitrary chain; do not reuse this setting blindly behind Front Door/additional gateways. Cookies are HttpOnly, SameSite=Lax, `/api` scoped and Secure in production. Session data remains in MySQL; authentication throttling remains per-process.

When ready, deploy from the root using VS Code's App Service extension with server-side build enabled, or a reviewed CI workflow. `.vscode/settings.json` excludes environment files, installed modules, Git internals and macOS metadata from extension-created deployment packages. Other tooling must apply equivalent exclusions; `.gitignore` alone does not filter arbitrary uploads. Keep root package files, backend source/SQL and frontend entry/source/assets together. No ZIP is generated by this preparation. A GitHub outage can be handled by waiting or using the approved local deployment path; do not alter the stack.

## 4. Verification and recovery

- Check build/deployment logs for successful dependency installation, then App Service Log stream for `CLAW server listening on port …`. Startup failures log a code and configuration/network/TLS/schema hints, not credentials. Do not dump environment settings into logs.
- Request `https://<host>/api/health`: expect 200 JSON with database `mysql`. This performs a database query. Missing schema stops startup; a later database outage makes health fail with JSON.
- Check `/api/dogs`, a listed dog's `/api/dogs/<id>`, `/`, `/src/main.js`, `/src/styles/base.css`, `/public/assets/shared/logo.svg` and the dog images. Check `/#/dogs` and details in a browser, including console/network failures. CDN access is still required for React, Bootstrap, fonts and motion.
- Confirm `/api/missing` returns JSON 404; `/.env`, `/backend/src/app.js`, `/package.json` and nonexistent assets return 404, not entry HTML. Hash routing needs no pathname fallback.
- In the deployed HTTPS browser, register a test account, log in, reload, call `/api/auth/me`, then log out. Inspect cookie flags without sharing the token. Verify a foreign Origin is rejected for write requests. Contribution forms still only save pending demonstration requests; no payments are implemented.
- On failure inspect deployment logs, runtime selection, package root, environment settings, DNS/firewall/TLS and exact-case filenames. Correct the cause and redeploy the same reviewed release; do not reseed or reset the database to repair a deployment.
- Preserve the previous working commit/release. Redeploy that release to roll back code while preserving database data/settings. If the chosen paid plan supports slots, verify a staging release first and swap back to the previous production slot when needed. Configure slot-specific origins/database settings carefully; a code rollback does not undo database changes. See [deployment practices](https://learn.microsoft.com/en-us/azure/app-service/deploy-best-practices).

## Local commands and checks

Local setup remains separate (copy placeholders to ignored `backend/.env`, fill in local values):

```sh
cd backend
npm ci
npm run db:setup
npm run dev
```

In a second terminal, from the repository root: `npm --prefix frontend run dev`. No frontend dependency installation is needed. Use `http://localhost:5173` with `APP_ORIGIN=http://localhost:5173`; local MySQL can use `MYSQL_SSL=false` and `TRUST_PROXY_HOPS=0`.

From the root run `npm test` and `npm run check:deployment`. API tests use mock repositories. The optional real-MySQL suite is skipped unless `MYSQL_INTEGRATION=1` is explicitly set and `MYSQL_DATABASE` ends in `_test`; configure only a dedicated disposable test database. Production startup/static serving is tested without MySQL credentials or Azure resources. Live Azure network/TLS, account/region availability and browser authentication must still be verified after authorized setup and deployment.

## Analytics and indexing configuration

Set `GA_MEASUREMENT_ID` to the public GA4 web-stream ID (G-...). Only this allowlisted public ID is returned by `/api/public-config`; no credentials are exposed. Leave it empty in development/staging. Set `GOOGLE_SITE_VERIFICATION` to Search Console’s HTML-tag token; Express includes it in the initial homepage HTML. Set `APP_ORIGIN` to the deployed origin so canonical/social URLs, robots.txt and sitemap.xml match it.

Analytics loads only after opt-in. Turn off Enhanced measurement for this stream: explicit hash-route page views and successful `sign_up` / `demo_contribution_request` events are used instead. The latter is a student-demo event, never a purchase or confirmed payment. Do not add a second tag or automatic page-view hook. Keep the verification token in Azure after ownership succeeds.

The sitemap lists the homepage only because the current hash routes are not separately indexable URLs. Do not add fragment URLs or invent database-detail pathnames. See `reports/seo/SEO_REPORT.md` for measured evidence and remaining external steps.
