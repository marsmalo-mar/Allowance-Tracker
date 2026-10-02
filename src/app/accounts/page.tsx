import Link from "next/link";
import { Pencil, Wallet } from "lucide-react";
import { getSnapshot } from "@/lib/data";
import { formatMoney } from "@/lib/finance";
import { AccountForm } from "@/components/account-form";
import { DeleteButton } from "@/components/delete-button";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export default async function Accounts() {
  const snapshot = await getSnapshot();
  return (
    <>
      <PageHeading
        title="A place for every peso."
        description="Cash, e-wallets, and bank accounts, with balances that follow your spending."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {snapshot.accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <CardTitle>
                  <h2 className="flex items-center gap-2">
                    <Wallet
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    {account.name}
                  </h2>
                </CardTitle>
                <CardDescription>{account.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="amount text-2xl font-semibold">
                  {formatMoney(account.balance)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Opening balance {formatMoney(account.startingBalance)}
                </p>
              </CardContent>
              <CardFooter className="justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href={`/accounts/${account.id}/edit`} />}
                  nativeButton={false}
                >
                  <Pencil data-icon="inline-start" />
                  Edit
                </Button>
                <DeleteButton
                  kind="account"
                  id={account.id}
                  name={account.name}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Add account</h2>
            </CardTitle>
            <CardDescription>
              A wallet or account where you keep your allowance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
