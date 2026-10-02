import { z } from "zod";
import { isValidDate, parseMoney } from "./finance";

const money = z
  .string()
  .trim()
  .refine((value) => {
    try {
      parseMoney(value);
      return true;
    } catch {
      return false;
    }
  }, "Enter an amount with up to two decimal places.")
  .transform(parseMoney);
const id = z.coerce.number().int().positive("Choose an existing item.");
const optionalId = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? null : value,
  id.nullable(),
);

export const transactionSchema = z
  .object({
    type: z.enum(["income", "expense", "transfer"]),
    amount: money.refine(
      (value) => value > 0,
      "Amount must be greater than zero.",
    ),
    date: z.string().refine(isValidDate, "Choose a valid date."),
    accountId: id,
    toAccountId: optionalId,
    categoryId: optionalId,
    description: z
      .string()
      .trim()
      .max(255, "Keep the description under 256 characters."),
  })
  .superRefine((value, context) => {
    if (
      value.type === "transfer" &&
      (!value.toAccountId || value.toAccountId === value.accountId)
    ) {
      context.addIssue({
        code: "custom",
        path: ["toAccountId"],
        message: "Choose two different accounts for a transfer.",
      });
    }
    if (value.type !== "transfer" && !value.categoryId) {
      context.addIssue({
        code: "custom",
        path: ["categoryId"],
        message: "Choose a matching category.",
      });
    }
  });

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required.").max(80),
  type: z.enum(["cash", "e-wallet", "bank", "investment", "other"]),
  startingBalance: money,
});
export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(80),
  type: z.enum(["income", "expense"]),
});
export const allowanceSchema = z.object({ monthlyAllowance: money });
