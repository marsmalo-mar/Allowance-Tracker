import { CheckCircle2, CircleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ActionState } from "@/lib/types";

export function FormNotice({ state }: { state: ActionState }) {
  if (!state.error && !state.success) return null;
  return (
    <Alert
      variant={state.error ? "destructive" : "default"}
      role={state.error ? "alert" : "status"}
    >
      {state.error ? (
        <CircleAlert aria-hidden="true" />
      ) : (
        <CheckCircle2 aria-hidden="true" />
      )}
      <AlertDescription>{state.error || state.success}</AlertDescription>
    </Alert>
  );
}
