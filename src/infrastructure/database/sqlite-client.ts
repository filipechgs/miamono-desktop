import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { environment } from "../../shared/config/environment.ts";
import { ErrorCodes } from "../../shared/errors/error-codes.ts";
import { TechnicalError } from "../../shared/errors/technical-error.ts";

const ensureDatabaseDirectory = (): void => {
  const directoryPath = dirname(environment.databaseFilePath);

  if (!existsSync(directoryPath)) {
    mkdirSync(directoryPath, { recursive: true });
  }
};

export const openDatabase = (): DatabaseSync => {
  try {
    ensureDatabaseDirectory();

    const database = new DatabaseSync(environment.databaseFilePath);
    database.exec("PRAGMA foreign_keys = ON;");

    return database;
  } catch (error) {
    throw new TechnicalError(
      "Falha ao abrir conexão com SQLite.",
      ErrorCodes.technical.database,
      { databaseFilePath: environment.databaseFilePath },
      error,
    );
  }
};
