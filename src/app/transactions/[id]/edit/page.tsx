import { notFound } from "next/navigation";
import { getSnapshot } from "@/lib/data";
import { localToday } from "@/lib/finance";
import { TransactionForm } from "@/components/transaction-form";
import { PageHeading } from "@/components/page-heading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function EditTransaction({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  const snapshot = await getSnapshot();
  const transaction = snapshot.transactions.find((row) => row.id === id);
  if (!transaction) notFound();
  return (
    <>
      <PageHeading
        title="Make a small correction."
        description="Your balances and allowance will update when you save."
      />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>
            <h2>Edit transaction</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm
            accounts={snapshot.accounts}
            categories={snapshot.categories}
            today={localToday()}
            transaction={transaction}
          />
        </CardContent>
      </Card>
    </>
  );
}
