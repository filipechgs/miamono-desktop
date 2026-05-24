import { openDatabase } from "../infrastructure/database/sqlite-client.ts";
import { runMigrations } from "../infrastructure/database/migrations/runner.ts";

const main = (): void => {
  const database = openDatabase();

  try {
    runMigrations(database);
    console.log("Migracoes aplicadas com sucesso.");
  } finally {
    database.close();
  }
};

main();
