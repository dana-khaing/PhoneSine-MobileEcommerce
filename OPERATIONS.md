# Production Operations

## Monitoring

- Probe `GET /health` every minute and alert on non-200 responses.
- Probe `GET /health/ready` before routing traffic.
- Scrape `GET /metrics` with `Authorization: Bearer $METRICS_TOKEN`.
- Set `OPERATIONS_ALERT_WEBHOOK_URL` to receive unhandled-error alerts.
- Set `ERROR_TRACKING_WEBHOOK_URL` to send sanitized application error reports to
  an error-tracking collector. Set `APP_RELEASE` to the deployed commit or release
  identifier so reports can be correlated with deployments.
- Browser crashes are submitted to the rate-limited `/client-errors` endpoint.
  Reports omit URL query parameters and the backend redacts sensitive context.
- Monitor `GET /admin/health/payments` and `GET /admin/analytics` with an admin token.
- Trigger `POST /admin/low-stock-alerts` daily before notification delivery.
- Run `pnpm run check:production` from `backend/` before launch and before
  major environment changes. It checks required secrets, HTTPS origins, Stripe
  live-mode configuration, SMS provider completeness, and monitoring toggles
  without printing secret values.
- Run `pnpm run launch:runbook` from `backend/` to generate a release checklist
  that combines readiness blockers with provider setup, deployment, and
  post-launch verification tasks.

## Database Backups

Create an encrypted daily MySQL backup and retain at least 30 days:

```sh
mysqldump --single-transaction --routines --triggers "$DB_NAME" | gzip > "phone-sine-$(date +%F).sql.gz"
```

Test restoration in a non-production database every month:

```sh
gunzip -c phone-sine-YYYY-MM-DD.sql.gz | mysql "$RESTORE_DB_NAME"
```

Store backups outside the application host with restricted access and lifecycle retention.
Run `pnpm run db:backup -- backup.sql.gz` and verify it with
`RESTORE_DB_NAME=phone_sine_restore_test pnpm run db:restore-test -- backup.sql.gz`.
The monthly `Backup Restore Verification` workflow performs this restore test.

## Scheduled Jobs

Run `pnpm run job:maintenance` every ten minutes from the platform scheduler.
Run `pnpm run job:low-stock` daily. Individual cleanup, notification, and
reconciliation jobs are also available. Set `RUN_IN_PROCESS_JOBS=true` only for
single-instance deployments without an external scheduler.

The `Scheduled Commerce Maintenance` workflow provides these schedules when the
repository variable `ENABLE_SCHEDULED_MAINTENANCE` is `true`. Configure
`PRODUCTION_DATABASE_URL`, `PRODUCTION_STRIPE_SECRET_KEY`,
`PRODUCTION_EMAIL_WEBHOOK_URL`, and `PRODUCTION_JWT_SECRET` as repository
secrets before enabling it.

## Staging

Use the reproducible staging stack and promotion checklist in
[`DEPLOYMENT.md`](DEPLOYMENT.md). The staging workflow validates the Compose
configuration and builds both application images on deployment-related pull
requests.
