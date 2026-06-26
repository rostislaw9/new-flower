import type { BookingEmailData } from "@/lib/email/templates";
import {
  artistNotificationHtml,
  artistNotificationText,
  customerConfirmationHtml,
  customerConfirmationText,
} from "@/lib/email/templates";
import { resend } from "@/lib/resend";

const ARTIST_EMAIL = process.env["ARTIST_EMAIL"];
const FROM_ADDRESS = process.env["EMAIL_FROM"];

export interface EmailResults {
  artistNotified: boolean;
  customerConfirmed: boolean;
  errors: string[];
}

export async function sendBookingEmails(
  data: BookingEmailData,
): Promise<EmailResults> {
  const errors: string[] = [];
  let artistNotified = false;
  let customerConfirmed = false;

  if (resend === null || !ARTIST_EMAIL || !FROM_ADDRESS) {
    console.warn(
      "[sendBookingEmails] Resend not configured — skipping email notifications. Set RESEND_API_KEY, ARTIST_EMAIL and FROM_ADDRESS to enable emails.",
    );
    return {
      artistNotified: false,
      customerConfirmed: false,
      errors: ["Email service not configured"],
    };
  }

  const artistResult = await resend.emails.send({
    from: FROM_ADDRESS,
    to: [ARTIST_EMAIL],
    subject: `New booking request — ${data.fullName}`,
    html: artistNotificationHtml(data),
    text: artistNotificationText(data),
  });

  if (artistResult.error !== null && artistResult.error !== undefined) {
    console.error(
      "[sendBookingEmails] Artist notification failed:",
      artistResult.error,
    );
    errors.push(`Artist notification: ${artistResult.error.message}`);
  } else {
    artistNotified = true;
  }

  const customerResult = await resend.emails.send({
    from: FROM_ADDRESS,
    to: [data.email],
    subject: "We've received your tattoo request — New Flower Tattoo",
    html: customerConfirmationHtml(data),
    text: customerConfirmationText(data),
  });

  if (customerResult.error !== null && customerResult.error !== undefined) {
    console.error(
      "[sendBookingEmails] Customer confirmation failed:",
      customerResult.error,
    );
    errors.push(`Customer confirmation: ${customerResult.error.message}`);
  } else {
    customerConfirmed = true;
  }

  return { artistNotified, customerConfirmed, errors };
}
