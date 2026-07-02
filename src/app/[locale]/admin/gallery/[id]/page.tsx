import { redirect } from "next/navigation";

interface GalleryItemRedirectPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function GalleryItemRedirectPage({
  params,
}: GalleryItemRedirectPageProps) {
  const { locale, id } = await params;

  redirect(`/${locale}/admin/gallery/${id}/edit`);
}
