import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";
import { ContactCTA } from "@/components/sections/ContactCTA";
import {
  JsonLd,
  localBusinessSchema,
  personSchema,
} from "@/components/seo/JsonLd";
import { Button } from "@/components/styled/Button";
import { Eyebrow, Heading, Text } from "@/components/styled/Typography";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { getArtistImagesConfig } from "@/lib/artist-images-config";
import { createBreadcrumbList } from "@/lib/breadcrumbs";
import { getFeaturedItems } from "@/lib/portfolio-loader";
import { getFeaturedReviews } from "@/lib/reviews";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.metadata" });

  return buildPageMetadata({
    locale,
    canonical: "/",
    title: t("title"),
    description: t("description"),
  });
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const featuredItems = await getFeaturedItems();
  const featuredReviews = await getFeaturedReviews();
  const homeBreadcrumb = createBreadcrumbList([{ name: "Home", item: "/" }]);
  const artistImagesConfig = await getArtistImagesConfig();
  const portraitUrl =
    artistImagesConfig.portraitUrl || "/images/artist-portrait.jpg";
  const localBusinessSchemaData = await localBusinessSchema();

  return (
    <>
      <JsonLd data={homeBreadcrumb} />
      <JsonLd data={personSchema()} />
      <JsonLd data={localBusinessSchemaData} />

      {/* Hero */}
      <Section
        size="xl"
        className="relative flex min-h-[100vh] items-center overflow-hidden"
      >
        {/* Pattern */}
        <div
          className="absolute inset-0 bg-repeat opacity-20"
          style={{
            backgroundImage: "url('/patterns/vintage-pattern-2.png')",
            backgroundSize: "1000px",
          }}
        />

        {/* Diagonal shadow */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black via-black/80 to-transparent" />

        <Container className="relative z-10">
          <div className="flex max-w-3xl flex-col gap-8">
            <Eyebrow>{t("hero.eyebrow")}</Eyebrow>
            <Heading as="h1" size="display">
              {t("hero.title")}
            </Heading>
            <Text size="lg" muted className="max-w-lg">
              {t("hero.subtitle")}
            </Text>
            <div className="flex flex-wrap gap-4">
              <Button href="/booking" size="lg">
                {t("hero.bookButton")}
              </Button>
              <Button href="/portfolio" variant="outline" size="lg">
                {t("hero.portfolioButton")}
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Separator />

      {/* Featured Work */}
      <Section size="lg">
        <Container>
          <div className="flex flex-col gap-12">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-3">
                <Eyebrow>{t("featured.eyebrow")}</Eyebrow>
                <Heading as="h2" size="headline">
                  {t("featured.title")}
                </Heading>
              </div>
              <Button
                href="/portfolio"
                variant="ghost"
                size="sm"
                className="hidden md:block"
              >
                {t("featured.viewAll")}
              </Button>
            </div>
            <div className="flex flex-1 flex-col gap-8">
              <PortfolioGallery
                items={featuredItems}
                scrollableClassName="h-[60vh] sm:h-full"
              />
              <Button href="/portfolio" variant="outline" className="md:hidden">
                {t("featured.viewAll")}
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Separator />

      {/* About Preview */}
      <Section size="lg">
        <Container>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            <div className="relative aspect-[3/4] lg:order-last">
              <Image
                src={portraitUrl}
                alt={t("aboutPreview.imageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                preload
                loading="eager"
              />
            </div>
            <div className="flex flex-col justify-center gap-8">
              <div className="flex flex-col gap-3">
                <Eyebrow>{t("aboutPreview.eyebrow")}</Eyebrow>
                <Heading as="h2" size="headline">
                  {t("aboutPreview.title")}
                </Heading>
              </div>
              <div className="flex flex-col gap-4">
                <Text size="lg" muted>
                  {t("aboutPreview.paragraph1")}
                </Text>
                <Text size="lg" muted>
                  {t("aboutPreview.paragraph2")}
                </Text>
              </div>
              <Button href="/about" variant="outline" size="md">
                {t("aboutPreview.button")}
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Separator />

      {/* Testimonials */}
      <Section size="lg">
        <Container>
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-3">
              <Eyebrow>{t("testimonials.eyebrow")}</Eyebrow>
              <Heading as="h2" size="headline">
                {t("testimonials.title")}
              </Heading>
            </div>
            {featuredReviews.length === 0 ? (
              <Empty className="border">
                <EmptyHeader className="w-auto">
                  <EmptyTitle>
                    <Text muted>{t("testimonials.empty")}</Text>
                  </EmptyTitle>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid grid-cols-1 gap-px md:grid-cols-3">
                {featuredReviews.map((review) => (
                  <article
                    key={review.id}
                    className="flex flex-col gap-6 bg-background p-8"
                  >
                    <div
                      className="flex gap-0.5"
                      aria-label={t("testimonials.ratingAria", {
                        rating: review.rating,
                      })}
                    >
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <span
                          key={`${review.id}-star-${index}`}
                          className="text-accent"
                          aria-hidden="true"
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <Text muted className="flex-1 italic">
                      &ldquo;{review.text}&rdquo;
                    </Text>
                    <Text size="sm" className="font-medium text-foreground">
                      — {review.clientName}
                    </Text>
                  </article>
                ))}
              </div>
            )}
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
