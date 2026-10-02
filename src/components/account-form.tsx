"use client";

import { useActionState, useId, useState } from "react";
import { saveAccount } from "@/app/actions";
import type { Account, ActionState } from "@/lib/types";
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
import { FormNotice } from "./form-notice";

export function AccountForm({ account }: { account?: Account }) {
  const [name, setName] = useState(account?.name || "");
  const [type, setType] = useState(account?.type || "cash");
  const [balance, setBalance] = useState(
    decimalAmount(account?.startingBalance || 0),
  );
  const [state, action, pending] = useActionState(
    async (previous: ActionState, form: FormData) => {
      const result = await saveAccount(previous, form);
      if (result.success && !account) {
        setName("");
        setType("cash");
        setBalance("0.00");
      }
      return result;
    },
    {},
  );
  const prefix = useId();
  return (
    <form action={action} className="form-controls flex flex-col gap-5">
      <input type="hidden" name="id" value={account?.id || ""} />
      <FormNotice state={state} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${prefix}-name`}>Account name</FieldLabel>
          <Input
            id={`${prefix}-name`}
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Cash or GCash"
            maxLength={80}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${prefix}-type`}>Account type</FieldLabel>
          <NativeSelect
            id={`${prefix}-type`}
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value as Account["type"])}
          >
            {["cash", "e-wallet", "bank", "investment", "other"].map((kind) => (
              <NativeSelectOption key={kind} value={kind}>
                {kind}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${prefix}-balance`}>
            Opening balance (₱)
          </FieldLabel>
          <Input
            id={`${prefix}-balance`}
            name="startingBalance"
            type="number"
            min="0"
            max="9999999999.99"
            step="0.01"
            value={balance}
            onChange={(event) => setBalance(event.target.value)}
            required
          />
          <FieldDescription>
            The amount you had before you began recording transactions.{" "}
            {account && "Changing this will adjust the current balance."}
          </FieldDescription>
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={pending} size="lg" className="w-fit">
        {pending ? "Saving…" : account ? "Save account" : "Add account"}
      </Button>
    </form>
  );
}
