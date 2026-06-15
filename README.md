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

## Account security

New accounts receive a verification link through `EMAIL_WEBHOOK_URL`, or in the
backend console during local development. Users must verify their email before
signing in. Access tokens are short-lived and backed by rotating, revocable
refresh sessions. Admin authorization uses the database `role` field; set
`ADMIN_EMAILS` before the role migration to seed the first admin accounts.

Admins can create, edit, archive, restore, price, and stock products from the
commerce admin page.

Google and Apple sign-in use the authorization-code flow. Configure provider
credentials in `backend/.env`, set `BACKEND_ORIGIN` to the public API origin,
and register these provider callback URLs:

- `${BACKEND_ORIGIN}/auth/oauth/google/callback`
- `${BACKEND_ORIGIN}/auth/oauth/apple/callback`

Apple requires a currently valid signed client-secret JWT. OAuth identities can
be linked from `/security`, where customers can also review active sessions and
recent successful or failed login activity.

To require Cloudflare Turnstile on password login and registration, set
`TURNSTILE_SECRET_KEY` in the backend and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in
the frontend. Leave both unset for local development without bot verification.

### Staff roles

Only `admin` users can assign roles. The available database-backed roles are:

- `admin`: unrestricted administration and role management
- `catalog`: products, categories, bundles, images, and review moderation
- `fulfillment`: order visibility, fulfillment, returns, and shipping labels
- `support`: order visibility, support tickets, and review moderation
- `operations`: payment operations, reports, promotions, and gift cards
- `customer`: no staff permissions

Two-factor recovery codes are single-use. Customers can regenerate them or
disable two-factor authentication from `/security` after entering a current
authenticator or recovery code.

Customers can download a portable JSON copy of their account data or permanently
delete their account from `/profile`. Deletion removes account-owned data and
anonymizes retained commerce and security-audit records.

Out-of-stock product and variant pages accept one-time email alert subscriptions.
The maintenance job delivers alerts after inventory becomes available; run it
directly with `pnpm run job:stock-alerts`.

Paid orders earn one loyalty point per whole pound. Customers can view their
reward ledger and share or apply referral codes from `/profile`; both customers
receive 500 points after the referred customer's first confirmed payment.

The storefront keeps device-local recently viewed products and records
authenticated viewing history for category-based personalized recommendations.
Viewing history is included in account exports and removed with the account.

Product search provides debounced autocomplete suggestions and falls back to a
bounded typo-tolerant matcher when exact name, brand, and description search
returns no products.

Catalog and operations staff can manage suppliers, warehouses, warehouse stock,
and purchase orders from `/admin`. Receiving a purchase order transactionally
updates the destination warehouse and storefront product stock.

The primary storefront and navigation support persistent English and Burmese
locales. Customers can switch language from the navigation bar; the preference
is stored on their device and updates the document language.

Each active product has a public `/products/:id` API and storefront detail page
with description, price, availability, and add-to-cart support.

Admins can upload JPEG, PNG, and WebP product images up to 2 MB. Images are
stored under the backend public uploads directory and displayed as storefront
galleries. Set `NEXT_PUBLIC_BACKEND_ORIGIN` to the backend's public origin.
