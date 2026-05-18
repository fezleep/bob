import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("link", { name: "Workspace", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /open command palette/i })).toBeVisible();
});

test("login and register pages load", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /sign in to bob/i })).toBeVisible();

  await page.goto("/register", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /start a calm workspace/i })).toBeVisible();
});

test("protected pages redirect when unauthenticated", async ({ page }) => {
  await page.goto("/workspace", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/login\?next=%2Fworkspace$/);
});

test("command palette trigger is present", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("button", { name: /open command palette/i })).toBeVisible();
});
