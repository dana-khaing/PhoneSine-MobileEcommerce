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

const pendingOrder = {
  id: 43,
  status: "pending",
  email: "waiting@example.com",
  currency: "gbp",
  totalAmount: 69900,
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

const category = { id: 1, name: "Phones" };
const promotion = { id: 3, code: "SUMMER20", percentOff: 20, useCount: 4, maxUses: 100 };
const user = { id: 5, email: "admin-customer@example.com", role: "customer", emailVerifiedAt: "2026-06-01T10:00:00.000Z" };
const review = { id: 8, rating: 2, title: "Needs review", body: "Please moderate this.", status: "pending" };
const ticket = { id: 9, subject: "Screen issue", message: "The display flickers.", status: "open" };
const giftCard = { id: 10, code: "GIFT-2026", balanceAmount: 5000, currency: "gbp" };
const bundle = { id: 11, name: "Starter kit", priceAmount: 109900, active: true };
const supplier = { id: 12, name: "PhoneSine Supply", email: "supply@example.com", phone: "123" };
const warehouse = { id: 13, name: "London Hub", code: "LDN", address: { city: "London" }, stocks: [{ id: 1, product, quantity: 20 }] };
const purchaseOrder = {
  id: 14,
  supplier,
  warehouse,
  status: "ordered",
  totalAmount: 50000,
  items: [{ id: 15, product, quantity: 10, receivedQuantity: 0 }],
};

function captureRuntimeIssues(page) {
  const issues = [];
  page.on("pageerror", (error) => issues.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Failed to load resource")) issues.push(message.text());
  });
  return issues;
}

function trackAdminCalls(page) {
  const adminCalls = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith("/admin/")) adminCalls.push({ method: request.method(), path: url.pathname });
  });
  return {
    expectAdminCall: async (method, path) => {
      await expect.poll(() => adminCalls.some((call) => call.method === method && call.path === path)).toBe(true);
    },
  };
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
    if (path === "/admin/analytics") {
      return route.fulfill({
        json: {
          orders: 3,
          revenue: 329900,
          lowStock: [{ id: 1, name: "Phone Sine Pro", stockQuantity: 1, reservedQuantity: 1 }],
          dashboard: {
            generatedAt: "2026-06-18T09:00:00.000Z",
            cards: [
              { id: "orders", label: "Total orders", value: 3, helper: "2 paid" },
              { id: "revenue", label: "Paid revenue", value: 329900, format: "currency", helper: "25% vs previous 30 days" },
              { id: "conversion", label: "Order conversion", value: 67, suffix: "%", helper: "1 pending checkout" },
              { id: "stock", label: "Available stock", value: 18, helper: "1 low-stock items" },
            ],
            revenueTrend: { current30Days: 329900, previous30Days: 250000, percentChange: 32 },
            funnel: { productViews: 41, orders: 3, paidOrders: 2, conversionRate: 67 },
            orderStatuses: { paid: 2, pending: 1, refunds: 0 },
            stock: { total: 20, reserved: 2, available: 18, lowStock: [{ id: 1, name: "Phone Sine Pro", stockQuantity: 1, reservedQuantity: 1 }] },
            topProducts: [{ productId: 1, name: "Phone Sine Pro", units: 4 }],
          },
        },
      });
    }
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
    if (path === "/admin/orders") return route.fulfill({ json: [order, pendingOrder] });
    if (path === "/admin/products") return route.fulfill({ json: [{ ...product, active: true, categoryId: 1, category }] });
    if (path === "/admin/categories") return route.fulfill({ json: [category] });
    if (path === "/admin/promotions") return route.fulfill({ json: [promotion] });
    if (path === "/admin/users") return route.fulfill({ json: [user] });
    if (path === "/admin/reviews") return route.fulfill({ json: [review] });
    if (path === "/admin/returns") return route.fulfill({ json: [{ id: 7, orderId: 42, reason: "Damaged", status: "requested" }] });
    if (path === "/admin/tickets") return route.fulfill({ json: [ticket] });
    if (path === "/admin/gift-cards") return route.fulfill({ json: [giftCard] });
    if (path === "/admin/bundles") return route.fulfill({ json: [bundle] });
    if (path === "/admin/suppliers") return route.fulfill({ json: [supplier] });
    if (path === "/admin/warehouses") return route.fulfill({ json: [warehouse] });
    if (path === "/admin/purchase-orders") return route.fulfill({ json: [purchaseOrder] });
    if (["POST", "PATCH", "DELETE"].includes(route.request().method()) && path.startsWith("/admin/")) return route.fulfill({ json: { ok: true } });
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
  await expect(page.getByRole("link", { name: "Catalog" })).toBeVisible();
  await expect(page.getByPlaceholder("Search orders, products, users...")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Realtime commerce performance" })).toBeVisible();
  await expect(page.getByText("Order conversion")).toBeVisible();
  await expect(page.getByText("41 product views")).toBeVisible();
  await expect(page.getByText("Phone Sine Pro: 4 units")).toBeVisible();
  await expect(page.getByText("Order #42", { exact: true })).toBeVisible();
  await expect(page.getByText("Damaged")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create shipping label" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Download report" })).toBeVisible();
});

