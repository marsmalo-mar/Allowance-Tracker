"use client";

import { useActionState, useState } from "react";
import { saveAllowance } from "@/app/actions";
import { decimalAmount } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { FormNotice } from "./form-notice";

export function AllowanceForm({ allowance }: { allowance: number }) {
  const [state, action, pending] = useActionState(saveAllowance, {});
  const [amount, setAmount] = useState(decimalAmount(allowance));
  return (
    <form action={action} className="form-controls flex flex-col gap-5">
      <FormNotice state={state} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="monthlyAllowance">
            Monthly allowance (₱)
          </FieldLabel>
          <Input
            id="monthlyAllowance"
            name="monthlyAllowance"
            type="number"
            min="0"
            max="9999999999.99"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
          <FieldDescription>
            This is your monthly spending plan. Record received money separately
            as income.
          </FieldDescription>
        </Field>
      </FieldGroup>
      <Button type="submit" size="lg" disabled={pending} className="w-fit">
        {pending ? "Saving…" : "Save monthly allowance"}
      </Button>
    </form>
  );
}
