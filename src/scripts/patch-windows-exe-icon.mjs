import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";
import rcedit from "rcedit";

const iconPath = resolve("doc", "miamono-mascote.ico");
const executablePath = resolve("release", "win-unpacked", "Miamono Desktop.exe");

const assertFileExists = async (filePath) => {
  await access(filePath, constants.R_OK);
};

const main = async () => {
  await assertFileExists(iconPath);
  await assertFileExists(executablePath);

  await rcedit(executablePath, {
    icon: iconPath,
  });

  console.log(`Icone aplicado no executavel: ${executablePath}`);
};

await main();