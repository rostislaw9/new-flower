import { redirect } from "next/navigation";

import { defaultLocale } from "@/i18n/config";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";

interface GalleryItemRedirectPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function GalleryItemRedirectPage({
  params,
}: GalleryItemRedirectPageProps) {
  const { locale: rawLocale, id } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : defaultLocale;

  redirect(getLocalizedPath(`/admin/gallery/${id}/edit`, locale));
}
