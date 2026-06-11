# To Run Frontend

pnpm run dev

// .env.local is for the frontend and can be request at the groupchat

# To Run Backend

pnpm run dev

// .env is for the backend and can be request at the groupchat

# To Run Database

localhost:8080/showall (to view all userdata api)
localhost:8080/deleteall (to delete all of the user data)

// Used MySQL for database
// We can store the user data in the database in the machine (Local ony though)
// Apart for machine, I'm really doubt that database can be run (I'll try to use only server)

# To Run Tests

Run `pnpm test` from both the `frontend` and `backend` directories.

# Stripe Checkout

Set `STRIPE_SECRET_KEY` and `FRONTEND_URL` in `backend/.env`, then set
`NEXT_PUBLIC_API_PAYMENT_URL` to the backend `/payments/create-checkout-session`
endpoint in `frontend/.env.local`.

Set `STRIPE_WEBHOOK_SECRET` in `backend/.env` and point Stripe webhooks to
`/payments/webhook`. Set `NEXT_PUBLIC_API_ORDERS_URL` to the backend `/orders`
endpoint for authenticated order history.

Copy the included `.env.example` files and replace placeholder values before
running checkout locally.
