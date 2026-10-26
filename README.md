# GymEase

GymEase is a web-based gym management application for a **single gym**. It brings day-to-day membership administration and member services into one place, with separate experiences for administrators, trainers, and members. The application is deployed at **[gymease.site](https://www.gymease.site)**.

The live deployment is currently used to showcase GymEase to gyms. This repository does not yet include an automated test suite or a complete production operations runbook, so the live deployment should not be taken as evidence that production-grade testing and operational controls are in place. This guide documents the current project and the work needed to strengthen it for ongoing use.

## Product scope

The current deployment is designed for one gym and one shared set of gym data. It does not provide tenant isolation between independently onboarded gyms. If GymEase is later offered to multiple gym businesses, tenant ownership and access checks must be designed and verified throughout the API, database queries, background jobs, and real-time messaging before onboarding them.

## Features

- **Administration:** member and trainer management, gym and membership plans, sub-admin invitations and permissions, store catalog and orders, dashboards, and trainer/revenue reporting.
- **Memberships and payments:** membership plan browsing and subscriptions, checkout initiation, payment verification and reconciliation, and payment outcome pages. The current SafePay integration is configured for the provider's sandbox.
- **Member experience:** account registration and profile completion, membership status and QR membership card, gym plans, custom plan requests, scheduled sessions, progress tracking, and store orders.
- **Trainer experience:** assigned member and training-plan views, schedules, sessions, progress, and member communication.
- **Attendance and communication:** attendance management and real-time chat using Socket.IO.
- **Supporting services:** MongoDB persistence, Cloudinary image uploads, Resend transactional email, Google OAuth, and scheduled maintenance workflows.

Features that depend on external credentials will be unavailable or limited until those integrations are configured. Do not use live customer or payment data for a showcase environment.

## Technology

| Area | Technologies |
| --- | --- |
| Web client | React 19, Vite, React Router, Tailwind CSS, Axios, Chart.js, Socket.IO client |
| API | Node.js (ES modules), Express 5, Mongoose, Socket.IO |
| Data | MongoDB |
| Integrations | SafePay sandbox, Cloudinary, Resend, Google OAuth |

## Repository layout

```text
client/       React/Vite web application
server/       Express API, models, routes, integrations, cron jobs, seed scripts
postman/      Postman API collection and related files
.postman/     Postman workspace metadata
.github/      Scheduled workflow definitions
```

## Prerequisites

- Node.js compatible with the installed Vite version (Node.js 20.19+ or 22.12+ is recommended for Vite 8).
- npm (lockfiles are provided in `client/` and `server/`).
- A MongoDB database reachable from the API.
- Optional provider accounts and credentials for Google OAuth, SafePay sandbox, Cloudinary, and Resend.

Use separate credentials and databases for local development, demonstrations, and any hosted environment. Never commit `.env` files, API keys, database URIs, OAuth secrets, or real user data.

## Local setup

### 1. Configure the API

The repository includes a root-level [`.env.example`](.env.example) listing the API's supported environment variables and local defaults. Copy it to `server/.env`, then replace the placeholder values and configure the integrations you plan to use:

```powershell
Copy-Item .env.example server/.env
```

Alternatively, copy the file manually and keep the private values in `server/.env`. Generate independent, long random values for `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, and `CRON_SECRET`. Set a unique `ADMIN_PASSWORD` before running the admin seed. Use test/sandbox credentials for demos. Keep `.env` files private and out of source control.

The API reads MongoDB and token settings at startup. OAuth, payments, image uploads, and email require valid provider credentials. Email uses a configured sender in the server code; verify that sender/domain with your email provider before expecting delivery.

### 2. Configure the client

Create `client/.env` with the API base URL:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

The client falls back to port 8000 on the current hostname when this value is absent. Set it explicitly for local devices, hosted preview environments, and production builds. Vite exposes `VITE_` values to browser code, so never put secrets there.

### 3. Install and start

In one terminal:

```bash
cd server
npm ci
npm run dev
```

In a second terminal:

```bash
cd client
npm ci
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). The API listens on port `8000` by default. Check `http://localhost:8000/health-check` for the API process health response; currently, this endpoint does not verify MongoDB readiness.

## Database seeding

The server currently exposes `npm run seed:admin`. It creates the system admin configured by `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` when that email is not already present. **Set a unique, strong password before running it.** The script has fallback credentials if values are omitted, so do not run it against a shared or production database without overriding them.

