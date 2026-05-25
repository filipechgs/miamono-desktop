import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DatabaseSync } from "node:sqlite";

const BUILTIN_INITIAL_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_name TEXT NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payer_full_name TEXT NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS receipts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt_date TEXT NOT NULL,
  service_id INTEGER NOT NULL,
  payer_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  has_invoice INTEGER NOT NULL DEFAULT 0 CHECK (has_invoice IN (0, 1)),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (payer_id) REFERENCES payers(id)
);

CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date
  ON receipts (receipt_date);

CREATE INDEX IF NOT EXISTS idx_receipts_service_id
  ON receipts (service_id);

CREATE INDEX IF NOT EXISTS idx_receipts_payer_id
  ON receipts (payer_id);

CREATE INDEX IF NOT EXISTS idx_receipts_has_invoice
  ON receipts (has_invoice);

CREATE INDEX IF NOT EXISTS idx_receipts_date_service_payer
  ON receipts (receipt_date, service_id, payer_id);
`;

export const runMigrations = (database: DatabaseSync): void => {
  const migrationsDirectory = new URL("./", import.meta.url);
  const migrationsDirectoryPath = fileURLToPath(migrationsDirectory);
  const migrationFiles = readdirSync(migrationsDirectoryPath)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  database.exec("BEGIN;");

  try {
    if (migrationFiles.length > 0) {
      for (const fileName of migrationFiles) {
        const filePath = join(migrationsDirectoryPath, fileName);
        const sql = readFileSync(filePath, "utf-8");
        database.exec(sql);
      }
    } else {
      database.exec(BUILTIN_INITIAL_SCHEMA_SQL);
    }

    database.exec("COMMIT;");
  } catch (error) {
    database.exec("ROLLBACK;");
    throw error;
  }
};
