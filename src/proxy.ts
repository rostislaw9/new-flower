import createMiddleware from "next-intl/middleware";

import { defaultLocale, localePrefix, locales } from "./i18n/config";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection: true,
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
