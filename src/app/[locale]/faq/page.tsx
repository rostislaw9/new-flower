import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { PageHeading } from "@/components/sections/PageHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { Separator } from "@/components/ui/separator";
import { createBreadcrumbList } from "@/lib/breadcrumbs";
import { getFaqSections } from "@/lib/faq-data";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq.metadata" });

  return buildPageMetadata({
    locale,
    canonical: "/faq",
    title: t("title"),
    description: t("description"),
  });
}

export default async function FAQPage() {
  const locale = await getLocale();
  const t = await getTranslations("faq");
  const breadcrumb = createBreadcrumbList([
    { name: "Home", item: "/" },
    { name: "FAQ", item: "/faq" },
  ]);

  const sections = await getFaqSections(locale);

  const faqSchema = {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage",
    mainEntity: sections.flatMap(({ questions }) =>
      questions.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    ),
  } as const;

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={faqSchema} />

      {/* Page hero */}
      <Section size="lg" className="border-b border-border">
        <Container>
          <PageHeading
            eyebrow={t("hero.eyebrow")}
            title={t("hero.title")}
            subtitle={t("hero.subtitle")}
          />
        </Container>
      </Section>

      {/* FAQ sections */}
      <Section size="lg">
        <Container>
          <div className="mx-auto max-w-3xl">
            <FaqAccordion sections={sections} />
          </div>
        </Container>
      </Section>

      <Separator />

      <ContactCTA
        eyebrow={t("cta.eyebrow")}
        heading={t("cta.title")}
        body={t("cta.subtitle")}
        bookButton={t("cta.bookButton")}
        contactButton={t("cta.contactButton")}
      />
    </>
  );
}
