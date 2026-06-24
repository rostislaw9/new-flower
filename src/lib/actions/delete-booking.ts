"use server";

import { prisma } from "@/lib/prisma";

interface DeleteBookingResult {
  success: boolean;
  message?: string;
}

export async function deleteBookingAction(
  bookingId: string,
): Promise<DeleteBookingResult> {
  if (!bookingId) {
    return { success: false, message: "Missing booking id" };
  }

  try {
    await prisma.appointment.delete({ where: { id: bookingId } });
    return { success: true };
  } catch (error) {
    console.error("[deleteBookingAction]", error);
    return {
      success: false,
      message: "Unable to delete booking. Please try again.",
    };
  }
}
