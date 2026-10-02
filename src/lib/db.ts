import "server-only";
import mysql, { type Pool } from "mysql2/promise";

const globalDatabase = globalThis as unknown as { allowancePool?: Pool };

export const db =
  globalDatabase.allowancePool ??
  mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "allowance_tracker",
    connectionLimit: 5,
    connectTimeout: 4000,
    dateStrings: true,
    charset: "utf8mb4",
  });
globalDatabase.allowancePool = db;
