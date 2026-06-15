export interface BookingEmailData {
  id: string;
  fullName: string;
  email: string;
  contactMethod: string;
  phone?: string | undefined;
  tattooDescription: string;
  bodyPlacement?: string | undefined;
  tattooSize?: string | undefined;
  preferredDates: string[];
  budgetRange?: string | undefined;
  referenceImageUrls: string[];
}

function row(label: string, value: string | undefined): string {
  if (value === undefined || value.trim() === "") return "";
  return `
    <tr>
      <td style="padding:8px 16px 8px 0;color:#888;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td>
      <td style="padding:8px 0;color:#f0f0f0;font-size:13px">${value}</td>
    </tr>
  `;
}

export function artistNotificationHtml(data: BookingEmailData): string {
  const imageLinks =
    data.referenceImageUrls.length > 0
      ? data.referenceImageUrls
          .map(
            (url, i) =>
              `<a href="${url}" style="color:#c9a96e;text-decoration:none;display:block;margin-bottom:4px">Reference image ${String(i + 1)}</a>`,
          )
          .join("")
      : "<span style='color:#888'>None uploaded</span>";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New Booking Request</title></head>
<body style="background:#0a0a0a;margin:0;padding:0;font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;max-width:600px;width:100%">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #222">
              <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#c9a96e">New Flower Tattoo</p>
              <h1 style="margin:12px 0 0;font-size:22px;font-weight:300;color:#f0f0f0">New booking request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px">
              <table cellpadding="0" cellspacing="0" width="100%">
                ${row("Name", data.fullName)}
                ${row("Email", data.email)}
                ${row("Contact via", data.contactMethod)}
                ${row("Phone / handle", data.phone)}
                ${row("Body placement", data.bodyPlacement)}
                ${row("Size", data.tattooSize)}
                ${row("Budget", data.budgetRange)}
                ${row("Preferred dates", data.preferredDates.join(", "))}
              </table>
              <hr style="border:none;border-top:1px solid #222;margin:24px 0">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#888">Description</p>
              <p style="margin:0;font-size:14px;color:#f0f0f0;line-height:1.7;white-space:pre-wrap">${data.tattooDescription}</p>
              <hr style="border:none;border-top:1px solid #222;margin:24px 0">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#888">Reference images</p>
              ${imageLinks}
              <hr style="border:none;border-top:1px solid #222;margin:24px 0">
              <p style="margin:0;font-size:12px;color:#555">Request ID: <span style="font-family:monospace;color:#888">${data.id}</span></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function customerConfirmationHtml(data: BookingEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Request Received — New Flower Tattoo</title></head>
<body style="background:#0a0a0a;margin:0;padding:0;font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;max-width:600px;width:100%">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #222">
              <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#c9a96e">New Flower Tattoo</p>
              <h1 style="margin:12px 0 0;font-size:22px;font-weight:300;color:#f0f0f0">We&apos;ve received your request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px">
              <p style="margin:0 0 20px;font-size:14px;color:#aaa;line-height:1.7">
                Hi ${data.fullName},<br><br>
                Thank you for reaching out. Your tattoo appointment request has been received and will be reviewed within <strong style="color:#f0f0f0">48 hours</strong>.
              </p>
              <p style="margin:0 0 20px;font-size:14px;color:#aaa;line-height:1.7">
                You&apos;ll be contacted via <strong style="color:#f0f0f0">${data.contactMethod}</strong> once the request has been reviewed.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="background:#0a0a0a;border:1px solid #1e1e1e;margin-bottom:24px">
                <tr><td style="padding:20px 24px">
                  <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#888">Your request summary</p>
                  <p style="margin:0 0 4px;font-size:13px;color:#aaa">Preferred dates: <span style="color:#f0f0f0">${data.preferredDates.join(", ")}</span></p>
                  ${data.bodyPlacement !== undefined ? `<p style="margin:0 0 4px;font-size:13px;color:#aaa">Placement: <span style="color:#f0f0f0">${data.bodyPlacement}</span></p>` : ""}
                  ${data.budgetRange !== undefined ? `<p style="margin:0 0 4px;font-size:13px;color:#aaa">Budget: <span style="color:#f0f0f0">${data.budgetRange}</span></p>` : ""}
                  <p style="margin:8px 0 0;font-size:12px;color:#555">Ref: <span style="font-family:monospace;color:#888">${data.id}</span></p>
                </td></tr>
              </table>
              <p style="margin:0;font-size:13px;color:#555;line-height:1.6">
                If you have any questions in the meantime, visit the
                <a href="${process.env["NEXT_PUBLIC_SITE_URL"] ?? ""}/contact" style="color:#c9a96e;text-decoration:none">contact page</a>
                or check the <a href="${process.env["NEXT_PUBLIC_SITE_URL"] ?? ""}/faq" style="color:#c9a96e;text-decoration:none">FAQ</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 40px;border-top:1px solid #1e1e1e">
              <p style="margin:0;font-size:11px;color:#444">New Flower Tattoo &mdash; Phuket</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function artistNotificationText(data: BookingEmailData): string {
  return [
    "NEW BOOKING REQUEST — New Flower Tattoo",
    "",
    `Name:            ${data.fullName}`,
    `Email:           ${data.email}`,
    `Contact via:     ${data.contactMethod}`,
    data.phone !== undefined ? `Phone / handle:  ${data.phone}` : "",
    `Preferred dates: ${data.preferredDates.join(", ")}`,
    data.bodyPlacement !== undefined
      ? `Placement:       ${data.bodyPlacement}`
      : "",
    data.tattooSize !== undefined ? `Size:            ${data.tattooSize}` : "",
    data.budgetRange !== undefined
      ? `Budget:          ${data.budgetRange}`
      : "",
    "",
    "Description:",
    data.tattooDescription,
    "",
    data.referenceImageUrls.length > 0
      ? `Reference images:\n${data.referenceImageUrls.join("\n")}`
      : "Reference images: none",
    "",
    `Request ID: ${data.id}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function customerConfirmationText(data: BookingEmailData): string {
  return [
    "NEW FLOWER TATTOO — Request Received",
    "",
    `Hi ${data.fullName},`,
    "",
    "Thank you for reaching out. Your tattoo appointment request has been received",
    "and will be reviewed within 48 hours.",
    "",
    `You'll be contacted via ${data.contactMethod} once the request has been reviewed.`,
    "",
    "YOUR REQUEST SUMMARY",
    `Preferred dates: ${data.preferredDates.join(", ")}`,
    data.bodyPlacement !== undefined
      ? `Placement:       ${data.bodyPlacement}`
      : "",
    data.budgetRange !== undefined
      ? `Budget:          ${data.budgetRange}`
      : "",
    `Reference:       ${data.id}`,
    "",
    "New Flower Tattoo — Phuket",
  ]
    .filter((line) => line !== "")
    .join("\n");
}
