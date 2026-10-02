import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading your tracker"
      className="flex flex-col gap-6"
    >
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
