# Allowance Tracker

A local single-user allowance monitor using **Next.js 16, React 19, TypeScript, Tailwind CSS 4, Base UI/shadcn primitives, TanStack Table, and XAMPP MySQL**. XAMPP's MariaDB is MySQL-compatible. Next.js handles the backend; Python and Apache are not required.

## Daily startup on this device

1. Start **MySQL** in XAMPP Control Panel.
2. From this project folder, run:

```powershell
npm.cmd start
```

3. Open [the tracker](http://127.0.0.1:3000). Keep the terminal open; Ctrl+C stops it.

Complete the fresh-installation steps below on a new device. If port 3000 is occupied by another copy, use that copy or stop it before starting a second one. After code changes, run `npm.cmd run build` before starting. Use `npm.cmd run dev` for development.

The server binds to 127.0.0.1 and needs no cloud connection or login. This is not a public or LAN multi-user service.

## Features and daily routine

- Set your monthly spending plan in **Settings**. This is a budget, not a deposit; record money actually received as income.
- Add income, expenses, and transfers. Transfers only move money between accounts.
- **Overview** shows monthly income/spending, remaining plan, a daily guide, categories, account balances, and recent activity.
- **Transactions** has search, type/month filtering, sorting, pagination, edits, confirmed deletion, and all-history CSV export.
- Manage accounts, opening balances, and categories. Referenced accounts/categories cannot be deleted.
- Responsive phone/desktop layouts and forms that retain entries after failed saves.

Money is stored as exact two-decimal Philippine pesos. Account balances include opening amounts and all recorded history; monthly totals only include the selected month. Transfers do not count as income or spending. The allowance is one shared setting, not separate historical plans per month. Negative account balances are possible.

## Fresh installation

Use Node.js 22.13+ (24 recommended), npm, and XAMPP MySQL:

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
```

Edit `.env.local` for your connection:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=allowance_tracker
```

Blank-password root matches this device's local XAMPP setup, not a public deployment. Credentials stay server-side. Never commit `.env.local`; use a dedicated database user on shared devices.

Choose one initialization path:

### Import the existing SQLite tracker

This repository does not include private database files or the old Flask app. If you have an existing SQLite tracker, stop it and pass its database path explicitly:

```powershell
npm.cmd run db:migrate -- "C:\path\to\finance.db"
```

Import opens SQLite read-only, makes a recovery copy in `backups/`, preserves IDs and settings, and verifies record fingerprints, counts, settings, and balances before committing atomically. It refuses a destination with records. Use a new `DB_NAME` for trial migrations; never clear real data just to rerun. Pass a different source path after `--` if needed.

### Begin with starter accounts/categories

```powershell
npm.cmd run db:setup -- --seed
```

Omit `-- --seed` for schema only. Do not seed before a SQLite import.

Then:

```powershell
npm.cmd run build
npm.cmd start
```

## Backup and recovery

CSV is useful transaction history, **not a complete restorable backup**. Periodically export the whole `allowance_tracker` database with phpMyAdmin or mysqldump. Start Apache too if using phpMyAdmin. Keep exports separate from the device and credentials private.

Local recovery archives in `backups/` are ignored by Git. The cleanup archive `backups/legacy-flask-2026-10-02.zip` contains the removed Flask source and original SQLite files; extract it to a separate folder if recovery is needed. The obsolete Python environment and bytecode caches are not retained. New MySQL changes are **not** synced back to SQLite.

## Before pushing to GitHub

Commit source files, tests, configuration, `.env.example`, `database/schema.sql`, and `package-lock.json`. Do not commit `.env.local`, private database files or SQL exports, `backups/`, `node_modules/`, `.next/`, or test artifacts; `.gitignore` excludes them. Keep the schema exception when changing SQL ignore rules.

Review `git status --short` and `git diff --cached` before pushing. Ignore rules do not remove files that were already committed. If an older commit contains personal data or credentials, address that history before making the repository public; deleting the current file alone is not enough.

## Checks

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run test:e2e
```

Browser tests use installed Microsoft Edge, port 3100, and the isolated `allowance_tracker_e2e` database. They reset only that test database; never use its name for real data. Build before running browser tests.

Tests cover money, dates, balances, transfers, validation, CSV safety, persisted CRUD, deletion protection, failed-save input preservation, and responsive layouts.

Known non-blocking warning: TanStack Table v8 triggers a React Compiler compatibility lint warning (Compiler is not enabled).

See [the migration contract](docs/migration.md) for scope and structure.
