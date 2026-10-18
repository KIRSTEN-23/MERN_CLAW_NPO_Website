# AWS assessment deployment

This is the second hosting platform for the same CLAW website. Azure remains the primary campaign deployment. The AWS copy preserves browser React and Bootstrap CDNs, the existing hash routes, Express, and MySQL through mysql2. No frontend build pipeline is introduced.

## Approved resources and cost

- Project: Building Things; CLI profile `claw-student`; selected Region `eu-north-1`.
- Lightsail instance: `clawvirtualadoption-aws`, Ubuntu 24.04, `small_3_0`: 2 GB RAM, 60 GB disk, US$12/month base price observed through the Lightsail API on 18 October 2026.
- Static IP: `claw-aws-ip`, attached to the instance. An attached Lightsail static IP has no separate charge; unattached addresses can incur charges. Excess transfer, snapshots and other additions can cost extra.
- Console showed Free plan, US$100 credits remaining and 18 April 2027 expiry during setup. These values change with usage. No paid-plan upgrade is authorized or performed. Check AWS Settings > Billing for current credit/spend status.
- Keep this assessment deployment through marking, then explicitly review whether to delete it. Stopping a Lightsail instance does not eliminate its instance charges.

## Architecture and security

Docker Compose runs three services: MySQL 8.4, the existing Express server on Node 24, and Caddy for HTTPS. Only Caddy publishes web ports. MySQL and Express ports are private to the Compose network. SSH is restricted to the deployer's IP; update that rule deliberately if the network changes.

HTTPS uses the instance's attached static IP and a publicly trusted, short-lived Let's Encrypt IP certificate. Caddy renews it automatically. Do not switch to Caddy's internal CA or bypass browser certificate warnings. A purchased domain is optional, not part of this deployment.

MySQL uses a private CA and a server certificate whose DNS identity is `mysql`. The application verifies the chain and hostname using `MYSQL_SSL_CA`; certificate checks remain enabled. Server keys, CA key and passwords stay on the server, outside the uploaded source.

The public AWS copy uses a new database and fictional dog seeds. Azure users, sessions and contribution data are not copied. AWS and Azure accounts are independent. Analytics is disabled on the AWS assessment copy, and the proxy sends `X-Robots-Tag: noindex, nofollow` to avoid a competing indexed campaign copy.

## Initial deployment

1. Create the approved server with `deployment/aws/cloud-init.sh` as user data. Register a deployment key and attach the static IP.
2. Obtain SSH host keys through Lightsail's authenticated API and verify them rather than blindly accepting an unknown host key.
3. Create an archive from an explicit allowlist: root package files, backend/src, backend/sql, frontend/index.html, frontend/src, frontend/public and deployment/aws. Exclude `.env`, Git history, node_modules, reports and private keys.
4. Upload and extract application source under `/opt/claw/app`. Copy compose.yaml, Caddyfile, initialize.sh and configure-host.sh from deployment/aws into `/opt/claw`.
5. Run `sudo bash /opt/claw/configure-host.sh STATIC_IP`. This generates passwords and certificates only if absent, builds the application, then explicitly invokes initial schema/seed setup. It never imports Azure credentials.
6. `initialize.sh` refuses repeat initialization once `.initialized` exists. Normal `docker compose up -d` does not run schema or seed commands. Runtime MySQL privileges are limited to SELECT, INSERT, UPDATE and DELETE in the claw database.

## Live verification — 18 October 2026

AWS URL: https://51.21.26.27/

Verified public certificate validation, HTTP-to-HTTPS redirect, MySQL readiness, fictional dog data, HTML/modules/WebP assets, JSON API 404s, blocked environment/package files, foreign-origin rejection, and HttpOnly/Secure/SameSite cookie flags on logout. Backend tests: 12 passed; one dedicated-MySQL integration suite skipped because its test database was not configured. Full browser registration/login and responsive interaction checks remain manual. Azure was not modified.

Deployment SSH key is stored locally at `~/.ssh/claw-aws-deploy`, with verified host keys at `~/.ssh/claw-aws-known-hosts`; neither belongs in Git.

## Verify

- Open the HTTPS URL and `/api/health`; readiness must report MySQL healthy.
- `/api/dogs` must return fictional profiles; check listing filters, details, images and the mobile menu/carousel.
- A missing `/api/...` must remain a JSON 404, while private files such as `/.env` must be inaccessible.
- Register/log in using the browser. Check that the `claw_session` cookie remains HttpOnly and Secure, and that authenticated requests use the same HTTPS origin.
- On the server: `sudo docker compose --project-directory /opt/claw ps`, `sudo docker compose --project-directory /opt/claw logs --tail=80 web`, and `sudo docker compose --project-directory /opt/claw logs --tail=80 https`. Do not print `.env` or rendered Compose configuration into shared logs.

## Updates, rollback and data

Keep the existing `/opt/claw/.env`, tls directory, Caddy state and MySQL volume. Archive the previous source release before replacing application files, build the new image, then use `docker compose up -d --build web`. Verify health and assets. For rollback, restore the previous source release, rebuild web and start it again. Source rollback does not reverse database changes; any later schema changes require their own reviewed migration and backup.

Never run `docker compose down -v` during routine updates: it deletes persistent data. Take an encrypted database backup before schema work; keep it out of this public repository. This small single-server deployment has no high availability and requires OS updates, certificate monitoring and a backup plan for longer-term use.

## References

- https://aws.amazon.com/lightsail/pricing/
- https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-stopping-and-restarting-an-instance-in-amazon-lightsail.html
- https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability
- https://caddyserver.com/docs/caddyfile/directives/tls
