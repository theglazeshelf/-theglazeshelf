import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Glaze Shelf",
    short_name: "Glaze Shelf",
    description: "Know what you have. Discover what works.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6450c8",
    icons: [
      {
        src: "/icon.png",
        sizes: "1254x1254",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
