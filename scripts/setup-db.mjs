import { connect, createSchema, databaseName } from "./database.mjs";

await createSchema();
if (process.argv.includes("--seed")) {
  const db = await connect();
  try {
    const [accounts] = await db.query("SELECT COUNT(*) count FROM accounts");
    const [categories] = await db.query(
      "SELECT COUNT(*) count FROM categories",
    );
    if (accounts[0].count === 0) {
      await db.query(
        "INSERT INTO accounts (name,type) VALUES ('Cash','cash'),('GCash','e-wallet'),('Maya','e-wallet')",
      );
    }
    if (categories[0].count === 0) {
      await db.query(
        "INSERT INTO categories (name,type) VALUES ('Allowance','income'),('Other income','income'),('Food','expense'),('Transport','expense'),('School','expense'),('Bills','expense'),('Shopping','expense'),('Fun','expense'),('Other','expense')",
      );
    }
  } finally {
    await db.end();
  }
}
console.log(
  `Database ${databaseName} is ready. Import SQLite with npm run db:migrate, or seed a fresh tracker with npm run db:setup -- --seed.`,
);
