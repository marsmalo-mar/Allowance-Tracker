import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { getSnapshot } from "@/lib/data";
import { isValidDate, monthLabel } from "@/lib/finance";
import { PageHeading } from "@/components/page-heading";
import { MonthPicker } from "@/components/month-picker";
import { TransactionTable } from "@/components/transaction-table";
import { FormNotice } from "@/components/form-notice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";

export default async function Transactions({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const snapshot = await getSnapshot();
  const month =
    params.month && isValidDate(`${params.month}-01`) ? params.month : null;
  const rows = month
    ? snapshot.transactions.filter((row) => row.date.startsWith(month))
    : snapshot.transactions;
  return (
    <>
      <PageHeading
        title="Your money, in the details."
        description="Every allowance, purchase, and transfer, with room to find exactly what you need."
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            render={<a href="/export" />}
            nativeButton={false}
          >
            <Download data-icon="inline-start" />
            Export CSV
          </Button>
          <Button
            size="lg"
            render={<Link href="/transactions/new" />}
            nativeButton={false}
          >
            <Plus data-icon="inline-start" />
            Add transaction
          </Button>
        </div>
      </PageHeading>
      {params.saved && (
        <FormNotice
          state={{
            success: "Transaction saved. Your balances are up to date.",
          }}
        />
      )}
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{month ? monthLabel(month) : "All transactions"}</h2>
          </CardTitle>
          <CardAction>
            <div className="flex flex-wrap items-center gap-3">
              <MonthPicker month={month || ""} />
              {month && (
                <Link
                  href="/transactions"
                  className="text-xs text-primary hover:underline"
                >
                  All history
                </Link>
              )}
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={rows} />
        </CardContent>
      </Card>
    </>
  );
}
