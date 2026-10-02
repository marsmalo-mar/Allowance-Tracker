import Link from "next/link";
import { Pencil } from "lucide-react";
import { getSnapshot } from "@/lib/data";
import { CategoryForm } from "@/components/category-form";
import { DeleteButton } from "@/components/delete-button";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default async function Categories() {
  const snapshot = await getSnapshot();
  return (
    <>
      <PageHeading
        title="Give your spending a little structure."
        description="Simple categories make quick entries and useful monthly summaries."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Your categories</h2>
            </CardTitle>
            <CardDescription>Keep the ones you use regularly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {snapshot.categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-wrap items-center gap-3"
                >
                  <Badge
                    variant={
                      category.type === "income" ? "secondary" : "outline"
                    }
                  >
                    {category.type}
                  </Badge>
                  <span className="min-w-0 flex-1 text-sm font-medium">
                    {category.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    render={<Link href={`/categories/${category.id}/edit`} />}
                    nativeButton={false}
                    aria-label={`Edit ${category.name}`}
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                  <DeleteButton
                    kind="category"
                    id={category.id}
                    name={category.name}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Add category</h2>
            </CardTitle>
            <CardDescription>
              A clear, short name is easiest to find later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
