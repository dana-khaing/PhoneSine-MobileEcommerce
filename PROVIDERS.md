# Production Providers

Configure these secrets in the deployment platform, never in Git:

- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Resend email: `RESEND_API_KEY`, `EMAIL_FROM`
- Carrier adapter: `CARRIER_API_URL`, `CARRIER_API_KEY`, `SHIPPING_WEBHOOK_SECRET`

The carrier API must expose `POST /rates` and `POST /labels`. Label responses require
`carrier`, `service`, `trackingNumber`, and `labelUrl`.

Gift cards are redeemed transactionally during order creation. Stripe Checkout receives
the remaining order total after the gift-card deduction.
