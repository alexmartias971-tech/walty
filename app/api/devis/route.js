import { depuisCrm } from "@/lib/crm";

/**
 * Acceptation en ligne d'un devis (page walty.fr/devis/<code>) : relayée au CRM (fonction crm-site « devis_accepter »), avec le nom
 * du signataire, l'adresse IP et le navigateur (preuve du « bon pour accord »). POST depuis walty.fr seulement.
 */
export const dynamic = "force-dynamic";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  try {
    return !!origin && !!host && new URL(origin).host === host.split(",")[0].trim();
  } catch {
    return false;
  }
}

export async function POST(request) {
  if (!sameOrigin(request)) return json({ ok: false, error: "Demande refusée." }, 403);
  const raw = await request.text().catch(() => "");
  if (raw.length > 1000) return json({ ok: false, error: "Demande trop longue." }, 413);
  let b = {};
  try {
    b = JSON.parse(raw || "{}");
  } catch {
    b = {};
  }
  const code = typeof b.code === "string" ? b.code : "";
  const nom = typeof b.nom === "string" ? b.nom.trim().slice(0, 120) : "";
  if (!/^[0-9a-f]{32}$/.test(code)) return json({ ok: false, error: "Devis introuvable." }, 404);
  if (nom.length < 2) return json({ ok: false, error: "Indiquez votre nom et votre prénom." });
  if (b.cgv !== true) return json({ ok: false, error: "Cochez la case pour accepter le devis et les conditions générales de vente." });

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim().slice(0, 64) || null;
  const ua = (request.headers.get("user-agent") || "").slice(0, 200) || null;
  const r = await depuisCrm("devis_accepter", { code, nom, ip, ua });
  if (!r) return json({ ok: false, error: "Le service est momentanément indisponible. Réessayez dans un instant." }, 502);
  if (!r.data?.ok) return json({ ok: false, error: r.data?.error || "L'acceptation n'a pas marché. Réessayez dans un instant." });
  return json({ ok: true, lien_paiement: r.data.lien_paiement || null });
}
