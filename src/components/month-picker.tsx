"use client";

import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="month"
        className="text-xs font-medium text-muted-foreground"
      >
        Month
      </label>
      <Input
        id="month"
        type="month"
        value={month}
        min="1900-01"
        onChange={(event) => {
          if (event.target.value)
            router.push(`${pathname}?month=${event.target.value}`);
        }}
        className="w-40"
      />
    </div>
  );
}
