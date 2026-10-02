import { getSnapshot } from "@/lib/data";
import { localToday } from "@/lib/finance";
import { TransactionForm } from "@/components/transaction-form";
import { PageHeading } from "@/components/page-heading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function NewTransaction() {
  const snapshot = await getSnapshot();
  return (
    <>
      <PageHeading
        title="Keep the little things recorded."
        description="A few details now. A clearer picture every day."
      />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>
            <h2>Add transaction</h2>
          </CardTitle>
          <CardDescription>
            Choose the type, enter the amount, and you’re done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm
            accounts={snapshot.accounts}
            categories={snapshot.categories}
            today={localToday()}
          />
        </CardContent>
      </Card>
    </>
  );
}
