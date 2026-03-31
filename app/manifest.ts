import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kockulator PT-PT",
    short_name: "Kockulator",
    description:
      "Progressive Web App for splitting badminton session costs, shuttlecock usage, and court rental.",
    start_url: "/",
    display: "standalone",
    background_color: "#101010",
    theme_color: "#f97316",
    orientation: "portrait",
    lang: "en",
    categories: ["sports", "finance", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}
