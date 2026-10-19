import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// No lastModified: a build-time Date is non-deterministic under Cache Components.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
