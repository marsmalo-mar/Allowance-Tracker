"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  SlidersHorizontal,
  Leaf,
  Laptop,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/settings", label: "My plan", icon: SlidersHorizontal },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-card focus:p-4"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r bg-sidebar px-5 py-8 md:flex">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-semibold tracking-tight"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="size-5" aria-hidden="true" />
          </span>
          allowance<span className="text-primary">.</span>
        </Link>
        <p className="mt-2 pl-12 text-xs text-muted-foreground">
          A little clarity, every day.
        </p>
        <nav aria-label="Main navigation" className="mt-10 flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                active(href)
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2 px-3 text-xs text-muted-foreground">
          <Laptop className="size-4" aria-hidden="true" />
          Saved on this device
        </div>
      </aside>
      <div className="md:ml-56">
        <header className="border-b bg-card px-4 py-4 sm:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <Link href="/" className="font-semibold tracking-tight md:hidden">
              allowance<span className="text-primary">.</span>
            </Link>
            <p className="hidden text-sm text-muted-foreground md:block">
              Your daily money companion
            </p>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Laptop className="size-3.5" aria-hidden="true" />
              Local workspace
            </span>
          </div>
          <nav
            aria-label="Mobile navigation"
            className="mt-4 flex justify-between gap-1 md:hidden"
          >
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={active(href) ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[0.65rem]",
                  active(href)
                    ? "text-primary font-semibold"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main
          id="main"
          className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-7 sm:px-8 sm:py-9"
        >
          {children}
        </main>
        <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted-foreground sm:px-8">
          Small habits. More room for what matters.
        </footer>
      </div>
    </>
  );
}
