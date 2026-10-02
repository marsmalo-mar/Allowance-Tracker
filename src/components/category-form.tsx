"use client";

import { useActionState, useId, useState } from "react";
import { saveCategory } from "@/app/actions";
import type { Category, ActionState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { FormNotice } from "./form-notice";

export function CategoryForm({ category }: { category?: Category }) {
  const [name, setName] = useState(category?.name || "");
  const [type, setType] = useState(category?.type || "expense");
  const [state, action, pending] = useActionState(
    async (previous: ActionState, form: FormData) => {
      const result = await saveCategory(previous, form);
      if (result.success && !category) {
        setName("");
        setType("expense");
      }
      return result;
    },
    {},
  );
  const prefix = useId();
  return (
    <form action={action} className="form-controls flex flex-col gap-5">
      <input type="hidden" name="id" value={category?.id || ""} />
      <FormNotice state={state} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${prefix}-name`}>Category name</FieldLabel>
          <Input
            id={`${prefix}-name`}
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Groceries"
            maxLength={80}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${prefix}-type`}>Transaction type</FieldLabel>
          <NativeSelect
            id={`${prefix}-type`}
            name="type"
            value={type}
            onChange={(event) =>
              setType(event.target.value as Category["type"])
            }
          >
            <NativeSelectOption value="expense">Expense</NativeSelectOption>
            <NativeSelectOption value="income">Income</NativeSelectOption>
          </NativeSelect>
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={pending} size="lg" className="w-fit">
        {pending ? "Saving…" : category ? "Save category" : "Add category"}
      </Button>
    </form>
  );
}
