# Production Providers

Configure these secrets in the deployment platform, never in Git:

- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Resend email: `RESEND_API_KEY`, `EMAIL_FROM`
- Twilio SMS: `ENABLE_SMS_NOTIFICATIONS=true`, `TWILIO_ACCOUNT_SID`,
  `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- Carrier adapter: `CARRIER_API_URL`, `CARRIER_API_KEY`, `SHIPPING_WEBHOOK_SECRET`

The carrier API must expose `POST /rates` and `POST /labels`. Label responses require
`carrier`, `service`, `trackingNumber`, and `labelUrl`.

Gift cards are redeemed transactionally during order creation. Stripe Checkout receives
the remaining order total after the gift-card deduction.

SMS delivery is opt-in. When enabled, orders with a shipping phone number receive
one-time order confirmation, shipping, delivery, refund, and dispute updates through
the same transactional notification outbox used for email.
