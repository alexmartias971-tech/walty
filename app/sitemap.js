import { site } from "@/lib/site.config";

const pages = ["", "/produit", "/tarifs", "/creer", "/a-propos", "/contact", "/mentions-legales", "/confidentialite", "/cgv", "/cgu", "/cookies", "/porteurs"];

export default function sitemap() {
  return pages.map((p) => ({ url: `${site.url}${p}`, lastModified: new Date("2026-10-20"), changeFrequency: "monthly", priority: p === "" ? 1 : 0.6 }));
}
