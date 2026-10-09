/**
 * Formulaires du site → CRM Walty (fiche commerce, tâche « Rappeler », notification sur le téléphone)
 * et e-mail dans la boîte contact@walty.fr, via Resend.
 *
 * Variables à mettre dans Vercel (Settings → Environment Variables) :
 *   RESEND_API_KEY  (obligatoire)  la clé « re_… » créée dans Resend → API Keys
 *   CONTACT_TO      (facultatif)   adresse qui reçoit les demandes. Par défaut : contact@walty.fr
 *   RESEND_FROM     (facultatif)   expéditeur. Par défaut : « Walty <site@walty.fr> » (domaine vérifié dans Resend)
 *
 *   CRM_SITE_TOKEN  (facultatif)   la clé du site donnée par le CRM Walty : chaque demande arrive aussi dans le CRM
 *
 * Si ni le CRM ni Resend ne reçoivent la demande, la route répond 503/502 et le site invite à appeler.
 */
import { site } from "@/lib/site.config";
import { versCrm } from "@/lib/crm";
import { hoteReferent, provenance } from "@/lib/origine";

const MAX_BODY = 20_000; // octets
const WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_PER_WINDOW = 5; // demandes par adresse IP et par fenêtre
const hits = new Map();

function tooMany(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_PER_WINDOW;
}

const json = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const clean = (v, max) =>
  String(v ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
const line = (v, max) => clean(v, max).replace(/\s*[\r\n]+\s*/g, " ");
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const isEmail = (v) => /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i.test(v);

/** 0690 12 34 56 → 590690123456 (pour le lien WhatsApp). */
function whatsappNumber(phone) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (/^0[67]\d{8}$/.test(d)) {
    const p = d.slice(0, 4);
    const cc = ["0690", "0691"].includes(p) ? "590" : p === "0694" ? "594" : ["0696", "0697"].includes(p) ? "596" : p === "0639" ? "262" : "33";
    return cc + d.slice(1);
  }
  return d.length >= 10 ? d : "";
}

