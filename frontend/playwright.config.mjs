import { defineConfig, devices } from "@playwright/test";

const api = "http://localhost:8080";

export default defineConfig({
  testDir: "./e2e",
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NEXT_PUBLIC_API_ADMIN_URL: `${api}/admin`,
      NEXT_PUBLIC_API_FORGOT_PASSWORD_URL: `${api}/auth/forgot-password`,
      NEXT_PUBLIC_API_LOGIN_URL: `${api}/auth/login`,
      NEXT_PUBLIC_API_LOGOUT_URL: `${api}/auth/logout`,
      NEXT_PUBLIC_API_ORDERS_URL: `${api}/orders`,
      NEXT_PUBLIC_API_PAYMENT_METHODS_URL: `${api}/payment-methods`,
      NEXT_PUBLIC_API_PAYMENT_QUOTE_URL: `${api}/payments/quote`,
      NEXT_PUBLIC_API_PAYMENT_STATUS_URL: `${api}/payments/checkout-session`,
      NEXT_PUBLIC_API_PAYMENT_URL: `${api}/payments/create-checkout-session`,
      NEXT_PUBLIC_API_REFRESH_URL: `${api}/auth/refresh`,
      NEXT_PUBLIC_API_REGISTER_URL: `${api}/auth/register`,
      NEXT_PUBLIC_API_RESET_PASSWORD_URL: `${api}/auth/reset-password`,
      NEXT_PUBLIC_API_REVIEWS_URL: `${api}/reviews`,
      NEXT_PUBLIC_API_SAVED_URL: `${api}/saved`,
      NEXT_PUBLIC_API_VERIFY_EMAIL_URL: `${api}/auth/verify-email`,
      NEXT_PUBLIC_BACKEND_ORIGIN: api,
      NEXT_PUBLIC_PRODUCT_LIST_URL: `${api}/products`,
    },
  },
});
