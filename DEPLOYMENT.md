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

Deploy a published release:

```sh
PRODUCTION_ENV_FILE=.env.production sh scripts/deploy-production.sh
```

The script validates Compose configuration, pulls the selected release images,
starts the services, and blocks until API readiness and the storefront respond.
Back up the database before changing release tags. Roll back by restoring the
previous image tags in `.env.production` and rerunning the script; restore the
database backup only when a migration changed incompatible data.
