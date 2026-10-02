import type { Transaction, Account } from "./types";

export function parseMoney(value: string): number {
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(value.trim())) {
    throw new Error("Enter a valid amount with up to two decimal places.");
  }
  const [whole, fraction = ""] = value.trim().split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function decimalAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(cents / 100);
}

export function localToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1900) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validMonth(value: unknown): string {
  return typeof value === "string" && isValidDate(`${value}-01`)
    ? value
    : localToday().slice(0, 7);
}

export function monthLabel(month: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
}

export function calculateBalances(
  accounts: Pick<Account, "id" | "startingBalance">[],
  transactions: Pick<
    Transaction,
    "type" | "amount" | "accountId" | "toAccountId"
  >[],
): Map<number, number> {
  const balances = new Map(
    accounts.map((account) => [account.id, account.startingBalance]),
  );
  for (const row of transactions) {
    const delta = row.type === "income" ? row.amount : -row.amount;
    balances.set(row.accountId, (balances.get(row.accountId) ?? 0) + delta);
    if (row.type === "transfer" && row.toAccountId !== null) {
      balances.set(
        row.toAccountId,
        (balances.get(row.toAccountId) ?? 0) + row.amount,
      );
    }
  }
  return balances;
}

export function summarize(
  rows: Pick<Transaction, "type" | "amount" | "date">[],
  month: string,
  allowance: number,
) {
  const selected = rows.filter((row) => row.date.startsWith(month));
  const income = selected
    .filter((row) => row.type === "income")
    .reduce((sum, row) => sum + row.amount, 0);
  const expenses = selected
    .filter((row) => row.type === "expense")
    .reduce((sum, row) => sum + row.amount, 0);
  return { income, expenses, remaining: allowance - expenses };
}
