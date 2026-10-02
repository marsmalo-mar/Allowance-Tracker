"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { formatMoney } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "./delete-button";

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        aria-label="Sort by date"
      >
        Date
        <ArrowUpDown data-icon="inline-end" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {new Intl.DateTimeFormat("en-PH", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        }).format(new Date(`${row.original.date}T00:00:00Z`))}
      </span>
    ),
  },
  {
    id: "details",
    accessorFn: (row) => `${row.categoryName || "Transfer"} ${row.description}`,
    header: "Details",
    cell: ({ row }) => (
      <div className="flex max-w-56 flex-col gap-1">
        <span className="truncate font-medium">
          {row.original.description ||
            row.original.categoryName ||
            "Account transfer"}
        </span>
        <span className="text-xs text-muted-foreground">
          {row.original.categoryName || "Transfer"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "accountName",
    header: "Account",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 text-xs">
        <span>{row.original.accountName}</span>
        {row.original.toAccountName && (
          <span className="text-muted-foreground">
            → {row.original.toAccountName}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={row.original.type === "income" ? "secondary" : "outline"}>
        {row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        aria-label="Sort by amount"
      >
        Amount
        <ArrowUpDown data-icon="inline-end" />
      </Button>
    ),
    cell: ({ row }) => (
      <span
        className={cn(
          "amount font-semibold",
          row.original.type === "income" && "text-primary",
        )}
      >
        {row.original.type === "income"
          ? "+"
          : row.original.type === "expense"
            ? "−"
            : ""}
        {formatMoney(row.original.amount)}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          render={<Link href={`/transactions/${row.original.id}/edit`} />}
          nativeButton={false}
          aria-label={`Edit ${row.original.description || row.original.categoryName || "transfer"}`}
        >
          <Pencil aria-hidden="true" />
        </Button>
        <DeleteButton
          kind="transaction"
          id={row.original.id}
          name={
            row.original.description || row.original.categoryName || "transfer"
          }
        />
      </div>
    ),
  },
];

export function TransactionTable({
  transactions,
  compact = false,
}: {
  transactions: Transaction[];
  compact?: boolean;
}) {
  // TanStack Table v8 uses mutable table methods; do not memoize this component with React Compiler.
  "use no memo";
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const data = useMemo(
    () =>
      type === "all"
        ? transactions
        : transactions.filter((row) => row.type === type),
    [transactions, type],
  );
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    globalFilterFn: (row, _id, value: string) =>
      [
        row.original.description,
        row.original.categoryName,
        row.original.accountName,
        row.original.toAccountName,
        row.original.type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value.toLowerCase()),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: compact ? 5 : 10 } },
  });
  return (
    <div className="flex min-w-0 flex-col gap-4">
      {!compact && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            type="search"
            placeholder="Search notes, categories, accounts…"
            aria-label="Search transactions"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:max-w-sm"
          />
          <NativeSelect
            value={type}
            onChange={(event) => setType(event.target.value)}
            aria-label="Filter transaction type"
          >
            <NativeSelectOption value="all">All types</NativeSelectOption>
            <NativeSelectOption value="expense">Expenses</NativeSelectOption>
            <NativeSelectOption value="income">Income</NativeSelectOption>
            <NativeSelectOption value="transfer">Transfers</NativeSelectOption>
          </NativeSelect>
        </div>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  aria-sort={
                    header.column.getIsSorted() === "asc"
                      ? "ascending"
                      : header.column.getIsSorted() === "desc"
                        ? "descending"
                        : undefined
                  }
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {!table.getRowModel().rows.length && (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>
                      {transactions.length
                        ? "No matching transactions"
                        : "A fresh page for your money"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {transactions.length
                        ? "Try another search or transaction type."
                        : "Add your allowance or an everyday expense to get started."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} entries · Page{" "}
            {table.getState().pagination.pageIndex + 1} of{" "}
            {Math.max(1, table.getPageCount())}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              <ChevronLeft data-icon="inline-start" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
