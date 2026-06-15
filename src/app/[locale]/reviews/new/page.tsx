import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { PageHeading } from "@/components/sections/PageHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { createBreadcrumbList } from "@/lib/breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviews.metadata" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "/reviews/new",
    },
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: "/reviews/new",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
  };
}

export default async function NewReviewPage() {
  const t = await getTranslations("reviews");
  const breadcrumb = createBreadcrumbList([
    { name: "Home", item: "/" },
    { name: "Reviews", item: "/reviews" },
    { name: "Leave a Review", item: "/reviews/new" },
  ]);
  const ratingArias = Array.from({ length: 5 }, (_, index) =>
    t("form.ratingAria", { rating: index + 1 }),
  );

  return (
    <>
      <JsonLd data={breadcrumb} />
      <Section size="lg" className="border-b border-border">
        <Container>
          <PageHeading
            eyebrow={t("hero.eyebrow")}
            title={t("hero.title")}
            subtitle={t("hero.subtitle")}
          />
        </Container>
      </Section>

      <Section size="lg">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col gap-8">
            <ReviewForm
              labels={{
                nameLabel: t("form.nameLabel"),
                emailLabel: t("form.emailLabel"),
                ratingLabel: t("form.ratingLabel"),
                ratingHelp: t("form.ratingHelp"),
                reviewLabel: t("form.reviewLabel"),
                reviewPlaceholder: t("form.reviewPlaceholder"),
                submit: t("form.submit"),
                submitting: t("form.submitting"),
                error: t("form.error"),
                ratingArias,
              }}
              success={{
                eyebrow: t("success.eyebrow"),
                title: t("success.title"),
                subtitle: t("success.subtitle"),
              }}
            />
          </div>
        </Container>
      </Section>
    </>
  );
}
