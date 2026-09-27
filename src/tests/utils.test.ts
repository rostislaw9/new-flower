import { describe, expect, it } from "vitest";

import { getLocalizedPath } from "@/lib/locale-utils";
import { cn } from "@/lib/utils";

describe("getLocalizedPath", () => {
  it("returns the canonical unprefixed path for the default locale", () => {
    expect(getLocalizedPath("/faq", "en")).toBe("/faq");
    expect(getLocalizedPath("/", "en")).toBe("/");
  });

  it("returns a prefixed path for non-default locales", () => {
    expect(getLocalizedPath("/faq", "th")).toBe("/th/faq");
    expect(getLocalizedPath("/", "th")).toBe("/th");
  });

  it("strips an existing locale prefix before building the new path", () => {
    expect(getLocalizedPath("/th/faq", "en")).toBe("/faq");
    expect(getLocalizedPath("/en/faq", "th")).toBe("/th/faq");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deduplicates tailwind classes", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "skipped", "included")).toBe("base included");
  });
});
