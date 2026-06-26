import type { MetadataRoute } from "next";

const MANIFEST_METADATA = {
  name: "New Flower Tattoo, Phuket",
  shortName: "New Flower",
  description:
    "Premium tattoo art by a professional artist based in Phuket, Thailand. Specialising in Thai Sak Yant tattooing, Japanese style compositions, blackwork, and realism. Book your appointment today.",
};

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: MANIFEST_METADATA.name,
    short_name: MANIFEST_METADATA.shortName,
    description: MANIFEST_METADATA.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
