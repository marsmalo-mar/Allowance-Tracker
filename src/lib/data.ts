import "server-only";
import type { RowDataPacket } from "mysql2";
import { db } from "./db";
import { calculateBalances, parseMoney } from "./finance";
import type { Snapshot, AccountType, TransactionType } from "./types";

interface AccountRow extends RowDataPacket {
  id: number;
  name: string;
  type: AccountType;
  starting_balance: string;
}
interface CategoryRow extends RowDataPacket {
  id: number;
  name: string;
  type: "income" | "expense";
}
interface TransactionRow extends RowDataPacket {
  id: number;
  type: TransactionType;
  amount: string;
  description: string;
  date: string;
  account_id: number;
  to_account_id: number | null;
  category_id: number | null;
  account_name: string;
  to_account_name: string | null;
  category_name: string | null;
}

export async function getSnapshot(): Promise<Snapshot> {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [accounts] = await connection.query<AccountRow[]>(
      "SELECT * FROM accounts ORDER BY name",
    );
    const [categories] = await connection.query<CategoryRow[]>(
      "SELECT * FROM categories ORDER BY type,name",
    );
    const [rows] = await connection.query<
      TransactionRow[]
    >(`SELECT t.*,a.name account_name,ta.name to_account_name,c.name category_name
      FROM transactions t JOIN accounts a ON a.id=t.account_id LEFT JOIN accounts ta ON ta.id=t.to_account_id
      LEFT JOIN categories c ON c.id=t.category_id ORDER BY t.date DESC,t.id DESC`);
    const [settings] = await connection.query<RowDataPacket[]>(
      "SELECT monthly_allowance FROM settings WHERE id=1",
    );
    await connection.commit();
    const transactions = rows.map((row) => ({
      id: row.id,
      type: row.type,
      amount: parseMoney(row.amount),
      description: row.description,
      date: row.date,
      accountId: row.account_id,
      toAccountId: row.to_account_id,
      categoryId: row.category_id,
      accountName: row.account_name,
      toAccountName: row.to_account_name,
      categoryName: row.category_name,
    }));
    const normalized = accounts.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      startingBalance: parseMoney(row.starting_balance),
    }));
    const balances = calculateBalances(normalized, transactions);
    return {
      accounts: normalized.map((account) => ({
        ...account,
        balance: balances.get(account.id) ?? 0,
      })),
      categories: categories.map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type,
      })),
      transactions,
      monthlyAllowance: parseMoney(settings[0]?.monthly_allowance || "0"),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
