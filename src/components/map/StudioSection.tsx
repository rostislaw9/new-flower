"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Eyebrow, Heading, Text } from "@/components/styled/Typography";
import { cn } from "@/lib/utils";

import type { Location } from "./LocationMap";
import { LocationMap } from "./LocationMap";

type ShopHourLabelKey =
  | "workingHours.everyday"
  | "workingHours.sundayToFriday"
  | "workingHours.saturday";

type ShopHourTextKey =
  | "workingHours.2to11pm"
  | "workingHours.3pmTo1am"
  | "workingHours.3pmToMidnight";

type ShopLabelKey = "shop1" | "shop3";

type ShopHour = {
  labelKey: ShopHourLabelKey;
  textKey: ShopHourTextKey;
};

type Shop = {
  id: number;
  labelKey: ShopLabelKey;
  name: string;
  hours: ShopHour[];
};

const SHOP_DATA: Shop[] = [
  {
    id: 0,
    labelKey: "shop1",
    name: "New Flower Tattoo Shop",
    hours: [
      {
        labelKey: "workingHours.everyday",
        textKey: "workingHours.2to11pm",
      },
    ],
  },
  {
    id: 1,
    labelKey: "shop3",
    name: "New Flower Tattoo Shop III",
    hours: [
      {
        labelKey: "workingHours.sundayToFriday",
        textKey: "workingHours.3pmTo1am",
      },
      {
        labelKey: "workingHours.saturday",
        textKey: "workingHours.3pmToMidnight",
      },
    ],
  },
];

interface StudioSectionProps {
  locations: Location[];
}

export function StudioSection({ locations }: StudioSectionProps) {
  const t = useTranslations("contact.location");
  const [activeShop, setActiveShop] = useState(0);
  const activeLocation = locations[activeShop];

  return (
    <Section size="lg">
      <Container>
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-3">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <Heading as="h2" size="title">
              {t("title")}
            </Heading>
          </div>

          {/* Clickable shop cards */}
          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
            {SHOP_DATA.map((shop) => (
              <button
                key={shop.id}
                onClick={() => setActiveShop(shop.id)}
                className={cn(
                  "flex flex-col gap-4 bg-background p-8 text-left transition-colors duration-300",
                  "hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent",
                  activeShop === shop.id && "bg-secondary/50",
                )}
              >
                <Text
                  size="xs"
                  className={cn(
                    "font-semibold uppercase tracking-widest",
                    activeShop === shop.id
                      ? "text-accent"
                      : "text-muted-foreground",
                  )}
                >
                  {t(shop.labelKey)}
                </Text>
                <Heading as="h3" size="md">
                  {shop.name}
                </Heading>
                <div className="flex flex-col gap-1">
                  <Text muted size="sm">
                    {t("workingHours.text")}
                  </Text>
                  {shop.hours.map((hour) => (
                    <Text key={hour.labelKey}>
                      {t(hour.labelKey)}: {t(hour.textKey)}
                    </Text>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Map below shop cards */}
          {activeLocation && <LocationMap location={activeLocation} />}
        </div>
      </Container>
    </Section>
  );
}
