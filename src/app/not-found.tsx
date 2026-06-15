import { getLocale, getTranslations } from "next-intl/server";

import { NotFoundSection } from "@/components/sections/NotFoundSection";
import { defaultLocale } from "@/i18n/config";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";

export default async function GlobalNotFound() {
  const rawLocale = await getLocale();
  const locale = isSupportedLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "home.notFound" });
  const homeHref = getLocalizedPath("/", locale);
  const portfolioHref = getLocalizedPath("/portfolio", locale);

  return (
    <NotFoundSection
      eyebrow={t("eyebrow")}
      title={t("title")}
      subtitle={t("subtitle")}
      primaryHref={homeHref}
      primaryLabel={t("primary")}
      secondaryHref={portfolioHref}
      secondaryLabel={t("secondary")}
    />
  );
}
