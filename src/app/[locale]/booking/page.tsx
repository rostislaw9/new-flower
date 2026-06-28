import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { BookingForm } from "@/components/booking/BookingForm";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { PageHeading } from "@/components/sections/PageHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow, Text } from "@/components/styled/Typography";
import { Separator } from "@/components/ui/separator";
import { createBreadcrumbList } from "@/lib/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking.metadata" });

  return buildPageMetadata({
    locale,
    canonical: "/booking",
    title: t("title"),
    description: t("description"),
  });
}

type ProcessStep = {
  title: string;
  body: string;
};

export default async function BookingPage() {
  const t = await getTranslations("booking");
  const breadcrumb = createBreadcrumbList([
    { name: "Home", item: "/" },
    { name: "Booking", item: "/booking" },
  ]);

  const processSteps = t.raw("process.steps") as ProcessStep[];

  return (
    <>
      <JsonLd data={breadcrumb} />
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

      {/* Form + sidebar */}
      <Section size="lg">
        <Container>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_320px] lg:gap-24">
            {/* Form */}
            <BookingForm />

            {/* Sidebar info */}
            <aside className="sticky top-24 flex h-fit flex-col gap-10">
              <div className="flex flex-col gap-6 border border-border p-6">
                <Eyebrow>{t("process.title")}</Eyebrow>
                <ol
                  className="flex flex-col gap-4"
                  aria-label={t("process.ariaLabel")}
                >
                  {processSteps.map(({ title, body }, index) => (
                    <li key={title} className="flex gap-4">
                      <span className="font-sans text-xs font-semibold tabular-nums text-accent">
                        {index + 1}
                      </span>
                      <div className="flex flex-col gap-1">
                        <Text size="sm" className="font-medium text-foreground">
                          {title}
                        </Text>
                        <Text size="sm" muted>
                          {body}
                        </Text>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <Separator />

              <div className="flex flex-col gap-4">
                <Eyebrow>{t("faqPrompt.title")}</Eyebrow>
                <Text muted size="sm">
                  {t("faqPrompt.faq.prefix")}{" "}
                  <a
                    href="/faq"
                    className="text-foreground underline underline-offset-2 transition-colors duration-300 hover:text-accent"
                  >
                    {t("faqPrompt.faq.linkLabel")}
                  </a>{" "}
                  {t("faqPrompt.faq.suffix")}
                </Text>
                <Text muted size="sm">
                  {t("faqPrompt.contact.prefix")}{" "}
                  <a
                    href="/contact"
                    className="text-foreground underline underline-offset-2 transition-colors duration-300 hover:text-accent"
                  >
                    {t("faqPrompt.contact.linkLabel")}
                  </a>
                </Text>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
