import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Allow everything: social crawlers (X, Discord, Telegram) need /api/og/* for share cards.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
