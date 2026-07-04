# PhoneSine Mobile Ecommerce

[![CI](https://github.com/dana-khaing/PhoneSine-MobileEcommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/dana-khaing/PhoneSine-MobileEcommerce/actions/workflows/ci.yml)
[![Security](https://github.com/dana-khaing/PhoneSine-MobileEcommerce/actions/workflows/security.yml/badge.svg)](https://github.com/dana-khaing/PhoneSine-MobileEcommerce/actions/workflows/security.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-635bff)](https://stripe.com/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-b08d2d)](LICENSE)

PhoneSine is a production-oriented mobile ecommerce project with a Next.js
storefront, Express API, MySQL persistence, Stripe checkout, order operations,
admin tooling, account security, and launch-readiness automation.

## Contents

- [Architecture](#architecture)
- [Feature Overview](#feature-overview)
- [Quick Start](#quick-start)
- [Environment](#environment)
- [Common Commands](#common-commands)
- [Testing And Quality](#testing-and-quality)
- [Testing, QA, And Delivery](#testing-qa-and-delivery)
- [Payments And Webhooks](#payments-and-webhooks)
- [Admin And Operations](#admin-and-operations)
- [Account Security](#account-security)
- [Deployment](#deployment)
- [License](#license)

## Architecture

| Area | Stack | Notes |
| --- | --- | --- |
| Frontend | Next.js 15, React, Tailwind | Storefront, checkout, profile, orders, admin, PWA |
| Backend | Node.js, Express 5 | REST API, auth, payments, operations, jobs |
| Database | MySQL, Sequelize | Migrations, models, transactional commerce flows |
| Payments | Stripe Checkout and webhooks | Idempotent checkout, refunds, disputes, reconciliation |
| Quality | Node test runner, Playwright, GitHub Actions | Unit, integration, e2e, audit, staging validation |

## Feature Overview

### Storefront

- Branded landing page, responsive navigation, product discovery, category
  pages, comparison, product detail pages, and mobile-friendly layouts.
- Product catalogue with categories, variants, bundles, image galleries,
  optimized uploads, search, suggestions, filters, typo-tolerant matching,
  pagination, and backend-driven total counts.
- Cart, saved cart, checkout quote, delivery options, GBP/USD/EUR currency
  conversion, VAT/tax, promotion codes, gift cards, and Stripe Checkout session
  creation.
- Product reviews, wishlists, recently viewed products, back-in-stock alerts,
  loyalty/referral rewards, and personalized recommendations.
- Customer profile, saved addresses, notification preferences, order history,
  order timelines, PDF invoice downloads, reorder actions, support tickets,
  returns, cancellations, refunds, saved payment methods, and privacy controls.
- English and Burmese storefront locale support.
- Installable PWA with an offline page and network-safe service worker strategy.
- Visible feedback for customer actions so save, support, gift-card, OAuth, and
  pagination controls do not fail silently or point to placeholder links.

### Payments And Commerce

- Database-backed orders, order items, stock, reservations, events, refunds,
  shipments, returns, promotions, gift cards, bundles, suppliers, warehouses,
  purchase orders, audit logs, and notification outbox records.
- Inventory validation before checkout, reservation during payment, settlement
  after successful payment, and cleanup for failed or abandoned payments.
- Stripe webhook handling for checkout completion, expiration, asynchronous
  payment states, refunds, disputes, duplicate events, and late successful
  payments that need manual review.
- Saved Stripe payment-method management and customer payment-method cleanup.
- Invoices, customer order timelines, cancellation, return, refund, fulfillment,
  and shipping workflows.
- Domestic and international shipping rates, carrier label creation, tracking
  updates from shipping webhooks, and protected label lookup for fulfillment
  staff.
- Idempotency keys for checkout and refund calls, payment health reporting,
  reconciliation, and production readiness checks for live Stripe settings.

### Admin And Operations

- Admin dashboard for orders, products, categories, variants, images, bundles,
  promotions, refunds, returns, users, reviews, support tickets, gift cards,
  suppliers, warehouses, purchase orders, analytics, observability, payment
  health, launch status, and provider readiness.
- Granular database-backed staff roles for admin, catalog, fulfillment, support,
  operations, and customer accounts.
- Operational reports, low-stock alerts, payment health, reconciliation,
  audit logs, structured logs, metrics, backups, and launch runbook tooling.
- Admin workflows for product CRUD, product CSV import/export, product archive
  and restore, category/variant management, review moderation, support replies,
  gift-card issuing, procurement receiving, and real shipping-label creation
  through the backend shipping route.
- Privacy-safe analytics dashboard integration with account, checkout, admin,
  order, payment-method, profile, and security routes excluded from collection.
- Maintenance automation for stock alerts, abandoned-order cleanup, email/SMS
  notification delivery, payment reconciliation, and scheduled commerce jobs.

### Account Security

- Email verification, password reset, rotating refresh-token sessions, logout,
  session revocation, login history, OAuth login, two-factor authentication,
  recovery codes, bot protection, CSRF protection, secure headers, and
  privacy export/delete flows.
- Database-backed role and permission checks for customers and staff.
- Production hardening for HTTPS origins, live Stripe keys, monitoring, email
  delivery, operations alerting, error tracking, Turnstile, CSP, HSTS, and
  sanitized browser/server error reports.
- Rate limiting for sensitive browser error reporting and request flows.
- OAuth buttons are guarded when the backend origin is not configured, avoiding
  broken sign-in links in incomplete environments.

### Testing, QA, And Delivery

- Backend unit and integration tests for commerce, auth, payments, inventory,
  operations, security, recommendations, privacy, and production readiness.
- Frontend source tests for accessibility, checkout calculations, product
  filtering, session helpers, PWA assets, analytics configuration, and dead
  action regressions.
- Playwright browser tests for checkout, profile preferences, support, product
  details, cart saving, admin orders, returns, products, promotions, support,
  gift cards, procurement, and mobile screenshots.
- GitHub Actions for CI, browser tests, dependency audits, dependency review,
  secret scanning, staging image validation, scheduled maintenance, backup
  restore verification, and production image release.

## Quick Start

### 1. Install Dependencies

```sh
cd backend
pnpm install

cd ../frontend
pnpm install
```

### 2. Configure Environment

```sh
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Replace placeholder values before running checkout or production-like flows.
For local development, the default ports are:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:8080` |
| Stripe webhook path | `http://localhost:8080/payments/webhook` |

### 3. Run Database Migrations

```sh
cd backend
pnpm run db:migrate
```

Use a fresh database when applying the initial migration to an older
`sequelize.sync()` database. The initial migration safely adopts existing tables
and intentionally cannot be automatically rolled back because that could delete
pre-migration data.

### 4. Start The Apps

Open two terminals:

```sh
cd backend
pnpm run dev
```

```sh
cd frontend
pnpm run dev
```

## Environment

### Backend

Important backend values live in `backend/.env`.

| Variable | Purpose |
| --- | --- |
| `PORT` | API port, usually `8080` locally |
| `JWT_SECRET` | Access-token signing secret |
| `BACKEND_ORIGIN` | Public API origin |
| `FRONTEND_ORIGIN` / `FRONTEND_URL` | Storefront origin for CORS and checkout redirects |
| `DB_DIALECT`, `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Sequelize database connection |
| `ADMIN_EMAILS` | Initial admin seed emails used by the role migration |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe API and webhook verification |
| `EMAIL_WEBHOOK_URL` | Optional email provider webhook |
| `ENABLE_SMS_NOTIFICATIONS`, `TWILIO_*` | Optional SMS notification channel |
| `TURNSTILE_SECRET_KEY` | Optional bot protection |
| `METRICS_TOKEN` | Optional metrics endpoint protection |
| `CURRENCY_RATES_JSON` | GBP/USD/EUR conversion rates |

### Frontend

Frontend public API URLs live in `frontend/.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BACKEND_ORIGIN` | Backend API origin |
| `NEXT_PUBLIC_PRODUCT_LIST_URL` | Public product API |
| `NEXT_PUBLIC_API_PAYMENT_URL` | Checkout session endpoint |
| `NEXT_PUBLIC_API_PAYMENT_QUOTE_URL` | Checkout quote endpoint |
| `NEXT_PUBLIC_API_PAYMENT_STATUS_URL` | Checkout success verification endpoint |
| `NEXT_PUBLIC_API_ORDERS_URL` | Customer orders endpoint |
| `NEXT_PUBLIC_API_ADMIN_URL` | Admin API base |
| `NEXT_PUBLIC_API_*` | Auth, saved items, reviews, profile, payment methods |

Optional privacy-safe analytics can be enabled with
`NEXT_PUBLIC_ANALYTICS_DOMAIN` and an HTTPS
`NEXT_PUBLIC_ANALYTICS_SCRIPT_URL`. Analytics are disabled by default and exclude
checkout, admin, account, order, payment-method, profile, and security routes.

## Common Commands

### Backend

```sh
cd backend
pnpm run dev
pnpm test
pnpm run audit
pnpm run db:migrate
pnpm run db:migrate:status
pnpm run check:production
pnpm run launch:runbook
pnpm run job:maintenance
pnpm run job:cleanup
pnpm run job:notifications
pnpm run job:reconcile
pnpm run job:low-stock
pnpm run job:stock-alerts
pnpm run db:backup -- backup.sql.gz
RESTORE_DB_NAME=phone_sine_restore_test pnpm run db:restore-test -- backup.sql.gz
```

### Frontend

```sh
cd frontend
pnpm run dev
pnpm test
pnpm run build
pnpm test:e2e
pnpm test:e2e:mobile
pnpm run audit
```

## Testing And Quality

Run the full local validation set before opening a production-facing PR:

```sh
cd backend
pnpm run audit && pnpm test && pnpm run db:migrate:status

cd ../frontend
pnpm run audit && pnpm test && pnpm run build && pnpm test:e2e
```

Quality gates are documented in [QUALITY.md](QUALITY.md). Pull requests run
backend tests, migrations, frontend tests, production builds, browser tests,
dependency checks, secret scanning, and staging validation.
The browser suite covers customer checkout, profile, support, saved cart,
product detail, admin order, product, promotion, support, gift-card, and
procurement workflows. Mobile screenshot coverage is available through the
Playwright mobile suite and records phone-width home, checkout, and admin views.

Source-level tests also guard against dead links, placeholder action URLs, and
silent user-action failures in high-traffic storefront and admin screens.

## Payments And Webhooks

Set these backend values before testing Stripe:

```sh
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

Then point Stripe webhooks to:

```text
/payments/webhook
```

Useful local Stripe CLI command:

```sh
stripe listen --forward-to localhost:8080/payments/webhook
```

Every checkout request must send an `Idempotency-Key` header. Stripe checkout
and refund calls also receive deterministic idempotency keys from the backend.

## Admin And Operations

Admin tools are available in the frontend at:

```text
/admin
```

Important backend admin endpoints include:

| Endpoint | Purpose |
| --- | --- |
| `/admin/orders` | Order management |
| `/admin/health/payments` | Payment health summary |
| `/admin/reconcile` | Payment reconciliation |
| `/admin/reports/operations.csv` | Operations report export |
| `/admin/launch-status` | Launch readiness and provider status |
| `/admin/audit-logs` | Recent admin audit trail |

Catalog and operations staff can manage suppliers, warehouses, warehouse stock,
and purchase orders from `/admin`. Receiving a purchase order transactionally
updates the destination warehouse and storefront product stock.

## Account Security

New accounts receive a verification link through `EMAIL_WEBHOOK_URL`, or in the
backend console during local development. Users must verify email before
signing in.

Available security features:

- Email verification and resend.
- Password reset.
- Rotating refresh sessions and session revocation.
- Login event history.
- Google and Apple OAuth authorization-code login.
- Two-factor authentication with single-use recovery codes.
- Cloudflare Turnstile bot protection when configured.
- Customer data export and account deletion from `/profile`.

OAuth callback URLs:

```text
${BACKEND_ORIGIN}/auth/oauth/google/callback
${BACKEND_ORIGIN}/auth/oauth/apple/callback
```

## Deployment

Deployment details live in [DEPLOYMENT.md](DEPLOYMENT.md).

The storefront `/status` page verifies API health and readiness from the
browser and includes a short deployment checklist for backup, webhook, and
admin payment-health checks after releases, rollbacks, or DNS changes.

The staging flow uses Docker Compose:

```sh
docker compose --env-file .env.staging -f docker-compose.staging.yml config
docker compose --env-file .env.staging -f docker-compose.staging.yml build
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d
```

Production uses published GHCR images and:

```sh
PRODUCTION_ENV_FILE=.env.production sh scripts/deploy-production.sh
```

Before production promotion, run the production readiness and launch runbook
checks:

```sh
cd backend
pnpm run check:production
pnpm run launch:runbook
```

## License

This project is proprietary. See [LICENSE](LICENSE) for the current usage terms.

## Repository Map

```text
backend/
  src/           Express routes, services, jobs, payment and auth logic
  models/        Sequelize models
  migrations/    Database migrations
  test/          Backend unit and integration tests
  scripts/       Backup, readiness, and launch automation

frontend/
  src/app/       Next.js application routes and UI
  e2e/           Playwright browser tests
  test/          Frontend unit tests
  public/        Static assets, manifest, service worker
```

## Notes

- Keep real `.env`, `.env.local`, staging, and production files out of version
  control.
- Admin refund amounts are expressed in the smallest currency unit.
- Do not automatically reverse migrations whose `down` operation can delete
  commerce records.
- Product images support JPEG, PNG, and WebP uploads up to 2 MB.
