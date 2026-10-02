import { test, expect } from "@playwright/test";

test("daily workflow saves a plan, records transactions, edits, transfers, filters, and exports", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/settings");
  await page.getByLabel("Monthly allowance (₱)").fill("5000");
  await page.getByRole("button", { name: "Save monthly allowance" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Monthly allowance saved.",
  );

  await page.goto("/transactions/new");
  await page.getByRole("button", { name: "Income", exact: true }).click();
  await page.getByLabel("Amount (₱)").fill("5000");
  await page.getByLabel("Note (optional)").fill("October allowance");
  await page.getByLabel("Date", { exact: true }).fill("2026-10-01");
  await page.getByRole("button", { name: "Save transaction" }).click();
  await expect(page).toHaveURL(/transactions\?saved=1/);
  await expect(page.getByRole("table")).toContainText("October allowance");

  await page.goto("/transactions/new");
  await page.getByLabel("Amount (₱)").fill("100.10");
  await page.getByLabel("Note (optional)").fill("Lunch");
  await page.getByLabel("Date", { exact: true }).fill("2026-10-02");
  await page.getByRole("button", { name: "Save transaction" }).click();
  await expect(page).toHaveURL(/transactions\?saved=1/);
  await page.getByRole("link", { name: "Edit Lunch", exact: true }).click();
  await expect(page.getByLabel("Category", { exact: true })).toHaveValue("1");
  await page.getByLabel("Amount (₱)").fill("125.25");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("table")).toContainText("125.25");

  await page.goto("/transactions/new");
  await page.getByRole("button", { name: "Transfer", exact: true }).click();
  await page.getByLabel("Amount (₱)").fill("500");
  await page.getByLabel("Note (optional)").fill("Move to wallet");
  await page.getByLabel("Date", { exact: true }).fill("2026-10-02");
  await page.getByRole("button", { name: "Save transaction" }).click();
  await expect(page).toHaveURL(/transactions\?saved=1/);

  await page.goto("/?month=2026-10");
  await expect(page.getByText("₱4,874.75", { exact: true })).toBeVisible();
  await expect(page.getByText("₱6,074.75", { exact: true })).toBeVisible();
  await expect(page.getByText("₱700.00", { exact: true })).toBeVisible();

  await page.goto("/transactions");
  await page.getByLabel("Search transactions").fill("Lunch");
  await expect(page.getByRole("table")).toContainText("Lunch");
  await expect(page.getByRole("table")).not.toContainText("October allowance");
  await page.getByLabel("Search transactions").fill("");
  await page.getByLabel("Filter transaction type").selectOption("transfer");
  await expect(page.getByRole("table")).toContainText("Move to wallet");
  await expect(page.getByRole("table")).not.toContainText("Lunch");
  await page.getByLabel("Filter transaction type").selectOption("all");
  await page.getByRole("button", { name: "Sort by amount" }).click();
  await expect(
    page
      .getByRole("columnheader")
      .filter({ has: page.getByRole("button", { name: "Sort by amount" }) }),
  ).toHaveAttribute("aria-sort", "ascending");

  const response = await page.request.get("/export");
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('"Cash","GCash","500.00"');
  await page.getByRole("button", { name: "Delete Lunch", exact: true }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.getByRole("table")).not.toContainText("Lunch");
  expect(errors).toEqual([]);
});

test("accounts and categories can be managed while used records stay protected", async ({
  page,
}) => {
  // This test creates its own used account, independent of the transaction test.
  await page.goto("/transactions/new");
  await page.getByRole("button", { name: "Income", exact: true }).click();
  await page.getByLabel("Amount (₱)").fill("10");
  await page.getByRole("button", { name: "Save transaction" }).click();
  await expect(page).toHaveURL(/transactions\?saved=1/);
  await page.goto("/accounts");
  await page.getByLabel("Account name").fill("Savings");
  await page.getByLabel("Opening balance (₱)").fill("300");
  await page.getByRole("button", { name: "Add account", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Savings", exact: true }),
  ).toBeVisible();
  const card = page.locator('[data-slot="card"]').filter({
    has: page.getByRole("heading", { name: "Savings", exact: true }),
  });
  await card.getByRole("link", { name: "Edit", exact: true }).click();
  await expect(page).toHaveURL(/accounts\/\d+\/edit/);
  await expect(page.getByLabel("Account name")).toHaveValue("Savings");
  await page.getByLabel("Account name").fill("Emergency cash");
  await page.getByRole("button", { name: "Save account", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Account updated.");
  await page.goto("/accounts");
  await page
    .getByRole("button", { name: "Delete Emergency cash", exact: true })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Emergency cash", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Delete Cash", exact: true }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.getByRole("alertdialog")).toContainText(
    "This item has transactions",
  );
  await page.getByRole("button", { name: "Keep it" }).click();

  await page.goto("/categories");
  await page.getByLabel("Category name").fill("Food");
  await page.getByRole("button", { name: "Add category", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "already exists" }),
  ).toBeVisible();
  await expect(page.getByLabel("Category name")).toHaveValue("Food");
  await page.getByLabel("Category name").fill("School supplies");
  await page.getByRole("button", { name: "Add category", exact: true }).click();
  await expect(
    page.getByText("School supplies", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Edit School supplies", exact: true })
    .click();
  await expect(page).toHaveURL(/categories\/\d+\/edit/);
  await expect(page.getByLabel("Category name")).toHaveValue("School supplies");
  await page.getByLabel("Category name").fill("Supplies");
  await page.getByRole("button", { name: "Save category" }).click();
  await expect(page.getByRole("status")).toContainText("Category updated.");
  await page.goto("/categories");
  await page
    .getByRole("button", { name: "Delete Supplies", exact: true })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.getByText("Supplies", { exact: true })).toHaveCount(0);
});

test("overview fits mobile and desktop without page overflow or runtime errors", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/?month=2026-10");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (width === 1440 || width === 320)
      await page.screenshot({
        path: testInfo.outputPath(`overview-${width}.png`),
        fullPage: true,
      });
  }
  expect(errors).toEqual([]);
});
