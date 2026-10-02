import { notFound } from "next/navigation";
import { getSnapshot } from "@/lib/data";
import { CategoryForm } from "@/components/category-form";
import { PageHeading } from "@/components/page-heading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function EditCategory({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  const category = (await getSnapshot()).categories.find(
    (row) => row.id === id,
  );
  if (!category) notFound();
  return (
    <>
      <PageHeading
        title="Edit your category."
        description="Changing a name updates it throughout your history. A used category keeps its transaction type."
      />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>
            <h2>{category.name}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm category={category} />
        </CardContent>
      </Card>
    </>
  );
}