export async function POST(request) {
  // 1. Seulement depuis le site lui-même
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin) {
    let ok = false;
    try { ok = new URL(origin).host === host; } catch {}
    if (!ok) return json({ error: "Demande refusée." }, 403);
  }

  // 2. Anti-abus
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "inconnue";
  if (tooMany(ip)) return json({ error: "Trop de demandes d'affilée. Réessayez dans quelques minutes, ou appelez-nous." }, 429);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: "Message trop long." }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: "Demande illisible." }, 400); }
  if (!body || typeof body !== "object") return json({ error: "Demande illisible." }, 400);
  if (body.website) return json({ ok: true }); // pot de miel : on ne dit rien aux robots

  // 3. Champs
  const kind = body.kind === "waitlist" ? "waitlist" : "demo";
  const f = {
    business: line(body.business, 120),
    contact_name: line(body.contact_name, 120),
    sector: line(body.sector, 80),
    city: line(body.city, 80),
    phone: line(body.phone, 30),
    email: line(body.email, 160).toLowerCase(),
    preferred_channel: line(body.preferred_channel, 20),
    message: clean(body.message, 2100),
  };
  if (!f.phone && !f.email) return json({ error: "Laissez au moins un numéro ou un e-mail pour qu'on puisse vous répondre." }, 400);
  if (f.email && !isEmail(f.email)) return json({ error: "L'adresse e-mail ne semble pas valide." }, 400);
  if (f.phone && f.phone.replace(/\D/g, "").length < 9) return json({ error: "Le numéro de téléphone ne semble pas valide." }, 400);
  if (kind === "demo") {
    if (!f.business || !f.contact_name) return json({ error: "Indiquez votre nom et le nom de votre commerce." }, 400);
    if (body.consent !== true) return json({ error: "Cochez la case d'accord pour qu'on puisse vous recontacter." }, 400);
  }

  // 4. Copie dans le CRM Walty (fiche commerce, tâche « Rappeler », notification sur le téléphone)
  let page = null;
  try { page = new URL(request.headers.get("referer") || "").pathname.slice(0, 200); } catch {}
  const o = body.origine && typeof body.origine === "object" ? body.origine : null;
  const source = o ? provenance(line(o.utm_source, 80), hoteReferent(line(o.referrer, 300))) : null;
  const crm = await versCrm("contact", { kind, ...f, page, source });

  // 5. E-mail
  const key = process.env.RESEND_API_KEY;
  if (!key) return crm ? json({ ok: true }) : json({ error: "not_configured" }, 503);
  const to = process.env.CONTACT_TO || site.contact.email;
  const from = process.env.RESEND_FROM || `Walty <site@${site.domain}>`;

  const when = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short", timeZone: "America/Guadeloupe" }).format(new Date());
  const who = f.business || f.contact_name || f.email || f.phone;
  const subject = kind === "demo" ? `Nouvelle demande de démo · ${who}` : `Liste d'attente « Créer ma carte » · ${who}`;

  const rows = [
    ["Commerce", f.business],
    ["Nom", f.contact_name],
    ["Activité", f.sector],
    ["Commune", f.city],
    ["Téléphone", f.phone],
    ["E-mail", f.email],
    ["Rappeler par", f.preferred_channel],
  ].filter(([, v]) => v);

  const wa = f.phone ? whatsappNumber(f.phone) : "";
  const buttons = [
    f.phone && `<a href="tel:${esc(f.phone.replace(/[^\d+]/g, ""))}" style="${btn("#ff5b1f")}">Appeler</a>`,
    wa && `<a href="https://wa.me/${wa}" style="${btn("#25d366")}">WhatsApp</a>`,
    f.email && `<a href="mailto:${esc(f.email)}" style="${btn("#110c18")}">Répondre par e-mail</a>`,
  ].filter(Boolean).join(" ");

  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f4f1ee;font-family:Arial,Helvetica,sans-serif;color:#1d1726">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <p style="margin:0 0 6px;font-size:13px;color:#6b6480">${esc(when)}</p>
  <h1 style="margin:0 0 18px;font-size:22px">${kind === "demo" ? "Nouvelle demande de démo" : "Inscription à la liste d'attente"}</h1>
  <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden">
    ${rows.map(([k, v]) => `<tr><td style="padding:10px 14px;border-bottom:1px solid #eee;color:#6b6480;font-size:14px;width:130px">${esc(k)}</td><td style="padding:10px 14px;border-bottom:1px solid #eee;font-size:15px"><b>${esc(v)}</b></td></tr>`).join("")}
  </table>
  ${f.message ? `<div style="margin-top:14px;padding:14px;background:#fff;border-radius:12px;font-size:15px;line-height:1.5;white-space:pre-wrap">${esc(f.message)}</div>` : ""}
  ${buttons ? `<p style="margin:20px 0 0">${buttons}</p>` : ""}
  <p style="margin:22px 0 0;font-size:12px;color:#6b6480">Envoyé depuis le formulaire de walty.fr. La personne a accepté d'être recontactée au sujet de sa demande.</p>
</div></body></html>`;

  const text = [
    kind === "demo" ? "Nouvelle demande de démo" : "Inscription à la liste d'attente",
    when,
    "",
    ...rows.map(([k, v]) => `${k} : ${v}`),
    f.message ? `\n${f.message}` : "",
    "",
    "Envoyé depuis le formulaire de walty.fr.",
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html, text, ...(f.email ? { reply_to: f.email } : {}) }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[contact] Resend a refusé l'envoi :", res.status, (await res.text()).slice(0, 300));
      return crm ? json({ ok: true }) : json({ error: "send_failed" }, 502);
    }
  } catch (err) {
    console.error("[contact] Resend injoignable :", err?.name || err);
    return crm ? json({ ok: true }) : json({ error: "send_failed" }, 502);
  }
  return json({ ok: true });
}

function btn(bg) {
  return `display:inline-block;margin:0 6px 8px 0;padding:10px 16px;border-radius:999px;background:${bg};color:#fff;text-decoration:none;font-weight:bold;font-size:14px`;
}
