"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { decimalAmount } from "@/lib/finance";
import {
  accountSchema,
  categorySchema,
  transactionSchema,
  allowanceSchema,
} from "@/lib/validation";
import type { ActionState } from "@/lib/types";

function rowId(value: FormDataEntryValue | null): number | null {
  if (value === "" || value === null) return null;
  return z.coerce.number().int().min(1).max(4294967295).parse(value);
}

function errorState(error: unknown): ActionState {
  if (error instanceof z.ZodError)
    return {
      error: error.issues[0]?.message || "Check the details and try again.",
    };
  const code =
    error && typeof error === "object" && "code" in error ? error.code : null;
  if (code === "ER_DUP_ENTRY")
    return { error: "An item with that name already exists." };
  if (code === "ER_ROW_IS_REFERENCED_2")
    return {
      error: "This item has transactions. Keep it to preserve your history.",
    };
  if (code === "ER_NO_REFERENCED_ROW_2")
    return {
      error:
        "The account or category no longer exists. Reload and choose another.",
    };
  if (error instanceof UserError) return { error: error.message };
  console.error("Allowance database operation failed", { code });
  return {
    error:
      "Could not save your changes. Check that MySQL is running in XAMPP and try again.",
  };
}

class UserError extends Error {}

export async function saveTransaction(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  let connection;
  try {
    const input = transactionSchema.parse(Object.fromEntries(form));
    const id = rowId(form.get("id"));
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [accounts] = await connection.execute<RowDataPacket[]>(
      "SELECT id FROM accounts WHERE id IN (?,?) FOR UPDATE",
      [input.accountId, input.toAccountId],
    );
    if (
      !accounts.some((item) => item.id === input.accountId) ||
      (input.type === "transfer" &&
        !accounts.some((item) => item.id === input.toAccountId))
    ) {
      throw new UserError("Choose existing accounts.");
    }
    if (input.type !== "transfer") {
      const [categories] = await connection.execute<RowDataPacket[]>(
        "SELECT type FROM categories WHERE id=? FOR UPDATE",
        [input.categoryId],
      );
      if (categories[0]?.type !== input.type)
        throw new UserError(
          "Choose a category that matches the transaction type.",
        );
    }
    const values = [
      input.type,
      decimalAmount(input.amount),
      input.type === "transfer" ? null : input.categoryId,
      input.description,
      input.date,
      input.accountId,
      input.type === "transfer" ? input.toAccountId : null,
    ];
    if (id) {
      const [existing] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM transactions WHERE id=? FOR UPDATE",
        [id],
      );
      if (!existing.length)
        throw new UserError("This transaction no longer exists.");
      await connection.execute(
        "UPDATE transactions SET type=?,amount=?,category_id=?,description=?,date=?,account_id=?,to_account_id=? WHERE id=?",
        [...values, id],
      );
    } else {
      await connection.execute(
        "INSERT INTO transactions(type,amount,category_id,description,date,account_id,to_account_id) VALUES(?,?,?,?,?,?,?)",
        values,
      );
    }
    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback();
    return errorState(error);
  } finally {
    connection?.release();
  }
  revalidatePath("/", "layout");
  redirect("/transactions?saved=1");
}

export async function saveAccount(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const input = accountSchema.parse(Object.fromEntries(form));
    const id = rowId(form.get("id"));
    if (id) {
      const [result] = await db.execute<ResultSetHeader>(
        "UPDATE accounts SET name=?,type=?,starting_balance=? WHERE id=?",
        [input.name, input.type, decimalAmount(input.startingBalance), id],
      );
      if (!result.affectedRows)
        throw new UserError("This account no longer exists.");
    } else {
      await db.execute(
        "INSERT INTO accounts(name,type,starting_balance) VALUES(?,?,?)",
        [input.name, input.type, decimalAmount(input.startingBalance)],
      );
    }
    revalidatePath("/", "layout");
    return { success: id ? "Account updated." : "Account added." };
  } catch (error) {
    return errorState(error);
  }
}

export async function saveCategory(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  let connection;
  try {
    const input = categorySchema.parse(Object.fromEntries(form));
    const id = rowId(form.get("id"));
    connection = await db.getConnection();
    await connection.beginTransaction();
    if (id) {
      const [existing] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM categories WHERE id=? FOR UPDATE",
        [id],
      );
      if (!existing.length)
        throw new UserError("This category no longer exists.");
      const [used] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM transactions WHERE category_id=? AND type<>? LIMIT 1",
        [id, input.type],
      );
      if (used.length)
        throw new UserError(
          "A used category cannot change type. Create a new category instead.",
        );
      await connection.execute(
        "UPDATE categories SET name=?,type=? WHERE id=?",
        [input.name, input.type, id],
      );
    } else {
      await connection.execute(
        "INSERT INTO categories(name,type) VALUES(?,?)",
        [input.name, input.type],
      );
    }
    await connection.commit();
    revalidatePath("/", "layout");
    return { success: id ? "Category updated." : "Category added." };
  } catch (error) {
    if (connection) await connection.rollback();
    return errorState(error);
  } finally {
    connection?.release();
  }
}

export async function saveAllowance(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const input = allowanceSchema.parse(Object.fromEntries(form));
    await db.execute("UPDATE settings SET monthly_allowance=? WHERE id=1", [
      decimalAmount(input.monthlyAllowance),
    ]);
    revalidatePath("/", "layout");
    return { success: "Monthly allowance saved." };
  } catch (error) {
    return errorState(error);
  }
}

export async function deleteItem(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const kind = z
      .enum(["transaction", "account", "category"])
      .parse(form.get("kind"));
    const id = rowId(form.get("id"));
    if (!id) throw new UserError("Choose an existing item.");
    // The table name is chosen solely from this fixed allowlist, never user SQL.
    const table = {
      transaction: "transactions",
      account: "accounts",
      category: "categories",
    }[kind];
    const [result] = await db.execute<ResultSetHeader>(
      `DELETE FROM ${table} WHERE id=?`,
      [id],
    );
    if (!result.affectedRows)
      throw new UserError("This item no longer exists.");
    revalidatePath("/", "layout");
    return { success: "Deleted." };
  } catch (error) {
    return errorState(error);
  }
}
