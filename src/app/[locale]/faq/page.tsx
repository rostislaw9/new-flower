import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { PageHeading } from "@/components/sections/PageHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/styled/Accordion";
import { Eyebrow, Heading, Text } from "@/components/styled/Typography";
import { Separator } from "@/components/ui/separator";
import { createBreadcrumbList } from "@/lib/breadcrumbs";
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
  const t = await getTranslations("faq");
  const breadcrumb = createBreadcrumbList([
    { name: "Home", item: "/" },
    { name: "FAQ", item: "/faq" },
  ]);

  type SectionContent = {
    category: string;
    items: Record<string, { question: string; answer: string }>;
  };

  const sections = Object.entries(
    (t as { raw: (key: string) => unknown }).raw("sections") as Record<
      string,
      SectionContent
    >,
  ).map(([sectionKey, value]) => ({
    key: sectionKey,
    category: value.category,
    items: Object.entries(value.items).map(([itemKey, itemValue]) => ({
      key: `${sectionKey}.${itemKey}`,
      question: itemValue.question,
      answer: itemValue.answer,
    })),
  }));

  const faqSchema = {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage",
    mainEntity: sections.flatMap(({ items }) =>
      items.map(({ question, answer }) => ({
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
            <div className="flex flex-col gap-16">
              {sections.map(({ category, items }) => (
                <div key={category} className="flex flex-col gap-6">
                  <Eyebrow>{category}</Eyebrow>
                  <Accordion type="single" collapsible>
                    {items.map((item) => (
                      <AccordionItem key={item.key} value={item.question}>
                        <AccordionTrigger>
                          <Heading as="h3" size="sm" className="text-left">
                            {item.question}
                          </Heading>
                        </AccordionTrigger>
                        <AccordionContent>
                          <Text muted>{item.answer}</Text>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
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
