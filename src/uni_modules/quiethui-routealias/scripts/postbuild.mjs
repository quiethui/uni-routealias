import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(currentDir, "..");
const distDir = path.resolve(packageDir, "dist");
const sourceAmbientTypes = path.resolve(packageDir, "core/types.d.ts");
const distAmbientTypes = path.resolve(distDir, "core/types.d.ts");

fs.mkdirSync(path.dirname(distAmbientTypes), { recursive: true });
fs.copyFileSync(sourceAmbientTypes, distAmbientTypes);
