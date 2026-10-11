# CLAW user backend

Node 22.10+ and MySQL 8+ are required. This is the user-facing API; worker administration is not exposed.

1. Create a MySQL database named `claw` and a database user with access to it.
2. Copy `.env.example` to `.env` and fill in the MySQL connection values. Keep `.env` private.
3. Run `npm install`, then `npm run db:setup`, then `npm run dev` in `backend/`.
4. Run `npm run dev` in `frontend/` and open http://localhost:5173.

The frontend server proxies `/api/` to port 5001. Set its `API_URL` if the backend runs elsewhere. `APP_ORIGIN` must match the browser's origin, including port. Node loads `.env` via the package scripts. Configure HTTPS and `NODE_ENV=production` for deployment; production session cookies are Secure.

The setup command creates tables and seeds ten fictional dog records from the Figma worker gallery without overwriting existing records. Photos live under `frontend/public/assets/dogs/profiles/`, mapped to the exact corresponding gallery row (including Bella). Intake dates, adoption dates, stories, personalities, sexes and availability are illustrative; some gallery ages/breeds are preserved. No user accounts are seeded.

## Endpoints

- `GET /api/health`: API and database readiness.
- `GET /api/dogs`: dog records; optional `available=true`, `size`, `sex` filters.
- `GET /api/dogs/:id`: complete dog profile.
- `POST /api/auth/register`: username, email, password, confirmPassword. Passwords require 8–128 characters.
- `POST /api/auth/login`: username, email, password (matching the existing login form).
- `GET /api/auth/me`: current public user or null.
- `POST /api/auth/logout`: revoke current session.
- `POST /api/contributions`: amount (decimal string in ZAR), frequency, paymentMethod, name, email, optional phone and dogId.
- `GET /api/contributions`: signed-in user's own requests.

Passwords use salted scrypt hashes. Only hashed session tokens are persisted; the browser receives an HttpOnly, SameSite=Lax cookie. SQL values use parameterized queries. Authentication has a per-process attempt limit; use shared rate limiting when deploying multiple instances.

Contribution requests are persisted as `pending_payment`. This backend does not charge cards or confirm EFT transfers. Virtual adoption is not activated by submission, and its six-month period must start only after verified payment. Provider checkout/webhook integration, email delivery, password recovery and worker management remain separate work requiring configuration and designs. Never treat a pending request as proof of payment.

## Verification

`npm test` runs API integration checks with an in-memory test repository. To test the real MySQL schema and persistence, create an empty dedicated test database whose name ends in `_test`, configure connection variables, and run `MYSQL_INTEGRATION=1 npm test`. The database test seeds data and inserts/deletes a uniquely named test user; do not use a production database.

## Dog photo provenance

Source: [Figma worker Animal Gallery](https://www.figma.com/design/1NsI5xa1XPe75tz7dLW3ag?node-id=2844-5208).
The photo nodes map explicitly to records: Bella `2844:5229`, Max `2844:5235`, Rocky `2844:5241`, Cooper `2844:5247`, Duke `2844:5253`, Simba `2844:5259`, Daisy `2844:5265`, Mia `2844:5271`, Zoe `2844:5302`, Honey `2844:5303`.
Names, breed labels and ages follow that gallery. The source labels Max as Border Collie beside a Rottweiler-looking photo and Rocky as Rottweiler beside a Border Collie-looking photo; Cooper is labelled two weeks beside an adult-looking dog. Max and Rocky’s photos have been switched at the project owner’s request so the Border Collie and Rottweiler labels match their photos. Cooper’s source age is preserved.

For an existing demo database with the earlier shifted photos, run `node --env-file-if-exists=.env src/repair-dog-images.js` from `backend/`. This changes only the image field of the ten known mock records; dates, stories, accounts and contributions are preserved.


### Dog availability and future sponsorship lifecycle

Public dog listings and detail pages expose dogs in care, including already sponsored dogs. Permanently adopted dogs remain hidden. The available-only API filter excludes active sponsorships. “Already sponsored” means virtual support, not permanent adoption. Sponsored profiles remain publicly viewable. “Notify me when available” opens a prefilled email request to CLAW, with a blue note explaining that in-app notifications are future work and that the request is not a reservation. Pending payment does not activate sponsorship.

Dog records distinguish `permanentAdoptionDate` (permanent placement), `sponsorshipStartedAt`, and `sponsorshipEndsAt` (virtual support). Expired sponsorship releases an in-care dog for public browsing. Legacy mock adoption dates are interpreted as sponsorship starts; existing stored records are normalized on read without destructive database changes.

Future work: payment confirmation must atomically claim a dog and set sponsorship dates, preventing duplicate active sponsors. Add an account sponsorship view and permanent-placement notifications. Permanent placement should end scheduled sponsorship payments; disclose this before checkout. After the sponsor acknowledges the placement notification, archive the profile from their active view seven days later, preserving contribution and sponsorship history. Until these features exist, permanently placed profiles are hidden immediately. No reservation or waitlist is offered.
