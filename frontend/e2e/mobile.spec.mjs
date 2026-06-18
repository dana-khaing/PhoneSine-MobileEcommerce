import { test, expect } from "@playwright/test";

const product = {
  id: 1,
  name: "Phone Sine Pro",
  brand: "PhoneSine",
  description: "Flagship phone",
  price: 999,
  priceAmount: 99900,
  stockQuantity: 5,
  reservedQuantity: 0,
  category: { id: 1, name: "Phones", slug: "phones" },
  images: [],
  variants: [],
};

const analytics = {
  orders: 3,
  revenue: 329900,
  lowStock: [{ id: 1, name: "Phone Sine Pro", stockQuantity: 1, reservedQuantity: 1 }],
  dashboard: {
    cards: [
      { id: "orders", label: "Total orders", value: 3, helper: "2 paid" },
      { id: "revenue", label: "Paid revenue", value: 329900, format: "currency", helper: "25% vs previous 30 days" },
      { id: "conversion", label: "Order conversion", value: 67, suffix: "%", helper: "1 pending checkout" },
      { id: "stock", label: "Available stock", value: 18, helper: "1 low-stock items" },
    ],
    revenueTrend: { current30Days: 329900, previous30Days: 250000, percentChange: 32 },
    funnel: { productViews: 41, orders: 3, paidOrders: 2, conversionRate: 67 },
    stock: { total: 20, reserved: 2, available: 18, lowStock: [] },
    topProducts: [{ productId: 1, name: "Phone Sine Pro", units: 4 }],
  },
};

async function mockMobileApi(page) {
  await page.route("http://localhost:8080/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    if (path === "/auth/refresh") return route.fulfill({ status: 401, body: "No session" });
    if (path === "/products") return route.fulfill({ json: [product] });
    if (path === "/categories") return route.fulfill({ json: [{ id: 1, name: "Phones", slug: "phones" }] });
    if (path === "/recommendations/personalized") return route.fulfill({ json: [product] });
    if (path === "/payments/quote") return route.fulfill({ json: { discountAmount: 0, taxAmount: 2000, taxRate: 20, totalAmount: 12000, currency: "gbp" } });
    if (path === "/admin/analytics") return route.fulfill({ json: analytics });
    if (path === "/admin/health/payments") return route.fulfill({ json: { pending: 0, reviews: 0, disputes: 0, failedNotifications: 0 } });
    if (path === "/admin/launch-status") {
      return route.fulfill({
        json: {
          ready: true,
          blockers: [],
          warnings: [],
          checklist: { completed: 2, total: 2, items: [{ id: "analytics", label: "Analytics dashboard", done: true }] },
          providers: [{ id: "stripe", label: "Stripe", ready: true, configured: 2, total: 2 }],
        },
      });
    }
    if (path === "/admin/orders") return route.fulfill({ json: [{ id: 42, status: "paid", email: "buyer@example.com", currency: "gbp", totalAmount: 129900, refunds: [] }] });
    if (path.startsWith("/admin/")) return route.fulfill({ json: [] });
    return route.fulfill({ status: 404, body: "Not mocked" });
  });
}

async function expectNoHorizontalOverflow(page) {
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

function captureRuntimeIssues(page) {
  const issues = [];
  page.on("pageerror", (error) => issues.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Failed to load resource")) issues.push(message.text());
  });
  return issues;
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockMobileApi(page);
});

test("captures mobile screenshots for primary commerce pages", async ({ page }, testInfo) => {
  const issues = captureRuntimeIssues(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("mobile-home.png"), fullPage: true });

  await page.addInitScript(() => localStorage.setItem("phone-sine-cart", JSON.stringify([{ id: 1, name: "Phone Sine Pro", price: 100, quantity: 1 }])));
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("mobile-checkout.png"), fullPage: true });

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Commerce admin" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Realtime commerce performance" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("mobile-admin.png"), fullPage: true });
  expect(issues).toEqual([]);
});
