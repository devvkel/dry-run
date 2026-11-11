import type { MetadataRoute } from "next";
import { DATASET_META } from "@/lib/dryrun";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date(DATASET_META.builtAt);
  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/check`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/guess`, lastModified, changeFrequency: "weekly", priority: 0.8 },
  ];
}
