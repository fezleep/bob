import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("link", { name: "Workspace", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /open command palette/i })).toBeVisible();
});

test("about page loads", async ({ page }) => {
  await page.goto("/about", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: /quiet software for lead work/i })
  ).toBeVisible();
});

test("login and register pages load", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /sign in to bob/i })).toBeVisible();

  await page.goto("/register", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /start a calm workspace/i })).toBeVisible();
});

test("protected pages redirect when unauthenticated", async ({ page }) => {
  for (const path of ["/workspace", "/pipeline", "/leads"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path)}$`));
  }
});

test("command palette trigger is present", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("button", { name: /open command palette/i })).toBeVisible();
});

test("mobile unauthenticated navigation exposes auth actions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const mobileNav = page.getByRole("navigation", { name: /mobile navigation/i });
  await expect(mobileNav.getByRole("link", { name: "Login" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Register" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

test("command palette fits a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "load" });
  const trigger = page.getByRole("button", { name: /open command palette/i });

  await expect(trigger).toBeEnabled();
  await trigger.click();

  await expect(page.getByRole("dialog", { name: /command palette/i })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});
