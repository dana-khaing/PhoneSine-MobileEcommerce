FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG API_ORIGIN=http://localhost:8080
ENV NEXT_PUBLIC_API_ADMIN_URL=${API_ORIGIN}/admin \
    NEXT_PUBLIC_API_FORGOT_PASSWORD_URL=${API_ORIGIN}/auth/forgot-password \
    NEXT_PUBLIC_API_LOGIN_URL=${API_ORIGIN}/auth/login \
    NEXT_PUBLIC_API_LOGOUT_URL=${API_ORIGIN}/auth/logout \
    NEXT_PUBLIC_API_ORDERS_URL=${API_ORIGIN}/orders \
    NEXT_PUBLIC_API_PAYMENT_METHODS_URL=${API_ORIGIN}/payment-methods \
    NEXT_PUBLIC_API_PAYMENT_QUOTE_URL=${API_ORIGIN}/payments/quote \
    NEXT_PUBLIC_API_PAYMENT_STATUS_URL=${API_ORIGIN}/payments/checkout-session \
    NEXT_PUBLIC_API_PAYMENT_URL=${API_ORIGIN}/payments/create-checkout-session \
    NEXT_PUBLIC_API_REFRESH_URL=${API_ORIGIN}/auth/refresh \
    NEXT_PUBLIC_API_REGISTER_URL=${API_ORIGIN}/auth/register \
    NEXT_PUBLIC_API_RESET_PASSWORD_URL=${API_ORIGIN}/auth/reset-password \
    NEXT_PUBLIC_API_REVIEWS_URL=${API_ORIGIN}/reviews \
    NEXT_PUBLIC_API_SAVED_URL=${API_ORIGIN}/saved \
    NEXT_PUBLIC_API_VERIFY_EMAIL_URL=${API_ORIGIN}/auth/verify-email \
    NEXT_PUBLIC_BACKEND_ORIGIN=${API_ORIGIN} \
    NEXT_PUBLIC_PRODUCT_LIST_URL=${API_ORIGIN}/products
RUN pnpm build
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:3000/products || exit 1
CMD ["pnpm", "start"]
