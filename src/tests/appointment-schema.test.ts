import { describe, expect, it } from "vitest";

import { appointmentSchema } from "@/lib/schemas/appointment";

const VALID_INPUT = {
  fullName: "Anna Sokolova",
  email: "anna@example.com",
  contactMethod: "Facebook" as const,
  tattooDescription:
    "A fine-line botanical sleeve featuring ferns, peonies, and lavender, inspired by Victorian herbarium illustrations.",
  preferredDates: ["2025-09-15", "2025-09-22"],
};

describe("appointmentSchema", () => {
  describe("valid input", () => {
    it("accepts a fully valid minimal input", () => {
      const result = appointmentSchema.safeParse(VALID_INPUT);
      expect(result.success).toBe(true);
    });

    it("accepts all optional fields populated", () => {
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        phone: "+66 999 123 45 67",
        bodyPlacement: "Forearm",
        tattooSize: "palm-sized",
        budgetRange: "€500 – €1,000",
      });
      expect(result.success).toBe(true);
    });

    it("normalises email to lowercase", () => {
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        email: "ANNA@EXAMPLE.COM",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("anna@example.com");
      }
    });

    it("trims whitespace from fullName", () => {
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        fullName: "  Anna Sokolova  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe("Anna Sokolova");
      }
    });

    it("transforms empty bodyPlacement to undefined", () => {
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        bodyPlacement: "",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bodyPlacement).toBeUndefined();
      }
    });

    it("transforms empty budgetRange to undefined", () => {
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        budgetRange: "",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.budgetRange).toBeUndefined();
      }
    });

    it("accepts up to 5 preferred dates", () => {
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        preferredDates: [
          "2025-09-15",
          "2025-09-22",
          "2025-09-29",
          "2025-10-06",
          "2025-10-13",
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("required field validation", () => {
    it("rejects missing fullName", () => {
      const { fullName: _omitted, ...rest } = VALID_INPUT;
      const result = appointmentSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("rejects fullName shorter than 2 characters", () => {
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        fullName: "A",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors["fullName"]).toBeDefined();
      }
    });

    it("rejects invalid email format", () => {
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors["email"]).toBeDefined();
      }
    });

    it("rejects invalid contactMethod", () => {
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        contactMethod: "Smoke Signal",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.flatten().fieldErrors["contactMethod"],
        ).toBeDefined();
      }
    });

    it("rejects tattooDescription shorter than 20 characters", () => {
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        tattooDescription: "Too short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.flatten().fieldErrors["tattooDescription"],
        ).toBeDefined();
      }
    });

    it("rejects empty preferredDates array", () => {
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        preferredDates: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.flatten().fieldErrors["preferredDates"],
        ).toBeDefined();
      }
    });

    it("rejects more than 5 preferred dates", () => {
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        preferredDates: [
          "2025-09-01",
          "2025-09-08",
          "2025-09-15",
          "2025-09-22",
          "2025-09-29",
          "2025-10-06",
        ],
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid bodyPlacement value", () => {
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        bodyPlacement: "Moon",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid budgetRange value", () => {
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        budgetRange: "Lots",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("referenceImages", () => {
    it("defaults to empty array when not provided", () => {
      const result = appointmentSchema.safeParse(VALID_INPUT);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.referenceImageUrls).toEqual([]);
      }
    });

    it("accepts valid image files", () => {
      const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
      const result = appointmentSchema.safeParse({
        ...VALID_INPUT,
        referenceImages: [file],
      });
      expect(result.success).toBe(true);
    });
  });
});
