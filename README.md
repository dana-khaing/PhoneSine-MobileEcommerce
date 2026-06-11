# To Run Frontend

pnpm run dev

// .env.local is for the frontend and can be request at the groupchat

# To Run Backend

pnpm run dev

// .env is for the backend and can be request at the groupchat

# To Run Database

localhost:8080/showall (to view all userdata api)
localhost:8080/deleteall (to delete all of the user data)

Run `pnpm run db:migrate` from `backend` before starting the API. Use a fresh
database when applying the initial migration to an older `sequelize.sync()`
database.

The initial migration safely adopts existing tables and intentionally cannot be
automatically rolled back because doing so could delete pre-migration data.

# To Run Tests

Run `pnpm test` from both the `frontend` and `backend` directories.

# Stripe Checkout

Set `STRIPE_SECRET_KEY` and `FRONTEND_URL` in `backend/.env`, then set
`NEXT_PUBLIC_API_PAYMENT_URL` to the backend `/payments/create-checkout-session`
endpoint in `frontend/.env.local`.

Set `NEXT_PUBLIC_API_PAYMENT_STATUS_URL` to the backend
`/payments/checkout-session` endpoint so the success page verifies payment.

Set `STRIPE_WEBHOOK_SECRET` in `backend/.env` and point Stripe webhooks to
`/payments/webhook`. Set `NEXT_PUBLIC_API_ORDERS_URL` to the backend `/orders`
endpoint for authenticated order history.

Copy the included `.env.example` files and replace placeholder values before
running checkout locally.

## Commerce Operations

- Products, stock, reservations, promotions, VAT, order events, and notification
  outbox records are database-backed.
- `WELCOME10` is seeded as an example 10% promotion.
- Set `ADMIN_EMAILS` to a comma-separated list of admin accounts.
- Set `EMAIL_WEBHOOK_URL` to a provider endpoint accepting
  `{ to, subject, text }`; without it, notifications are logged locally.
- Admin operations are available under `/admin` and the frontend `/admin` page.
- The backend runs reservation cleanup and notification delivery every 10
  minutes; admins can also trigger both operations manually.
- Admin refund amounts are expressed in the smallest currency unit (pence).

## Payment production operations

- Every checkout request must send an `Idempotency-Key` header. Stripe checkout
  and refund calls also receive deterministic idempotency keys.
- Supported checkout currencies are GBP, USD, and EUR. Override conversion
  rates with `CURRENCY_RATES_JSON`; production deployments should update these
  rates from a trusted source.
- Configure Stripe to send checkout completion/expiration/asynchronous payment,
  refund, and `charge.dispute.*` events to `/payments/webhook`.
- Run `stripe listen --forward-to localhost:8080/payments/webhook` for Stripe CLI
  webhook testing. The backend integration suite also signs, sends, and retries
  a webhook through the real HTTP route.
- `/admin/health/payments`, `/admin/reconcile`, and `/admin/audit-logs` provide
  payment monitoring, reconciliation, and audit history.
