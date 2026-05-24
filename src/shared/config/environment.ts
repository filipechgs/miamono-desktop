import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export interface EnvironmentConfig {
  appName: string;
  appLocale: string;
  appEnv: string;
  dataDir: string;
  databaseFilePath: string;
}

const resolveDataDir = (): string => {
  const dataDir = join(process.cwd(), "data");

  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  return dataDir;
};

export const environment: EnvironmentConfig = {
  appName: "Miamono Desktop",
  appLocale: "pt-BR",
  appEnv: process.env.NODE_ENV ?? "development",
  dataDir: resolveDataDir(),
  databaseFilePath: join(resolveDataDir(), "miamono.sqlite"),
};
