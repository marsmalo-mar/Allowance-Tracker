import { notFound } from "next/navigation";
import { getSnapshot } from "@/lib/data";
import { AccountForm } from "@/components/account-form";
import { PageHeading } from "@/components/page-heading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function EditAccount({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  const account = (await getSnapshot()).accounts.find((row) => row.id === id);
  if (!account) notFound();
  return (
    <>
      <PageHeading
        title="Edit your account."
        description="Keep your account name and opening balance accurate."
      />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>
            <h2>{account.name}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AccountForm account={account} />
        </CardContent>
      </Card>
    </>
  );
}
