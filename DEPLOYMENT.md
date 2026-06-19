# Staging Deployment

## Prerequisites

- A Linux host with Docker Engine and Docker Compose.
- DNS and TLS termination for the storefront and API origins.
- A Stripe test-mode webhook endpoint targeting
  `https://api-staging.example.com/payments/webhook`.
- Off-host encrypted MySQL backup storage.

## Configure

```sh
cp .env.staging.example .env.staging
```

Replace every placeholder. Keep `.env.staging` outside version control. Use
different random values for `JWT_SECRET`, `MFA_ENCRYPTION_KEY`, database
passwords, and Stripe secrets.

Set `PUBLIC_API_ORIGIN`, `FRONTEND_ORIGIN`, and `FRONTEND_URL` to the public TLS
origins. The frontend public API values are compiled into the image.

## Deploy

```sh
docker compose --env-file .env.staging -f docker-compose.staging.yml config
docker compose --env-file .env.staging -f docker-compose.staging.yml build
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d
docker compose --env-file .env.staging -f docker-compose.staging.yml ps
```

The backend container waits for MySQL, applies pending migrations, starts the
API, and exposes `/health`. Both application containers include Docker health
checks.

## Verify

1. Confirm the API `/health` response reports a connected database.
2. Complete a Stripe test-mode checkout and confirm the webhook updates the
   order.
3. Confirm an admin can view the order, issue a refund, and create a shipping
   label.
4. Run `pnpm test:e2e` against the candidate build before promotion.

## Back Up And Roll Back

Create an encrypted database backup before each migration. To roll back, stop
the stack, restore the backup if the migration changed data, deploy the previous
image versions, and run the health and checkout verification steps again.

Do not automatically reverse migrations whose down operation can delete
commerce records.

# Production Deployment

Production uses prebuilt immutable images from GitHub Container Registry and an
external managed MySQL database. Copy `.env.production.example` to
`.env.production` on a TLS-terminating production host and replace every
placeholder.

## Production Environment Checklist

Before publishing a release tag, confirm every item below is complete:

| Area | Check |
| --- | --- |
| Domains | `FRONTEND_ORIGIN`, `FRONTEND_URL`, `BACKEND_ORIGIN`, and `PUBLIC_API_ORIGIN` use HTTPS production origins |
| Database | Managed MySQL is reachable from the production host and a fresh encrypted backup exists |
| Secrets | `JWT_SECRET`, `MFA_ENCRYPTION_KEY`, database password, Stripe secret, webhook secret, and provider tokens are unique production values |
| Stripe | Live-mode checkout key and webhook endpoint point to `/payments/webhook` |
| Email/SMS | Notification provider credentials are configured or intentionally disabled |
| Monitoring | `/health`, `/health/ready`, `/metrics`, payment health, and browser error reports are monitored |
| Jobs | External scheduler or GitHub scheduled maintenance is enabled; `RUN_IN_PROCESS_JOBS` is only used for single-instance deployments |
| Rollback | Previous backend/frontend image tags and the latest database backup are known before migration |

Run the backend readiness check before changing traffic:

```sh
cd backend
pnpm run check:production
pnpm run launch:runbook
```

Deploy a published release:

```sh
PRODUCTION_ENV_FILE=.env.production sh scripts/deploy-production.sh
```

The script validates Compose configuration, pulls the selected release images,
starts the services, and blocks until API readiness and the storefront respond.
Back up the database before changing release tags. Roll back by restoring the
previous image tags in `.env.production` and rerunning the script; restore the
database backup only when a migration changed incompatible data.

## Post-Deploy Verification

After the deploy script succeeds:

1. Open `/status` on the production storefront and confirm both API health and
   readiness show healthy.
2. Run a Stripe live-mode low-value checkout and confirm the webhook marks the
   order paid.
3. Open `/admin`, confirm payment health, analytics, low-stock count, and launch
   status render without errors.
4. Run `POST /admin/reconcile` and notification delivery from the admin console
   or scheduled job.
5. Confirm the monitoring stack can reach `/health`, `/health/ready`, and
   `/metrics` with the configured token.

## Rollback Procedure

1. Stop promotions and pause scheduled maintenance jobs.
2. Replace `BACKEND_IMAGE` and `FRONTEND_IMAGE` in `.env.production` with the
   previous release tags.
3. Run `PRODUCTION_ENV_FILE=.env.production sh scripts/deploy-production.sh`.
4. Restore the pre-deploy database backup only when the release applied an
   incompatible migration or corrupted production data.
5. Reopen `/status`, run the Stripe checkout smoke test, and re-enable jobs.
6. Record the failed release tag, rollback tag, backup identifier, and customer
   impact in the incident notes.

## Release Automation

Pushing a `v*` Git tag or manually running `Production Release` publishes both
images to GHCR under that tag. Configure `PRODUCTION_API_ORIGIN` and
`PRODUCTION_TURNSTILE_SITE_KEY` as repository variables before publishing.

Automatic promotion is optional. Attach a self-hosted runner labeled
`production`, store the complete production environment file as the
`PRODUCTION_ENV_CONTENT` environment secret, and set repository variable
`ENABLE_PRODUCTION_DEPLOY=true`. Without those settings, releases publish
images but do not attempt to change any production host.
