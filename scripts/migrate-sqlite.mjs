import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync, backup } from "node:sqlite";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { connect, createSchema, databaseName } from "./database.mjs";

const sourcePath = resolve(process.argv[2] || "finance.db");
if (!existsSync(sourcePath))
  throw new Error(`SQLite source not found: ${sourcePath}`);
const source = new DatabaseSync(sourcePath, { readOnly: true });
const rows = (table) =>
  source.prepare(`SELECT * FROM ${table} ORDER BY id`).all();
source.exec("BEGIN");
const data = {
  accounts: rows("accounts"),
  categories: rows("categories"),
  transactions: rows("transactions"),
};
const hasSettings = source
  .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='settings'")
  .get();
const allowance = hasSettings
  ? source.prepare("SELECT monthly_allowance FROM settings WHERE id=1").get()
      ?.monthly_allowance || 0
  : 0;
source.exec("COMMIT");

function money(value) {
  const number = Number(value);
  if (
    !Number.isFinite(number) ||
    number < 0 ||
    number >= 10000000000 ||
    Math.abs(number * 100 - Math.round(number * 100)) > 0.00001
  ) {
    throw new Error(
      "A legacy amount is invalid or has more than two decimal places. Import stopped without changing the destination.",
    );
  }
  return number.toFixed(2);
}

function balances(accounts, transactions) {
  const totals = new Map(
    accounts.map((row) => [
      row.id,
      Math.round(Number(row.starting_balance) * 100),
    ]),
  );
  for (const row of transactions) {
    const cents = Math.round(Number(row.amount) * 100);
    totals.set(
      row.account_id,
      totals.get(row.account_id) + (row.type === "income" ? cents : -cents),
    );
    if (row.type === "transfer")
      totals.set(row.to_account_id, totals.get(row.to_account_id) + cents);
  }
  return [...totals.entries()].sort((a, b) => a[0] - b[0]);
}

function fingerprint(row, table) {
  const normalized = { ...row };
  for (const key of table === "accounts"
    ? ["starting_balance"]
    : table === "transactions"
      ? ["amount"]
      : [])
    normalized[key] = money(row[key]);
  if (table === "transactions") {
    normalized.description = row.description || "";
    normalized.created_at = String(row.created_at).slice(0, 19);
  }
  return createHash("sha256")
    .update(JSON.stringify(Object.entries(normalized).sort()))
    .digest("hex");
}

await createSchema();
const db = await connect();
let backupPath;
try {
  await db.beginTransaction();
  for (const table of Object.keys(data)) {
    const [counts] = await db.query(`SELECT COUNT(*) count FROM ${table}`);
    if (counts[0].count !== 0)
      throw new Error(
        "Destination contains records. Import refuses to overwrite or duplicate existing data; use a new DB_NAME to repeat a migration.",
      );
  }
  mkdirSync(resolve("backups"), { recursive: true });
  backupPath = resolve("backups", `finance-before-migration-${Date.now()}.db`);
  await backup(source, backupPath);
  for (const row of data.accounts) {
    await db.execute(
      "INSERT INTO accounts(id,name,type,starting_balance) VALUES(?,?,?,?)",
      [row.id, row.name, row.type, money(row.starting_balance)],
    );
  }
  for (const row of data.categories) {
    await db.execute("INSERT INTO categories(id,name,type) VALUES(?,?,?)", [
      row.id,
      row.name,
      row.type,
    ]);
  }
  for (const row of data.transactions) {
    const category = data.categories.find(
      (item) => item.id === row.category_id,
    );
    if (row.type !== "transfer" && category?.type !== row.type)
      throw new Error(
        `Legacy transaction ${row.id} has a mismatched category; import stopped.`,
      );
    await db.execute(
      "INSERT INTO transactions(id,type,amount,category_id,description,date,account_id,to_account_id,created_at) VALUES(?,?,?,?,?,?,?,?,?)",
      [
        row.id,
        row.type,
        money(row.amount),
        row.category_id,
        row.description || "",
        row.date,
        row.account_id,
        row.to_account_id,
        row.created_at,
      ],
    );
  }
  await db.execute("UPDATE settings SET monthly_allowance=? WHERE id=1", [
    money(allowance),
  ]);
  const copied = {};
  for (const table of Object.keys(data)) {
    const [records] = await db.query(`SELECT * FROM ${table} ORDER BY id`);
    copied[table] = records;
    assert.equal(records.length, data[table].length, `${table} count mismatch`);
    assert.deepEqual(
      records.map((row) => fingerprint(row, table)),
      data[table].map((row) => fingerprint(row, table)),
      `${table} records changed during migration`,
    );
  }
  assert.deepEqual(
    balances(copied.accounts, copied.transactions),
    balances(data.accounts, data.transactions),
    "Account balances changed during migration",
  );
  const [settings] = await db.query(
    "SELECT monthly_allowance FROM settings WHERE id=1",
  );
  assert.equal(
    settings[0].monthly_allowance,
    money(allowance),
    "Allowance changed during migration",
  );
  await db.commit();
  console.log(
    `Migrated into ${databaseName}: ${data.accounts.length} accounts, ${data.categories.length} categories, ${data.transactions.length} transactions. All records and balances verified.`,
  );
  console.log(
    `Recovery copy: ${backupPath}. Original SQLite file was opened read-only.`,
  );
} catch (error) {
  await db.rollback();
  throw error;
} finally {
  source.close();
  await db.end();
}
