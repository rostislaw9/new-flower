import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { PageHeading } from "@/components/sections/PageHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/styled/Button";
import { Eyebrow, Heading, Text } from "@/components/styled/Typography";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { createBreadcrumbList } from "@/lib/breadcrumbs";
import { getVisibleReviews } from "@/lib/reviews";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviews.metadata" });

  return buildPageMetadata({
    locale,
    canonical: "/reviews",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ReviewsPage() {
  const t = await getTranslations("reviews");
  const reviews = await getVisibleReviews();
  const breadcrumb = createBreadcrumbList([
    { name: "Home", item: "/" },
    { name: "Reviews", item: "/reviews" },
  ]);

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
          {reviews.length === 0 ? (
            <Empty className="border">
              <EmptyHeader className="w-auto">
                <EmptyTitle>
                  <Text muted>{t("empty")}</Text>
                </EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 gap-px md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="flex flex-col gap-6 bg-background p-8"
                >
                  <div
                    className="flex gap-0.5"
                    aria-label={t("ratingAria", { rating: review.rating })}
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
        </Container>
      </Section>

      <Separator />

      <Section size="lg">
        <Container>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <Eyebrow>{t("cta.eyebrow")}</Eyebrow>
            <Heading as="h2" size="headline">
              {t("cta.title")}
            </Heading>
            <Text muted>{t("cta.subtitle")}</Text>
            <Button variant="accent" size="lg" href="/reviews/new">
              {t("cta.button")}
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
