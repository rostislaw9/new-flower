type SchemaOrgObject = {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
};

interface JsonLdProps {
  data: SchemaOrgObject | SchemaOrgObject[];
}

function serializeSchema(data: SchemaOrgObject | SchemaOrgObject[]): string {
  return JSON.stringify(data);
}

export function JsonLd({ data }: JsonLdProps) {
  const jsonString = serializeSchema(data);

  return (
    <script
      type="application/ld+json"
      // Use template literal to inject JSON safely
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export function personSchema(): SchemaOrgObject {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "New Flower Tattoo Artist",
    url: SITE_URL,
    jobTitle: "Tattoo Artist",
    worksFor: {
      "@type": "LocalBusiness",
      name: "New Flower Tattoo",
      url: SITE_URL,
    },
    knowsAbout: [
      "Fine Line Tattoo",
      "Blackwork Tattoo",
      "Botanical Illustration Tattoo",
      "Realism Tattoo",
      "Neo Traditional Tattoo",
      "Geometric Tattoo",
    ],
    sameAs: [
      "https://www.instagram.com/tattoo_by_newflower",
      "https://www.facebook.com/NewFlowerTattoo",
      "https://www.facebook.com/new.flower.52",
    ],
  };
}

export async function localBusinessSchema(): Promise<SchemaOrgObject> {
  const { getArtistImagesConfig } = await import("@/lib/artist-images-config");
  const config = await getArtistImagesConfig();
  const logoUrl = config.logoUrl || `${SITE_URL}/og-image.jpg`;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: "New Flower Tattoo",
    description:
      "Premium tattoo studio specialising in fine line, blackwork, botanical illustration, and realism. Custom designs only.",
    url: SITE_URL,
    email: "flowerpowernew@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Phuket",
      addressCountry: "TH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 7.8804,
      longitude: 98.3923,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "14:00",
        closes: "01:00",
      },
    ],
    priceRange: "฿฿",
    currenciesAccepted: "THB",
    paymentAccepted: "Cash, Bank Transfer",
    hasMap: "https://maps.app.goo.gl/tcPQjsngtypvbPhv8",
    image: logoUrl,
    sameAs: [
      "https://www.instagram.com/tattoo_by_newflower",
      "https://www.facebook.com/NewFlowerTattoo",
      "https://www.facebook.com/new.flower.52",
    ],
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/booking`,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: {
        "@type": "Reservation",
        name: "Tattoo Appointment",
      },
    },
  };
}
