import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Allowance · Your daily money companion",
  description:
    "A local allowance tracker for everyday spending, accounts, and monthly plans.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
