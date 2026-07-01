import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

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
            <div className="flex flex-col gap-16">
              {sections.map((section) => (
                <div key={section.id} className="flex flex-col gap-6">
                  <Eyebrow>{section.title}</Eyebrow>
                  <Accordion type="single" collapsible>
                    {section.questions.map((item) => (
                      <AccordionItem key={item.id} value={item.id}>
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
