import type { Transaction } from "./types";
import { decimalAmount } from "./finance";

function cell(value: string, protectFormula = true): string {
  const safe =
    protectFormula && /^\s*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function exportCsv(rows: Transaction[]): string {
  const header = [
    "Date",
    "Type",
    "Category",
    "Description",
    "Account",
    "To account",
    "Amount",
  ];
  const lines = rows.map((row) =>
    [
      row.date,
      row.type,
      row.categoryName || "Transfer",
      row.description,
      row.accountName,
      row.toAccountName || "",
      decimalAmount(row.amount),
    ]
      .map((value, index) => cell(value, index !== 6))
      .join(","),
  );
  return (
    "\uFEFF" +
    [header.map((value) => cell(value)).join(","), ...lines].join("\r\n") +
    "\r\n"
  );
}
