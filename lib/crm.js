/**
 * Envoi au CRM Walty (fonction « crm-site » du projet Supabase carte-fidelite), côté serveur uniquement.
 * Variable Vercel : CRM_SITE_TOKEN (la clé du site, fournie par le CRM).
 * Sans elle, rien n'est envoyé et le site fonctionne exactement comme avant.
 */
const CRM_URL = "https://llsvrdoeqenaljlyolgi.supabase.co/functions/v1/crm-site";
// Clé publique Supabase (faite pour être visible) : l'accès réel est protégé par CRM_SITE_TOKEN.
const CRM_PUBLIC = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsc3ZyZG9lcWVuYWxqbHlvbGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0Mjc4NDgsImV4cCI6MjEwNjAwMzg0OH0.TTXWK6MFcUbuRpEI9YV7wkHgGSnbDND12vDWR6DB3LY";

export async function versCrm(action, donnees) {
  const jeton = process.env.CRM_SITE_TOKEN;
  if (!jeton) return false;
  try {
    const r = await fetch(CRM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${CRM_PUBLIC}`, apikey: CRM_PUBLIC, "x-site-token": jeton },
      body: JSON.stringify({ action, ...donnees }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!r.ok) console.error("[crm] refus :", r.status, (await r.text()).slice(0, 200));
    return r.ok;
  } catch (err) {
    console.error("[crm] injoignable :", err?.name || err);
    return false;
  }
}

/**
 * Lecture depuis le CRM (côté serveur) : la réponse de la fonction crm-site, ou null si le CRM n'est pas branché ou injoignable.
 * Utilisé par la page des devis (walty.fr/devis/<code>) et par /api/devis (acceptation en ligne).
 */
export async function depuisCrm(action, donnees) {
  const jeton = process.env.CRM_SITE_TOKEN;
  if (!jeton) return null;
  try {
    const r = await fetch(CRM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${CRM_PUBLIC}`, apikey: CRM_PUBLIC, "x-site-token": jeton },
      body: JSON.stringify({ action, ...donnees }),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    const data = await r.json().catch(() => null);
    return { status: r.status, data: data && typeof data === "object" ? data : {} };
  } catch (err) {
    console.error("[crm] injoignable :", err?.name || err);
    return null;
  }
}
