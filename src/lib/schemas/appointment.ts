import { z } from "zod";

export const CONTACT_METHODS = [
  "Email",
  "Instagram",
  "Facebook",
  "WhatsApp",
] as const;

export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const BUDGET_RANGES = [
  "Under €200",
  "€200 – €500",
  "€500 – €1,000",
  "€1,000 – €2,000",
  "€2,000+",
  "To discuss",
] as const;

export type BudgetRange = (typeof BUDGET_RANGES)[number];

export const BODY_PLACEMENTS = [
  "Arm",
  "Forearm",
  "Upper arm",
  "Shoulder",
  "Back",
  "Chest",
  "Rib",
  "Leg",
  "Thigh",
  "Calf",
  "Ankle",
  "Foot",
  "Neck",
  "Hand",
  "Wrist",
  "Other",
] as const;

export type BodyPlacement = (typeof BODY_PLACEMENTS)[number];

export const appointmentSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be under 100 characters")
    .trim(),

  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email address is too long")
    .trim()
    .toLowerCase(),

  contactMethod: z.enum(CONTACT_METHODS, {
    message: "Please select a contact method",
  }),

  phone: z
    .string()
    .max(30, "Phone number is too long")
    .trim()
    .optional()
    .or(z.literal("")),

  tattooDescription: z
    .string()
    .min(20, "Please describe your idea in at least 20 characters")
    .max(2000, "Description must be under 2,000 characters")
    .trim(),

  bodyPlacement: z
    .enum(BODY_PLACEMENTS)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),

  tattooSize: z
    .string()
    .max(50, "Size description is too long")
    .trim()
    .optional()
    .or(z.literal("")),

  preferredDates: z
    .array(z.string().trim().min(1))
    .min(1, "Please provide at least one preferred date")
    .max(5, "Maximum five preferred dates"),

  budgetRange: z
    .enum(BUDGET_RANGES)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),

  referenceImageUrls: z
    .array(z.string().url())
    .max(5, "Maximum 5 reference image URLs")
    .optional()
    .default([]),
});

export type AppointmentFormData = z.input<typeof appointmentSchema>;
export type AppointmentData = z.output<typeof appointmentSchema>;
