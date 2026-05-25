import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import pngToIco from "png-to-ico";

const inputPath = resolve("doc", "miamono-mascote.png");
const outputPath = resolve("doc", "miamono-mascote.ico");

const source = await readFile(inputPath);
const icoBuffer = await pngToIco(source);
await writeFile(outputPath, icoBuffer);

console.log(`ICO gerado em: ${outputPath}`);
