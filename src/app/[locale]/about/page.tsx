import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { PageHeading } from "@/components/sections/PageHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow, Heading, Text } from "@/components/styled/Typography";
import { Separator } from "@/components/ui/separator";
import { type Locale, defaultLocale } from "@/i18n/config";
import { getArtistImagesConfig } from "@/lib/artist-images-config";
import { createBreadcrumbList } from "@/lib/breadcrumbs";
import { isSupportedLocale } from "@/lib/locale-utils";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.metadata" });

  return buildPageMetadata({
    locale,
    canonical: "/about",
    title: t("title"),
    description: t("description"),
  });
}

type Specialisation = {
  title: string;
  description: string;
};

type TimelineEvent = {
  year: string;
  title: string;
  description: string;
};

interface AboutReviewsPageProps {
  params: Promise<{ locale?: string }>;
}

export default async function AboutPage({ params }: AboutReviewsPageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;

  const t = await getTranslations("about");
  const breadcrumb = createBreadcrumbList([
    { name: "Home", item: "/" },
    { name: "About", item: "/about" },
  ]);

  const bioParagraphs = t.raw("bio.paragraphs") as string[];
  const specialisations = t.raw("specialisations.items") as Specialisation[];
  const timelineEvents = t.raw("timeline.events") as TimelineEvent[];
  const artistImagesConfig = await getArtistImagesConfig();
  const portraitUrl =
    artistImagesConfig.portraitUrl || "/images/artist-portrait.jpg";

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

      {/* Portrait + bio */}
      <Section size="lg">
        <Container>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            <div className="relative aspect-[3/4]">
              <Image
                src={portraitUrl}
                alt={t("bio.imageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                preload
                loading="eager"
              />
            </div>
            <div className="flex flex-col justify-center gap-8">
              <div className="flex flex-col gap-3">
                <Eyebrow>{t("bio.eyebrow")}</Eyebrow>
                <Heading as="h2" size="title">
                  {t("bio.title")}
                </Heading>
              </div>
              <div className="flex flex-col gap-4">
                {bioParagraphs.map((paragraph) => (
                  <Text key={paragraph} muted>
                    {paragraph}
                  </Text>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Separator />

      {/* Specialisations */}
      <Section size="lg">
        <Container>
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-3">
              <Eyebrow>{t("specialisations.eyebrow")}</Eyebrow>
              <Heading as="h2" size="headline">
                {t("specialisations.title")}
              </Heading>
            </div>
            <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
              {specialisations.map(({ title, description }) => (
                <article
                  key={title}
                  className="flex flex-col gap-4 bg-background p-8"
                >
                  <Heading as="h3" size="md">
                    {title}
                  </Heading>
                  <Text muted>{description}</Text>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Separator />

      {/* Timeline */}
      <Section size="lg">
        <Container>
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-3">
              <Eyebrow>{t("timeline.eyebrow")}</Eyebrow>
              <Heading as="h2" size="headline">
                {t("timeline.title")}
              </Heading>
            </div>
            <div className="flex flex-col">
              {timelineEvents.map(({ year, title, description }, index) => (
                <div
                  key={`${year}-${title}`}
                  className="grid grid-cols-[5rem_1fr] gap-8"
                >
                  <div className="flex flex-col items-center gap-0">
                    <div className="flex h-8 items-center">
                      <Text size="sm" className="font-medium text-accent">
                        {locale === "th"
                          ? (parseInt(year) + 543).toString()
                          : year}
                      </Text>
                    </div>
                    {index < timelineEvents.length - 1 && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 pb-12">
                    <Heading as="h3" size="sm">
                      {title}
                    </Heading>
                    <Text muted>{description}</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Studio info */}
      <Separator />
      <Section size="lg">
        <Container>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <Eyebrow>{t("studio.location.eyebrow")}</Eyebrow>
              <Heading as="h3" size="md">
                {t("studio.location.title")}
              </Heading>
              <Text muted>{t("studio.location.description")}</Text>
            </div>
            <div className="flex flex-col gap-3">
              <Eyebrow>{t("studio.process.eyebrow")}</Eyebrow>
              <Heading as="h3" size="md">
                {t("studio.process.title")}
              </Heading>
              <Text muted>{t("studio.process.description")}</Text>
            </div>
            <div className="flex flex-col gap-3">
              <Eyebrow>{t("studio.standards.eyebrow")}</Eyebrow>
              <Heading as="h3" size="md">
                {t("studio.standards.title")}
              </Heading>
              <Text muted>{t("studio.standards.description")}</Text>
            </div>
          </div>
        </Container>
      </Section>

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
