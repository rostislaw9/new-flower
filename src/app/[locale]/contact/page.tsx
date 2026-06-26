import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { DEFAULT_LOCATIONS } from "@/components/map/LocationMap";
import { StudioSection } from "@/components/map/StudioSection";
import { PageHeading } from "@/components/sections/PageHeading";
import { JsonLd } from "@/components/seo/JsonLd";
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
  const t = await getTranslations({ locale, namespace: "contact.metadata" });

  return buildPageMetadata({
    locale,
    canonical: "/contact",
    title: t("title"),
    description: t("description"),
  });
}

const CONTACT_METHODS = [
  {
    channelKey: "channels.methods.instagram.channel",
    handleKey: "channels.methods.instagram.handle",
    descriptionKey: "channels.methods.instagram.description",
    href: "https://www.instagram.com/tattoo_by_newflower",
    external: true,
  },
  {
    channelKey: "channels.methods.facebook.channel",
    handleKey: "channels.methods.facebook.handle",
    descriptionKey: "channels.methods.facebook.description",
    href: "https://www.facebook.com/NewFlowerTattoo",
    external: true,
  },
  {
    channelKey: "channels.methods.whatsapp.channel",
    handleKey: "channels.methods.whatsapp.handle",
    descriptionKey: "channels.methods.whatsapp.description",
    href: "https://wa.me/66968076646",
    external: true,
  },
  {
    channelKey: "channels.methods.email.channel",
    handleKey: "channels.methods.email.handle",
    descriptionKey: "channels.methods.email.description",
    href: "mailto:flowerpowernew@gmail.com",
    external: false,
  },
] as const;

export default function ContactPage() {
  const t = useTranslations("contact");
  const breadcrumb = createBreadcrumbList([
    { name: "Home", item: "/" },
    { name: "Contact", item: "/contact" },
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

      {/* Contact methods */}
      <Section size="lg">
        <Container>
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-3">
              <Eyebrow>{t("channels.eyebrow")}</Eyebrow>
              <Heading as="h2" size="title">
                {t("channels.title")}
              </Heading>
            </div>
            <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
              {CONTACT_METHODS.map(
                ({ channelKey, handleKey, descriptionKey, href, external }) => (
                  <a
                    key={channelKey}
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="group flex flex-col gap-4 bg-background p-8 transition-colors duration-300 hover:bg-secondary"
                  >
                    <div className="flex flex-col gap-1">
                      <Text
                        size="xs"
                        className="font-semibold uppercase tracking-widest text-accent"
                      >
                        {t(channelKey)}
                      </Text>
                      <Heading as="h3" size="md">
                        {t(handleKey)}
                      </Heading>
                    </div>
                    <Text muted size="sm">
                      {t(descriptionKey)}
                    </Text>
                    <Text
                      size="xs"
                      className="font-semibold uppercase tracking-widest text-muted-foreground/50 transition-colors duration-300 group-hover:text-accent"
                    >
                      {t("channels.openLabel")}
                    </Text>
                  </a>
                ),
              )}
            </div>
          </div>
        </Container>
      </Section>

      <Separator />

      {/* Studio info with map */}
      <StudioSection locations={DEFAULT_LOCATIONS} />
    </>
  );
}
