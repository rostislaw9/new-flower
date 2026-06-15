import { z } from "zod";

export const reviewSchema = z.object({
  clientName: z.string().trim().min(2, "Name must be at least 2 characters"),
  clientEmail: z.string().trim().email("Please enter a valid email").optional(),
  rating: z.coerce.number().min(1, "Select a rating").max(5, "Select a rating"),
  text: z.string().trim().min(20, "Review must be at least 20 characters"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
