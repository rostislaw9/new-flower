import { describe, expect, it } from "vitest";

import en from "../../messages/en.json";
import th from "../../messages/th.json";

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

describe("i18n message files", () => {
  it("en.json and th.json have the same key structure", () => {
    const enKeys = getKeyPaths(en).sort();
    const thKeys = getKeyPaths(th).sort();

    const enOnly = enKeys.filter((key) => !thKeys.includes(key));
    const thOnly = thKeys.filter((key) => !enKeys.includes(key));

    expect(
      { enOnly, thOnly },
      `Translation key mismatch. Run "yarn i18n:check" to inspect.`,
    ).toEqual({ enOnly: [], thOnly: [] });
  });
});
