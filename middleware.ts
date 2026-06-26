import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area"',
    },
  });
}

function checkBasicAuth(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth) return false;

  const [type, encoded] = auth.split(" ");
  if (type !== "Basic" || !encoded) return false;

  try {
    const decoded = atob(encoded);
    const [user, pass] = decoded.split(":");

    return (
      user === process.env.ADMIN_USERNAME && pass === process.env.ADMIN_PASSWORD
    );
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n middleware for all API routes.
  // Protect only admin APIs.
  if (pathname.startsWith("/api")) {
    if (pathname.startsWith("/api/admin") && !checkBasicAuth(request)) {
      return unauthorized();
    }

    return NextResponse.next();
  }

  // Protect localized and non-localized admin pages.
  const isAdminPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/en/admin") ||
    pathname.startsWith("/th/admin");

  if (isAdminPage && !checkBasicAuth(request)) {
    return unauthorized();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
