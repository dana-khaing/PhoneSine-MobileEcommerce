import { test, expect } from "@playwright/test";

const order = {
  id: 42,
  status: "paid",
  email: "buyer@example.com",
  currency: "gbp",
  totalAmount: 129900,
  refunds: [],
  events: [],
};

async function mockApi(page) {
  await page.route("http://localhost:8080/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    if (path === "/auth/verify-email") return route.fulfill({ json: { verified: true } });
    if (path === "/auth/refresh") return route.fulfill({ status: 401, body: "No session" });
    if (path === "/payments/quote") return route.fulfill({ json: { discountAmount: 1000, taxAmount: 2000, taxRate: 20, totalAmount: 12000, currency: "gbp" } });
    if (path === "/admin/analytics") return route.fulfill({ json: { orders: 1, revenue: 129900, lowStock: [] } });
    if (path === "/admin/health/payments") return route.fulfill({ json: { pending: 0, reviews: 0, disputes: 0, failedNotifications: 0 } });
    if (path === "/admin/orders") return route.fulfill({ json: [order] });
    if (path === "/admin/returns") return route.fulfill({ json: [{ id: 7, orderId: 42, reason: "Damaged", status: "requested" }] });
    if (path.startsWith("/admin/")) return route.fulfill({ json: [] });
    return route.fulfill({ status: 404, body: "Not mocked" });
  });
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("calculates a checkout quote from the browser flow", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("phone-sine-cart", JSON.stringify([{ id: 1, name: "Phone Sine Pro", price: 100, quantity: 1 }])));
  await page.goto("/checkout");
  await page.getByPlaceholder("Email").fill("buyer@example.com");
  await page.getByPlaceholder("First name").fill("Dana");
  await page.getByPlaceholder("Last name").fill("Khaing");
  await page.getByPlaceholder("Address").fill("1 High Street");
  await page.getByPlaceholder("City").fill("London");
  await page.getByPlaceholder("Postcode").fill("SW1A 1AA");
  await page.getByRole("button", { name: "Update tax and promotion" }).click();
  await expect(page.getByText("Tax (20%)")).toBeVisible();
  await expect(page.getByText("GBP 120.00")).toBeVisible();
});

test("verifies an email token", async ({ page }) => {
  await page.goto("/verify-email?token=test-token");
  await expect(page.getByText("Your email is verified. You can now sign in.")).toBeVisible();
});

test("shows admin returns, shipping, and operations controls", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Commerce admin" })).toBeVisible();
  await expect(page.getByText("Order #42", { exact: true })).toBeVisible();
  await expect(page.getByText("Damaged")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create shipping label" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download report" })).toBeVisible();
});
