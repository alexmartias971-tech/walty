import { site } from "@/lib/site.config";

export default function robots() {
  if (!site.isPublic) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/espace"] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