test("filters admin records with search and order status controls", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByText("2 of 2 orders shown")).toBeVisible();
  await page.getByPlaceholder("Search orders, products, users...").fill("waiting@example.com");
  await expect(page.getByText("1 of 2 orders shown")).toBeVisible();
  await expect(page.getByText("Order #43", { exact: true })).toBeVisible();
  await expect(page.getByText("Order #42", { exact: true })).toBeHidden();

  await page.getByPlaceholder("Search orders, products, users...").fill("");
  await page.getByLabel("Filter orders by status").selectOption("paid");
  await expect(page.getByText("1 of 2 orders shown")).toBeVisible();
  await expect(page.getByText("Order #42", { exact: true })).toBeVisible();
  await expect(page.getByText("Order #43", { exact: true })).toBeHidden();
});

test("supports admin product, category, and variant management", async ({ page }) => {
  const { expectAdminCall } = trackAdminCalls(page);

  await page.goto("/admin");
  const productManagement = page.getByRole("heading", { name: "Product management" }).locator("..");
  await expect(productManagement.getByText("Phone Sine Pro · 5 stock / 1 reserved · active")).toBeVisible();
  await expect(productManagement.getByText("Phones").last()).toBeVisible();

  await productManagement.getByRole("button", { name: "Edit" }).click();
  await expect(productManagement.getByRole("button", { name: "Save product" })).toBeVisible();
  await productManagement.getByPlaceholder("stockQuantity").first().fill("12");
  await productManagement.getByRole("button", { name: "Save product" }).click();
  await expectAdminCall("PATCH", "/admin/products/1");

  await productManagement.getByPlaceholder("New category name").fill("Accessories");
  await productManagement.getByRole("button", { name: "Create category" }).click();
  await expectAdminCall("POST", "/admin/categories");

  await productManagement.getByRole("combobox").last().selectOption("1");
  await productManagement.getByPlaceholder("sku").fill("PS-GOLD");
  await productManagement.getByPlaceholder("name").last().fill("Gold");
  await productManagement.getByPlaceholder("priceAmount").last().fill("109900");
  await productManagement.getByPlaceholder("stockQuantity").last().fill("6");
  await productManagement.getByPlaceholder(/options JSON/).fill('{"color":"Gold"}');
  await productManagement.getByRole("button", { name: "Create variant" }).click();
  await expectAdminCall("POST", "/admin/products/1/variants");
});

test("supports admin promotion, user role, and review workflows", async ({ page }) => {
  const { expectAdminCall } = trackAdminCalls(page);
  await page.goto("/admin");

  const promotions = page.getByRole("heading", { name: "Promotions" }).locator("..");
  await expect(promotions.getByText("SUMMER20: 20% · 4/100 uses")).toBeVisible();
  await promotions.getByPlaceholder("code").fill("VIP25");
  await promotions.getByPlaceholder("percentOff").fill("25");
  await promotions.getByPlaceholder("maxUses").fill("50");
  await promotions.getByPlaceholder("perCustomerLimit").fill("2");
  await promotions.getByRole("button", { name: "Create promotion" }).click();
  await expectAdminCall("POST", "/admin/promotions");

  const users = page.getByRole("heading", { name: "User roles" }).locator("..");
  await expect(users.getByText("admin-customer@example.com · customer · verified")).toBeVisible();
  await users.getByRole("combobox").selectOption("admin");
  await expectAdminCall("PATCH", "/admin/users/5/role");

  const reviews = page.getByRole("heading", { name: "Review moderation" }).locator("..");
  await expect(reviews.getByText("2/5 · Needs review")).toBeVisible();
  await reviews.getByRole("button", { name: "Approve" }).click();
  await expectAdminCall("PATCH", "/admin/reviews/8");
});

test("supports admin support, gift card, bundle, and procurement workflows", async ({ page }) => {
  const { expectAdminCall } = trackAdminCalls(page);
  await page.goto("/admin");

  const support = page.getByRole("heading", { name: "Support tickets" }).locator("..");
  await expect(support.getByText("Screen issue · open")).toBeVisible();
  await support.getByPlaceholder("Reply to customer").fill("We will replace the display.");
  await support.getByRole("button", { name: "Reply and close" }).click();
  await expectAdminCall("PATCH", "/admin/tickets/9");

  const giftCards = page.getByRole("heading", { name: "Gift cards" }).locator("..");
  await expect(giftCards.getByText("GIFT-2026 · GBP 50.00")).toBeVisible();
  await giftCards.getByPlaceholder("Balance in pence").fill("7500");
  await giftCards.getByRole("button", { name: "Issue gift card" }).click();
  await expectAdminCall("POST", "/admin/gift-cards");

  const bundles = page.getByRole("heading", { name: "Product bundles" }).locator("..");
  await expect(bundles.getByText("Starter kit · £1099.00 · active")).toBeVisible();
  await bundles.getByRole("button", { name: "Deactivate" }).click();
  await expectAdminCall("PATCH", "/admin/bundles/11");

  const procurement = page.getByRole("heading", { name: "Inventory procurement" }).locator("..");
  await expect(procurement.getByText("PO #14 · PhoneSine Supply · ordered")).toBeVisible();
  await procurement.getByPlaceholder(/^name$/).fill("Backup Supplier");
  await procurement.getByPlaceholder("email").fill("backup@example.com");
  await procurement.getByRole("button", { name: "Create supplier" }).click();
  await expectAdminCall("POST", "/admin/suppliers");
  await procurement.getByRole("button", { name: "Receive order" }).click();
  await expectAdminCall("POST", "/admin/purchase-orders/14/receive");
});
