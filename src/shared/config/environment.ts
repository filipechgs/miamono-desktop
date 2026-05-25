import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface EnvironmentConfig {
  appName: string;
  appLocale: string;
  appEnv: string;
  dataDir: string;
  databaseFilePath: string;
}

const ensureDirectory = (directoryPath: string): boolean => {
  if (existsSync(directoryPath)) return true;

  try {
    mkdirSync(directoryPath, { recursive: true });
    return true;
  } catch {
    return false;
  }
};

const resolveUserScopedDataDir = (): string => {
  if (process.platform === "win32") {
    const appDataBaseDir = process.env.APPDATA ?? join(homedir(), "AppData", "Roaming");
    return join(appDataBaseDir, "Miamono Desktop", "data");
  }

  if (process.platform === "darwin") {
    return join(homedir(), "Library", "Application Support", "Miamono Desktop", "data");
  }

  const xdgDataDir = process.env.XDG_DATA_HOME ?? join(homedir(), ".local", "share");
  return join(xdgDataDir, "miamono-desktop", "data");
};

const resolveDataDir = (): string => {
  const preferredDataDir = join(process.cwd(), "data");

  if (ensureDirectory(preferredDataDir)) {
    return preferredDataDir;
  }

  const fallbackDataDir = resolveUserScopedDataDir();

  if (ensureDirectory(fallbackDataDir)) {
    return fallbackDataDir;
  }

  throw new Error("Nao foi possivel criar um diretorio de dados gravavel para a aplicacao.");
};

export const environment: EnvironmentConfig = {
  appName: "Miamono Desktop",
  appLocale: "pt-BR",
  appEnv: process.env.NODE_ENV ?? "development",
  dataDir: resolveDataDir(),
  databaseFilePath: join(resolveDataDir(), "miamono.sqlite"),
};
