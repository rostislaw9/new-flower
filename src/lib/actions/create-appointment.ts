"use server";

import { sendBookingEmails } from "@/lib/email/send-booking-emails";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/schemas/appointment";

export type ActionFieldErrors = Partial<Record<string, string[]>>;

export type ActionResult =
  | { success: true; id: string }
  | { success: false; fieldErrors: ActionFieldErrors; message?: never }
  | { success: false; fieldErrors?: never; message: string };

export async function createAppointment(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    contactMethod: formData.get("contactMethod"),
    phone: formData.get("phone"),
    tattooDescription: formData.get("tattooDescription"),
    bodyPlacement: formData.get("bodyPlacement"),
    tattooSize: formData.get("tattooSize"),
    preferredDates: formData.getAll("preferredDates"),
    budgetRange: formData.get("budgetRange"),
    referenceImageUrls: formData.getAll("referenceImageUrls"),
  };

  const parsed = appointmentSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const appointment = await prisma.appointment.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        contactMethod: data.contactMethod,
        phone: data.phone ?? null,
        tattooDescription: data.tattooDescription,
        bodyPlacement: data.bodyPlacement ?? null,
        tattooSize: data.tattooSize ?? null,
        preferredDates: data.preferredDates,
        budgetRange: data.budgetRange ?? null,
        referenceImages: data.referenceImageUrls,
      },
      select: { id: true },
    });

    void sendBookingEmails({
      id: appointment.id,
      fullName: data.fullName,
      email: data.email,
      contactMethod: data.contactMethod,
      phone: data.phone,
      tattooDescription: data.tattooDescription,
      bodyPlacement: data.bodyPlacement,
      tattooSize: data.tattooSize,
      preferredDates: data.preferredDates,
      budgetRange: data.budgetRange,
      referenceImageUrls: data.referenceImageUrls,
    }).catch((err: unknown) => {
      console.error("[createAppointment] Email send error:", err);
    });

    return { success: true, id: appointment.id };
  } catch (err) {
    console.error("[createAppointment] Database error:", err);
    return {
      success: false,
      message:
        "Something went wrong saving your request. Please try again or contact us directly.",
    };
  }
}
