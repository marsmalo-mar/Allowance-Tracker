import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const root = fileURLToPath(new URL("../", import.meta.url));
for (const file of [".env.local", ".env"]) {
  if (existsSync(root + file)) process.loadEnvFile(root + file);
}

export const databaseName = process.env.DB_NAME || "allowance_tracker";
if (!/^[a-zA-Z0-9_]+$/.test(databaseName))
  throw new Error(
    "DB_NAME must contain only letters, digits, and underscores.",
  );

export const connectionOptions = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  dateStrings: true,
  charset: "utf8mb4",
};

export function connect() {
  return mysql.createConnection({
    ...connectionOptions,
    database: databaseName,
  });
}

export async function createSchema() {
  const connection = await mysql.createConnection(connectionOptions);
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await connection.changeUser({ database: databaseName });
    const sql = readFileSync(
      new URL("../database/schema.sql", import.meta.url),
      "utf8",
    );
    for (const statement of sql
      .split(";")
      .map((value) => value.trim())
      .filter(Boolean)) {
      await connection.query(statement);
    }
  } finally {
    await connection.end();
  }
}
