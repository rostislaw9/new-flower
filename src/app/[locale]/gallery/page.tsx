import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Gallery } from "@/components/gallery/Gallery";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { PageHeading } from "@/components/sections/PageHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow, Heading, Text } from "@/components/styled/Typography";
import { Separator } from "@/components/ui/separator";
import { createBreadcrumbList } from "@/lib/breadcrumbs";
import {
  countGalleryItems,
  getGalleryCategoryCounts,
  getGalleryItems,
} from "@/lib/gallery-loader";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery.metadata" });

  return buildPageMetadata({
    locale,
    canonical: "/gallery",
    title: t("title"),
    description: t("description"),
  });
}

const INITIAL_GALLERY_PAGE_SIZE = 12;

export default async function GalleryPage() {
  const t = await getTranslations("gallery");
  const breadcrumb = createBreadcrumbList([
    { name: "Home", item: "/" },
    { name: "Gallery", item: "/gallery" },
  ]);
  const [initialItems, totalCount, categoryCounts] = await Promise.all([
    getGalleryItems({ take: INITIAL_GALLERY_PAGE_SIZE }),
    countGalleryItems(),
    getGalleryCategoryCounts(),
  ]);

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

      {/* Gallery */}
      <Section size="md">
        <Container>
          <Gallery
            items={initialItems}
            pageSize={INITIAL_GALLERY_PAGE_SIZE}
            totalCount={totalCount}
            categoryCounts={categoryCounts}
            scrollableClassName="h-full w-full"
          />
        </Container>
      </Section>

      <Separator />

      {/* Process note */}
      <Section size="md">
        <Container>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <Eyebrow>{t("processCards.process.eyebrow")}</Eyebrow>
              <Heading as="h2" size="sm">
                {t("processCards.process.title")}
              </Heading>
              <Text muted size="sm">
                {t("processCards.process.description")}
              </Text>
            </div>
            <div className="flex flex-col gap-3">
              <Eyebrow>{t("processCards.commissions.eyebrow")}</Eyebrow>
              <Heading as="h2" size="sm">
                {t("processCards.commissions.title")}
              </Heading>
              <Text muted size="sm">
                {t("processCards.commissions.description")}
              </Text>
            </div>
            <div className="flex flex-col gap-3">
              <Eyebrow>{t("processCards.updates.eyebrow")}</Eyebrow>
              <Heading as="h2" size="sm">
                {t("processCards.updates.title")}
              </Heading>
              <Text muted size="sm">
                {t("processCards.updates.description")}
              </Text>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
