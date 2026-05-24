import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DatabaseSync } from "node:sqlite";

export const runMigrations = (database: DatabaseSync): void => {
  const migrationsDirectory = new URL("./", import.meta.url);
  const migrationsDirectoryPath = fileURLToPath(migrationsDirectory);
  const migrationFiles = readdirSync(migrationsDirectory)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  database.exec("BEGIN;");

  try {
    for (const fileName of migrationFiles) {
      const filePath = join(migrationsDirectoryPath, fileName);
      const sql = readFileSync(filePath, "utf-8");
      database.exec(sql);
    }

    database.exec("COMMIT;");
  } catch (error) {
    database.exec("ROLLBACK;");
    throw error;
  }
};
