import assert from "node:assert/strict";
import test from "node:test";
import {
  parseMoney,
  isValidDate,
  summarize,
  calculateBalances,
} from "../src/lib/finance";
import { transactionSchema } from "../src/lib/validation";

test("money conversion preserves cents and rejects non-finite and sub-cent amounts", () => {
  assert.equal(parseMoney("10.10"), 1010);
  assert.equal(parseMoney("0.01"), 1);
  for (const input of [
    "NaN",
    "Infinity",
    "-1",
    "0.001",
    "1e3",
    "10000000000",
  ]) {
    assert.throws(() => parseMoney(input));
  }
});

test("dates must be actual calendar dates", () => {
  assert.equal(isValidDate("2024-02-29"), true);
  assert.equal(isValidDate("2026-02-29"), false);
  assert.equal(isValidDate("2026-04-31"), false);
  assert.equal(isValidDate("2026-13-01"), false);
});

test("opening balances and transfers preserve the total money across accounts", () => {
  const balances = calculateBalances(
    [
      { id: 1, startingBalance: 10000 },
      { id: 2, startingBalance: 5000 },
    ],
    [
      { type: "income", amount: 10010, accountId: 1, toAccountId: null },
      { type: "expense", amount: 2510, accountId: 1, toAccountId: null },
      { type: "transfer", amount: 7500, accountId: 1, toAccountId: 2 },
    ],
  );
  assert.equal(balances.get(1), 10000);
  assert.equal(balances.get(2), 12500);
  assert.equal(
    [...balances.values()].reduce((a, b) => a + b, 0),
    22500,
  );
});

test("monthly summary excludes transfers and other months", () => {
  const result = summarize(
    [
      { type: "income", amount: 500000, date: "2026-10-01" },
      { type: "expense", amount: 50000, date: "2026-10-02" },
      { type: "transfer", amount: 100000, date: "2026-10-02" },
      { type: "expense", amount: 99999, date: "2026-09-30" },
    ],
    "2026-10",
    500000,
  );
  assert.deepEqual(result, {
    income: 500000,
    expenses: 50000,
    remaining: 450000,
  });
});

test("validation rejects same-account transfers and missing categories", () => {
  const base = {
    type: "transfer",
    amount: "10.00",
    date: "2026-10-02",
    accountId: "1",
    toAccountId: "1",
    categoryId: "",
    description: "",
  };
  assert.equal(transactionSchema.safeParse(base).success, false);
  assert.equal(
    transactionSchema.safeParse({ ...base, toAccountId: "2" }).success,
    true,
  );
  assert.equal(
    transactionSchema.safeParse({ ...base, type: "expense", categoryId: "" })
      .success,
    false,
  );
  assert.equal(
    transactionSchema.safeParse({ ...base, amount: "0" }).success,
    false,
  );
});
