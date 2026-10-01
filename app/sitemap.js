import { site } from "@/lib/site.config";

const pages = ["", "/produit", "/tarifs", "/creer", "/a-propos", "/contact", "/marque", "/mentions-legales", "/confidentialite", "/cgv", "/cgu", "/cookies"];

export default function sitemap() {
  return pages.map((p) => ({ url: `${site.url}${p}`, lastModified: new Date("2026-09-30"), changeFrequency: "monthly", priority: p === "" ? 1 : 0.6 }));
}
