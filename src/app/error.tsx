"use client";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex max-w-lg flex-col gap-5">
      <h1 className="page-title">Let’s reconnect your tracker.</h1>
      <Alert variant="destructive">
        <AlertTitle>Your data couldn’t be loaded</AlertTitle>
        <AlertDescription>
          Start MySQL in the XAMPP Control Panel, then try again. If this is
          your first run, follow the database setup steps in the README.
        </AlertDescription>
      </Alert>
      <Button onClick={reset} className="w-fit">
        Try again
      </Button>
    </section>
  );
}
