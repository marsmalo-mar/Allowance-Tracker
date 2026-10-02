# Stack migration contract

Replace the single-user local Flask UI with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn components built on Base UI, and TanStack Table. Next.js server code connects directly to the MySQL-compatible MariaDB service included in XAMPP through mysql2.

## Required behavior

- Preserve monthly allowance planning, month browsing, income/expense/transfer recording, transaction editing/deletion, accounts, categories, and all-history CSV export.
- Correct balances include opening amounts and both sides of transfers. Transfers never count as income or spending. Store money as DECIMAL(12,2) and validate to two decimal places.
- Server validates dates, amounts, names, transaction types, foreign references, and category/type consistency. Mutations are same-origin. The server binds to 127.0.0.1 for this local single-user app.
- Support copying existing SQLite records and IDs to a separate allowance_tracker database. Read SQLite without writing to it; import atomically into an empty destination and refuse an overwrite. Verify counts, settings, record fingerprints, and balances before completion. Keep private recovery data outside the published source.
- Preserve the existing quiet green visual direction, add a compact navigable shell, accessible labeled forms, confirmation dialogs, keyboard support, responsive layouts, and meaningful loading/error/empty states.

## Build order and verification

1. Scaffold Next.js and install the requested dependencies; type-check the shell.
2. Define schema, validation, balances, and data transfer; test cents, calendar dates, transfers, and migration invariants against real MySQL.
3. Connect server reads/actions to the dashboard and reusable UI. Add searchable, sortable, paginated TanStack transaction history.
4. Verify CRUD, plan changes, export, and responsive UI in an isolated browser; run lint, unit tests, type-check, and a production build.

## Layout

src/app holds pages, server actions, and the export route. src/components holds application UI and generated shadcn primitives. src/lib holds database access, domain types, validation, and formatting. scripts holds setup and read-only SQLite import. tests holds domain and browser integration checks.

## Commands

Use npm run db:setup, npm run db:migrate, npm run dev, npm test, npm run lint, npm run typecheck, npm run build, and npm run test:e2e.

The Next.js workflows have been verified against an isolated MySQL database and a real browser. The obsolete Flask source and SQLite files were removed from the active project after preserving a verified local archive in the ignored backups directory. Do not commit credentials, private databases, recovery archives, or generated output. The optional SQLite importer remains supported for existing tracker data supplied separately.
