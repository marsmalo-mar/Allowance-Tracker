import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="page-title">That entry isn’t here.</h1>
      <p className="text-sm text-muted-foreground">
        It may have been removed. Your tracker is still here.
      </p>
      <Button render={<Link href="/" />} nativeButton={false} className="w-fit">
        Back to overview
      </Button>
    </section>
  );
}
