import { getSnapshot } from "@/lib/data";
import { PageHeading } from "@/components/page-heading";
import { AllowanceForm } from "@/components/allowance-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function Settings() {
  const { monthlyAllowance } = await getSnapshot();
  return (
    <>
      <PageHeading
        title="A plan for the everyday."
        description="Decide how much you want to spend each month. We’ll help you follow it."
      />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Your monthly allowance</h2>
            </CardTitle>
            <CardDescription>
              A steady guide for your daily decisions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AllowanceForm allowance={monthlyAllowance} />
          </CardContent>
        </Card>
        <section className="flex flex-col gap-5 p-2">
          <h2 className="text-lg font-semibold">A simple daily routine</h2>
          <ol className="flex list-decimal flex-col gap-4 pl-5 text-sm text-muted-foreground">
            <li>
              When your allowance arrives, record it as income in the account
              that received it.
            </li>
            <li>Log the little expenses as they happen. A note is optional.</li>
            <li>
              Use a transfer when you move money from one account to another.
            </li>
            <li>
              Check your allowance left before the next purchase, and export
              your history occasionally.
            </li>
          </ol>
          <p className="text-xs text-muted-foreground">
            Your plan applies to every month you view. Account balances reflect
            all recorded transactions.
          </p>
        </section>
      </div>
    </>
  );
}
