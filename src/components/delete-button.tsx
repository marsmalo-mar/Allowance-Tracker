"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteItem } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { FormNotice } from "./form-notice";
import type { ActionState } from "@/lib/types";

export function DeleteButton({
  kind,
  id,
  name,
}: {
  kind: "transaction" | "account" | "category";
  id: number;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    async (previous: ActionState, form: FormData) => {
      const result = await deleteItem(previous, form);
      if (result.success) setOpen(false);
      return result;
    },
    {},
  );
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={`Delete ${name}`} />
        }
      >
        <Trash2 aria-hidden="true" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this {kind}?</AlertDialogTitle>
          <AlertDialogDescription>
            {kind === "transaction"
              ? "This removes the entry and recalculates your balances. This cannot be undone."
              : "Items used by transactions cannot be deleted, so your history stays intact."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FormNotice state={state} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep it</AlertDialogCancel>
          <form action={action}>
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
