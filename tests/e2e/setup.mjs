export default async function setup() {
  process.env.DB_NAME = "allowance_tracker_e2e";
  const { createSchema, connect, databaseName } =
    await import("../../scripts/database.mjs");
  if (databaseName !== "allowance_tracker_e2e")
    throw new Error("Test setup must use the isolated test database.");
  await createSchema();
  const db = await connect();
  try {
    const [identity] = await db.query("SELECT DATABASE() name");
    if (identity[0].name !== "allowance_tracker_e2e")
      throw new Error("Refusing to reset a non-test database.");
    await db.beginTransaction();
    await db.query("DELETE FROM transactions");
    await db.query("DELETE FROM categories");
    await db.query("DELETE FROM accounts");
    await db.query("UPDATE settings SET monthly_allowance=0 WHERE id=1");
    await db.query(
      "INSERT INTO accounts(id,name,type,starting_balance) VALUES(1,'Cash','cash',1000),(2,'GCash','e-wallet',200)",
    );
    await db.query(
      "INSERT INTO categories(id,name,type) VALUES(1,'Food','expense'),(2,'Allowance','income')",
    );
    await db.commit();
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    await db.end();
  }
}
