import { redirect } from "next/navigation";

interface PortfolioItemRedirectPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function PortfolioItemRedirectPage({
  params,
}: PortfolioItemRedirectPageProps) {
  const { locale, id } = await params;

  redirect(`/${locale}/admin/portfolio/${id}/edit`);
}
