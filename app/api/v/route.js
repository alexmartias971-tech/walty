/**
 * Statistiques de visite anonymes → CRM Walty.
 * Ni cookie, ni identifiant, ni adresse IP enregistrée : la page, la provenance et le type d'appareil, c'est tout.
 */
import { versCrm } from "@/lib/crm";
import { hoteReferent, provenance } from "@/lib/origine";

const ROBOTS = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python/i;
const vide = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export async function POST(request) {
  // seulement depuis le site lui-même
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin) {
    let ok = false;
    try { ok = new URL(origin).host === host; } catch {}
    if (!ok) return vide();
  }
  const ua = request.headers.get("user-agent") || "";
  if (!ua || ROBOTS.test(ua)) return vide();

  let b;
  try {
    const t = await request.text();
    if (t.length > 2000) return vide();
    b = JSON.parse(t);
  } catch {
    return vide();
  }
  const path = String(b?.p || "/").split(/[?#]/)[0].slice(0, 200);
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) return vide();

  // la première page d'une visite porte sa provenance ; les suivantes non
  const entree = b.e === 1;
  const utm = (k) => (entree && typeof b[k] === "string" && b[k] ? b[k].slice(0, 80) : null);
  const hote = entree ? hoteReferent(String(b.r || "")) : "";
  await versCrm("visite", {
    path,
    referrer: hote || null,
    source: entree ? provenance(utm("utm_source"), hote) : null,
    utm_source: utm("utm_source"),
    utm_medium: utm("utm_medium"),
    utm_campaign: utm("utm_campaign"),
    device: /ipad|tablet/i.test(ua) ? "tablette" : /mobi|android|iphone/i.test(ua) ? "telephone" : "ordinateur",
  });
  return vide();
}
