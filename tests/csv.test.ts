import assert from "node:assert/strict";
import test from "node:test";
import { exportCsv } from "../src/lib/csv";
import type { Transaction } from "../src/lib/types";

test("CSV exports both transfer accounts, exact cents, and escaped notes", () => {
  const row: Transaction = {
    id: 1,
    type: "transfer",
    amount: 1010,
    date: "2026-10-02",
    description: 'Moved, "safely"',
    accountId: 1,
    toAccountId: 2,
    categoryId: null,
    accountName: "Cash",
    toAccountName: "GCash",
    categoryName: null,
  };
  const csv = exportCsv([row]);
  assert.ok(csv.includes('"Moved, ""safely"""'));
  assert.ok(csv.includes('"Cash","GCash","10.10"'));
});

test("CSV treats notes beginning with spreadsheet formulas as text", () => {
  const row: Transaction = {
    id: 1,
    type: "expense",
    amount: 100,
    date: "2026-10-02",
    description: '=HYPERLINK("unsafe")',
    accountId: 1,
    toAccountId: null,
    categoryId: 1,
    accountName: "Cash",
    toAccountName: null,
    categoryName: "Food",
  };
  assert.ok(exportCsv([row]).includes("\"'=HYPERLINK("));
});
