import Link from "next/link";
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { getSnapshot } from "@/lib/data";
import {
  formatMoney,
  localToday,
  monthLabel,
  summarize,
  validMonth,
} from "@/lib/finance";
import { PageHeading } from "@/components/page-heading";
import { MonthPicker } from "@/components/month-picker";
import { TransactionTable } from "@/components/transaction-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const month = validMonth((await searchParams).month);
  const snapshot = await getSnapshot();
  const summary = summarize(
    snapshot.transactions,
    month,
    snapshot.monthlyAllowance,
  );
  const selected = snapshot.transactions.filter((row) =>
    row.date.startsWith(month),
  );
  const totals = new Map<string, number>();
  for (const row of selected.filter((row) => row.type === "expense"))
    totals.set(
      row.categoryName || "Other",
      (totals.get(row.categoryName || "Other") || 0) + row.amount,
    );
  const categoryTotals = [...totals].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalBalance = snapshot.accounts.reduce(
    (sum, row) => sum + row.balance,
    0,
  );
  const today = localToday();
  const days = new Date(
    Number(month.slice(0, 4)),
    Number(month.slice(5)),
    0,
  ).getDate();
  const daysLeft =
    month === today.slice(0, 7) ? days - Number(today.slice(8)) + 1 : days;
  const dailyGuide = snapshot.monthlyAllowance
    ? Math.floor(Math.max(0, summary.remaining) / daysLeft)
    : 0;
  const spendingPercent = snapshot.monthlyAllowance
    ? Math.round((summary.expenses / snapshot.monthlyAllowance) * 100)
    : 0;
  return (
    <>
      <PageHeading
        title="A little clarity for your month."
        description="Your allowance, your everyday spending, and a plan that feels manageable."
      >
        <Button
          size="lg"
          render={<Link href="/transactions/new" />}
          nativeButton={false}
        >
          <Plus data-icon="inline-start" />
          Add transaction
        </Button>
      </PageHeading>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{monthLabel(month)}</h2>
        <MonthPicker month={month} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <section
          className="flex flex-col justify-between gap-6 rounded-xl bg-primary p-6 text-primary-foreground sm:p-7"
          aria-labelledby="allowance-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="allowance-title"
                className="text-sm text-primary-foreground/90"
              >
                {summary.remaining < 0 && snapshot.monthlyAllowance > 0
                  ? "Over your allowance"
                  : "Allowance left to spend"}
              </h2>
              <p className="amount mt-3 text-4xl font-semibold sm:text-5xl">
                {snapshot.monthlyAllowance > 0
                  ? formatMoney(Math.abs(summary.remaining))
                  : "Let’s set your plan"}
              </p>
            </div>
            <Wallet
              className="mt-1 size-6 shrink-0 opacity-75"
              aria-hidden="true"
            />
          </div>
          {snapshot.monthlyAllowance > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between gap-3 text-xs">
                <span>{formatMoney(summary.expenses)} spent</span>
                <span>{formatMoney(snapshot.monthlyAllowance)} planned</span>
              </div>
              <progress
                className="allowance-progress"
                value={Math.min(spendingPercent, 100)}
                max={100}
                aria-label="Monthly allowance used"
              />
              <p className="mt-1 text-xs text-primary-foreground/90">
                {spendingPercent}% used ·{" "}
                {summary.remaining < 0
                  ? "A good moment to review your spending."
                  : `${formatMoney(dailyGuide)} daily guide over ${daysLeft} days.`}
              </p>
            </div>
          ) : (
            <div>
              <p className="max-w-sm text-sm text-primary-foreground/90">
                Set your monthly allowance to see what’s left after each
                purchase.
              </p>
              <Link
                href="/settings"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
              >
                Set monthly allowance
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>
        <div className="flex flex-col justify-center gap-4 rounded-xl border bg-card p-6">
          {[
            {
              label: "Money across accounts",
              amount: totalBalance,
              Icon: Wallet,
              note: "Includes opening balances and transfers",
            },
            {
              label: "Income this month",
              amount: summary.income,
              Icon: ArrowUpRight,
              note: "Money received",
            },
            {
              label: "Spent this month",
              amount: summary.expenses,
              Icon: ArrowDownRight,
              note: "Transfers aren’t counted as spending",
            },
          ].map(({ label, amount, Icon, note }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="amount text-xl font-semibold">
                  {formatMoney(amount)}
                </span>
                <span className="text-xs text-muted-foreground">{note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Where your money went</h2>
            </CardTitle>
            <CardAction>
              <Link
                href="/categories"
                className="text-xs text-primary hover:underline"
              >
                Manage categories
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {categoryTotals.length ? (
              <div className="flex flex-col gap-4">
                {categoryTotals.map(([name, total]) => (
                  <div key={name} className="flex flex-col gap-2">
                    <div className="flex justify-between gap-3">
                      <span>{name}</span>
                      <strong className="amount font-medium">
                        {formatMoney(total)}
                      </strong>
                    </div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-muted"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-primary/75"
                        style={{
                          width: `${(total / summary.expenses) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No spending yet</EmptyTitle>
                  <EmptyDescription>
                    Your first expense will start this month’s breakdown.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Your accounts</h2>
            </CardTitle>
            <CardAction>
              <Link
                href="/accounts"
                className="text-xs text-primary hover:underline"
              >
                Manage accounts
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {snapshot.accounts.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-primary">
                      {row.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.type}
                      </p>
                    </div>
                  </div>
                  <span className="amount font-medium">
                    {formatMoney(row.balance)}
                  </span>
                </div>
              ))}
            </div>
            {!snapshot.accounts.length && (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>A place for your money</EmptyTitle>
                  <EmptyDescription>
                    Add a cash, bank, or e-wallet account to start tracking.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Latest activity</h2>
          </CardTitle>
          <CardAction>
            <Link
              href={`/transactions?month=${month}`}
              className="text-xs text-primary hover:underline"
            >
              View history →
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={selected.slice(0, 5)} compact />
        </CardContent>
      </Card>
    </>
  );
}
