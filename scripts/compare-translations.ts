import { readFileSync } from "fs";
import { resolve } from "path";

function loadJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
}

function getKeyPaths(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.keys(obj).flatMap((key) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return getKeyPaths(value as Record<string, unknown>, path);
    }
    return path;
  });
}

const en = loadJson(resolve(__dirname, "../messages/en.json"));
const th = loadJson(resolve(__dirname, "../messages/th.json"));

const enKeys = getKeyPaths(en).sort();
const thKeys = getKeyPaths(th).sort();

const enOnly = enKeys.filter((key) => !thKeys.includes(key));
const thOnly = thKeys.filter((key) => !enKeys.includes(key));

if (enOnly.length === 0 && thOnly.length === 0) {
  console.log("Both en.json and th.json have the same structure");
  process.exit(0);
}

console.error("Translation structure mismatch:");
if (enOnly.length > 0) {
  console.error("\nKeys in en.json but missing in th.json:");
  enOnly.forEach((key) => console.error(`  - ${key}`));
}
if (thOnly.length > 0) {
  console.error("\nKeys in th.json but missing in en.json:");
  thOnly.forEach((key) => console.error(`  - ${key}`));
}
process.exit(1);
