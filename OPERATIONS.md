# Production Operations

## Monitoring

- Probe `GET /health` every minute and alert on non-200 responses.
- Monitor `GET /admin/health/payments` and `GET /admin/analytics` with an admin token.
- Trigger `POST /admin/low-stock-alerts` daily before notification delivery.

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

## Staging

Use the reproducible staging stack and promotion checklist in
[`DEPLOYMENT.md`](DEPLOYMENT.md). The staging workflow validates the Compose
configuration and builds both application images on deployment-related pull
requests.
