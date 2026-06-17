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

const product = {
  id: 1,
  name: "Phone Sine Pro",
  brand: "PhoneSine",
  description: "Flagship phone",
  priceAmount: 99900,
  stockQuantity: 5,
  reservedQuantity: 1,
  specifications: { screen: "6.1 inch" },
  category: { id: 1, name: "Phones" },
  images: [{ id: 1, url: "/uploads/phone.png", altText: "Phone Sine Pro" }],
  variants: [{ id: 11, name: "Black", sku: "PS-BLK", priceAmount: 99900, stockQuantity: 3, reservedQuantity: 0 }],
};

function captureRuntimeIssues(page) {
  const issues = [];
  page.on("pageerror", (error) => issues.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Failed to load resource")) issues.push(message.text());
  });
  return issues;
}

async function mockApi(page) {
  await page.route("http://localhost:8080/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    if (path === "/auth/verify-email") return route.fulfill({ json: { verified: true } });
    if (path === "/auth/refresh") return route.fulfill({ status: 401, body: "No session" });
    if (path === "/uploads/phone.png") return route.fulfill({ contentType: "image/png", body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/l9Jv8wAAAABJRU5ErkJggg==", "base64") });
    if (path === "/products/1") return route.fulfill({ json: product });
    if (path === "/products/1/recommendations") return route.fulfill({ json: [{ ...product, id: 2, name: "Phone Sine Mini", priceAmount: 69900, variants: [] }] });
    if (path === "/recommendations/views/1") return route.fulfill({ json: { recorded: true } });
    if (path === "/reviews/products/1") return route.fulfill({ json: { averageRating: 4.5, reviewCount: 2, reviews: [] } });
    if (path === "/saved/wishlist") return route.fulfill({ json: { id: 1 } });
    if (path === "/customer/tickets") return route.fulfill({ json: [{ id: 1, subject: "Need help", status: "open" }] });
    if (path === "/customer/gift-cards/GIFT") return route.fulfill({ json: { balanceAmount: 2500, currency: "gbp" } });
    if (path === "/payments/quote") return route.fulfill({ json: { discountAmount: 1000, taxAmount: 2000, taxRate: 20, totalAmount: 12000, currency: "gbp" } });
    if (path === "/admin/analytics") return route.fulfill({ json: { orders: 1, revenue: 129900, lowStock: [] } });
    if (path === "/admin/health/payments") return route.fulfill({ json: { pending: 0, reviews: 0, disputes: 0, failedNotifications: 0 } });
    if (path === "/admin/launch-status") {
      return route.fulfill({
        json: {
          ready: true,
          blockers: [],
          warnings: [],
          checklist: {
            completed: 2,
            total: 2,
            items: [
              { key: "readiness", label: "Production readiness", complete: true },
              { key: "stripe", label: "Stripe configured", complete: true },
            ],
          },
          providers: [
            { key: "stripe", label: "Stripe", ready: true, configured: 2, total: 2 },
          ],
        },
      });
    }
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

test("renders product detail from backend amount fields without runtime errors", async ({ page }) => {
  const issues = captureRuntimeIssues(page);
  await page.goto("/products/1");
  await expect(page.getByRole("heading", { name: "Phone Sine Pro" })).toBeVisible();
  await expect(page.getByText("£999.00", { exact: true })).toBeVisible();
  await expect(page.getByText("4.5 / 5 from 2 reviews")).toBeVisible();
  await expect(page.getByText("Phone Sine Mini · £699.00")).toBeVisible();
  expect(issues).toEqual([]);
});

test("renders support with recent products without hydration or effect errors", async ({ page }) => {
  const issues = captureRuntimeIssues(page);
  await page.addInitScript(() => localStorage.setItem("phone-sine-recent", JSON.stringify([{ id: 1, name: "Phone Sine Pro" }])));
  await page.goto("/support");
  await expect(page.getByRole("heading", { name: "Customer support" })).toBeVisible();
  await expect(page.getByText("Need help · open")).toBeVisible();
  await expect(page.getByRole("link", { name: "Phone Sine Pro" })).toBeVisible();
  expect(issues).toEqual([]);
});

test("shows admin returns, shipping, and operations controls", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Commerce admin" })).toBeVisible();
  await expect(page.getByText("Order #42", { exact: true })).toBeVisible();
  await expect(page.getByText("Damaged")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create shipping label" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download report" })).toBeVisible();
});
