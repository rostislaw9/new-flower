"use server";

import { AppointmentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

interface UpdateBookingStatusInput {
  bookingId: string;
  status: AppointmentStatus;
}

interface UpdateBookingStatusResult {
  success: boolean;
  status?: AppointmentStatus;
  message?: string;
}

export async function updateBookingStatusAction({
  bookingId,
  status,
}: UpdateBookingStatusInput): Promise<UpdateBookingStatusResult> {
  if (!bookingId) {
    return { success: false, message: "Missing booking id" };
  }

  const validStatuses = Object.values(AppointmentStatus);
  if (!validStatuses.includes(status)) {
    return { success: false, message: "Invalid status" };
  }

  try {
    const updated = await prisma.appointment.update({
      where: { id: bookingId },
      data: { status },
      select: { status: true },
    });

    return { success: true, status: updated.status };
  } catch (error) {
    console.error("[updateBookingStatusAction]", error);
    return {
      success: false,
      message: "Unable to update booking status. Please try again.",
    };
  }
}