Additional seed files are present for membership plans, trainers, popular gym plans, and store products. They are not wired to npm scripts, and some seed data assumes specific trainer record IDs. Review each seed script and use a disposable development database before running it; do not assume all seed scripts are repeatable or safe for a populated database.

## Showcase preparation

Use an isolated demo database and predictable demo accounts. Before presenting:

1. Confirm the API connects to the intended demo database and the client points to that API.
2. Prepare and verify an admin, trainer, and member account, plus representative plans, sessions, attendance, and store items.
3. Test the complete story once: admin reviews the dashboard and manages a plan or trainer; a member views membership and plan details; a trainer reviews assigned members and sessions; staff records attendance; then show messaging or reporting.
4. Keep SafePay in sandbox mode and demonstrate both payment success and cancellation/failure behavior without real payment details.
5. Verify email, Google OAuth, uploads, and network access in the actual presentation environment, or omit those integrations from the live story.
6. Have a resettable database snapshot and a local fallback ready. Do not depend on internet access or a third-party integration for the core walkthrough.

Do not publish demo passwords in this README. Share them privately with the intended audience and rotate them after a public presentation.

## Current scripts and verification

### Client (`client/`)

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite development server |
| `npm run build` | Create a client production build in `dist/` |
| `npm run preview` | Serve the built client locally for a smoke check |
| `npm run lint` | Run ESLint |

### Server (`server/`)

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm run seed:admin` | Create the configured initial admin if absent |
| `npm test` | Not implemented yet; the current placeholder exits with an error |

There are currently no automated server tests. A production-readiness effort should add focused API and model tests, authorization and validation coverage, payment-state tests, and browser end-to-end coverage for the critical member/admin workflows. Add CI checks for linting, builds, and tests once those suites exist. Do not treat a successful client build or the health endpoint as proof that the full product is production-ready.

## Background jobs

The API exposes secret-protected endpoints for daily maintenance and payment reconciliation under `/api/v1/cron`. The daily endpoint runs membership reminders/expiry and training-session maintenance; reconciliation checks pending payments. Set a strong `CRON_SECRET` and configure a trusted scheduler to send it in the `x-cron-secret` header. The server entry point does not currently start the in-process cron scheduler; the repository includes GitHub workflow definitions, which must be configured with the appropriate API URL and secret before they can run. Confirm the exact workflow schedules and behavior before enabling them.

## Live deployment and operations

The application is live at [https://www.gymease.site](https://www.gymease.site). Hosting provider details and a complete deployment runbook are not documented in this repository. Before relying on the live service for ongoing gym operations:

- Build the client with the deployed API URL and serve it over HTTPS.
- Run the API behind HTTPS with exact allowed origins in `CORS_ORIGIN`; avoid wildcard origins when using credentialed cookies.
- Provision a private MongoDB database, restricted network access, automated backups, and a tested restore procedure.
- Configure strong, independent token and cron secrets; store secrets in the host's secret manager, not in source control or browser-visible client variables.
- Verify cookie settings, OAuth callback URLs, payment webhook signature verification, and file upload limits in the deployed environment.
- Configure provider credentials and approved sender domains for the chosen environment. SafePay is currently initialized in sandbox mode in the code.
- Configure the scheduled workflows only after setting their secrets and verifying that the target API is the intended environment.
- Add structured application logs, alerting, error monitoring, readiness checks, and a rollback procedure.
- Run a security and privacy review before storing real member profiles, health/progress information, payment records, or other personal data.

## Roadmap to a production release

1. **Showcase confidence:** document and verify local setup, repeatable demo data, the critical walkthrough, and the live presentation environment.
2. **Reliability:** implement automated backend and browser tests, validation, error handling, observability, and tested backup/restore.
3. **Security:** review authentication, role/permission checks, object-level authorization, uploads, CORS/cookies, secrets, and dependency updates.
4. **Single-gym operations:** strengthen and monitor the existing deployment, verify real workflows with consent, fix operational issues, and document support/recovery.
5. **Multi-tenant upgrade (later):** design gym ownership, data migration, tenant-scoped authorization and queries, tenant-aware real-time events/jobs, and cross-tenant isolation tests before onboarding multiple gyms.

## Contributing and support

For a development change, describe the user workflow and expected result in the pull request, include reproduction steps for bug fixes, and report what checks were run. Until automated test scripts are added, record manual verification steps explicitly.

