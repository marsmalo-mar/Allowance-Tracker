"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveTransaction } from "@/app/actions";
import type {
  Account,
  Category,
  Transaction,
  TransactionType,
} from "@/lib/types";
import { decimalAmount } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormNotice } from "./form-notice";

export function TransactionForm({
  accounts,
  categories,
  today,
  transaction,
}: {
  accounts: Account[];
  categories: Category[];
  today: string;
  transaction?: Transaction;
}) {
  const [state, action, pending] = useActionState(saveTransaction, {});
  const [type, setType] = useState<TransactionType>(
    transaction?.type || "expense",
  );
  const [amount, setAmount] = useState(
    transaction ? decimalAmount(transaction.amount) : "",
  );
  const [description, setDescription] = useState(
    transaction?.description || "",
  );
  const [date, setDate] = useState(transaction?.date || today);
  const [accountId, setAccountId] = useState(
    String(transaction?.accountId || accounts[0]?.id || ""),
  );
  const [toAccountId, setToAccountId] = useState(
    String(
      transaction?.toAccountId ||
        accounts.find((row) => row.id !== Number(accountId))?.id ||
        "",
    ),
  );
  const [categoryId, setCategoryId] = useState(
    String(
      transaction?.categoryId ||
        categories.find((row) => row.type === type && row.name === "Food")
          ?.id ||
        categories.find((row) => row.type === type)?.id ||
        "",
    ),
  );
  const filteredCategories = categories.filter((row) => row.type === type);
  const ready =
    accounts.length > 0 &&
    (type === "transfer" ? accounts.length > 1 : filteredCategories.length > 0);

  function changeType(values: string[]) {
    const next = values[0] as TransactionType | undefined;
    if (!next) return;
    setType(next);
    if (
      !categories.some(
        (row) => row.id === Number(categoryId) && row.type === next,
      )
    ) {
      setCategoryId(
        String(
          categories.find(
            (row) => row.type === next && row.name === "Allowance",
          )?.id ||
            categories.find((row) => row.type === next)?.id ||
            "",
        ),
      );
    }
  }

  return (
    <form action={action} className="form-controls flex flex-col gap-6">
      <input type="hidden" name="id" value={transaction?.id || ""} />
      <input type="hidden" name="type" value={type} />
      <FormNotice state={state} />
      <FieldGroup>
        <Field>
          <FieldLabel id="type-label">What are you recording?</FieldLabel>
          <ToggleGroup
            value={[type]}
            onValueChange={changeType}
            variant="outline"
            aria-labelledby="type-label"
            className="w-full"
          >
            <ToggleGroupItem type="button" value="expense">
              Expense
            </ToggleGroupItem>
            <ToggleGroupItem type="button" value="income">
              Income
            </ToggleGroupItem>
            <ToggleGroupItem type="button" value="transfer">
              Transfer
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>
        <Field>
          <FieldLabel htmlFor="amount">Amount (₱)</FieldLabel>
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            min="0.01"
            max="9999999999.99"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            required
          />
        </Field>
        {type !== "transfer" && (
          <Field>
            <FieldLabel htmlFor="categoryId">Category</FieldLabel>
            <NativeSelect
              id="categoryId"
              name="categoryId"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
            >
              <NativeSelectOption value="" disabled>
                Select category
              </NativeSelectOption>
              {filteredCategories.map((row) => (
                <NativeSelectOption key={row.id} value={row.id}>
                  {row.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        )}
        <FieldGroup className="sm:flex-row">
          <Field>
            <FieldLabel htmlFor="accountId">
              {type === "transfer" ? "From account" : "Account"}
            </FieldLabel>
            <NativeSelect
              id="accountId"
              name="accountId"
              value={accountId}
              onChange={(event) => {
                setAccountId(event.target.value);
                if (event.target.value === toAccountId)
                  setToAccountId(
                    String(
                      accounts.find(
                        (row) => row.id !== Number(event.target.value),
                      )?.id || "",
                    ),
                  );
              }}
              required
            >
              <NativeSelectOption value="" disabled>
                Select account
              </NativeSelectOption>
              {accounts.map((row) => (
                <NativeSelectOption key={row.id} value={row.id}>
                  {row.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          {type === "transfer" && (
            <Field>
              <FieldLabel htmlFor="toAccountId">To account</FieldLabel>
              <NativeSelect
                id="toAccountId"
                name="toAccountId"
                value={toAccountId}
                onChange={(event) => setToAccountId(event.target.value)}
                required
              >
                <NativeSelectOption value="" disabled>
                  Select account
                </NativeSelectOption>
                {accounts
                  .filter((row) => row.id !== Number(accountId))
                  .map((row) => (
                    <NativeSelectOption key={row.id} value={row.id}>
                      {row.name}
                    </NativeSelectOption>
                  ))}
              </NativeSelect>
            </Field>
          )}
        </FieldGroup>
        <Field>
          <FieldLabel htmlFor="description">Note (optional)</FieldLabel>
          <Input
            id="description"
            name="description"
            maxLength={255}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={
              type === "expense"
                ? "e.g. Lunch with classmates"
                : "What was this for?"
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="date">Date</FieldLabel>
          <Input
            id="date"
            name="date"
            type="date"
            min="1900-01-01"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
          <FieldDescription>
            {type === "transfer"
              ? "Transfers move money between your accounts without changing your spending totals."
              : "A quick entry now makes your monthly picture clearer."}
          </FieldDescription>
        </Field>
      </FieldGroup>
      {!ready && (
        <Alert>
          <AlertDescription>
            {accounts.length === 0 || type === "transfer" ? (
              <Link href="/accounts" className="underline">
                Add {type === "transfer" ? "two accounts" : "an account"} first.
              </Link>
            ) : (
              <Link href="/categories" className="underline">
                Add a matching category first.
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}
      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={pending || !ready}>
          {pending
            ? "Saving…"
            : transaction
              ? "Save changes"
              : "Save transaction"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          render={<Link href="/transactions" />}
          nativeButton={false}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
