import Link from "next/link";
import { notFound } from "next/navigation";
import { depuisCrm } from "@/lib/crm";
import { highlights, planById } from "@/lib/offer";
import { legal, site } from "@/lib/site.config";
import AccepterDevis from "./AccepterDevis";
import "./devis.css";

/**
 * Le devis Walty d'un commerce (26 oct. 2026) : préparé dans le CRM, envoyé par WhatsApp ou e-mail (walty.fr/devis/<code>).
 * Le commerçant le lit, l'imprime ou l'enregistre en PDF, l'accepte en ligne (« bon pour accord » : CGV art. 3, accord écrit
 * sur la formule et son prix), puis active son abonnement avec le lien de paiement Stripe du devis.
 * Les données viennent du CRM (fonction crm-site, côté serveur, avec la clé du site) ; rien n'est en cache.
 */
export const dynamic = "force-dynamic";
export const metadata = { title: "Votre devis Walty", robots: { index: false, follow: false } };

const euro = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(n) || 0);
const jour = (d) =>
  d ? new Intl.DateTimeFormat("fr-FR", { timeZone: "America/Guadeloupe", day: "numeric", month: "long", year: "numeric" }).format(new Date(d.length === 10 ? `${d}T12:00:00Z` : d)) : "";

async function lireDevis(code) {
  if (!/^[0-9a-f]{32}$/.test(code)) return null;
  const r = await depuisCrm("devis", { code });
  return r && r.status === 200 && r.data?.ok ? r.data.devis : r && r.status === 404 ? null : undefined;
}

export default async function DevisPage({ params }) {
  const { code } = await params;
  const d = await lireDevis(code);
  if (d === null) notFound();
  if (!d) {
    return (
      <section className="devis-zone wrap">
        <div className="devis-feuille">
          <h1 className="devis-titre">Votre devis</h1>
          <p>Le devis ne peut pas s&apos;afficher pour le moment. Réessayez dans quelques minutes, ou contactez-nous au <a href={site.contact.phoneHref}>{site.contact.phone}</a>.</p>
        </div>
      </section>
    );
  }

  const plan = planById[d.plan] || planById["tout-compris"];
  const lignes = Array.isArray(d.lignes) ? d.lignes : [];
  const mensuelEnPlus = lignes.filter((l) => l.type === "mensuel").reduce((t, l) => t + Number(l.prix) * Number(l.quantite || 1), 0);
  const unique = lignes.filter((l) => l.type !== "mensuel").reduce((t, l) => t + Number(l.prix) * Number(l.quantite || 1), 0);
  const mensuel = Number(d.prix_formule) + mensuelEnPlus;
  const c = d.client || {};
  const ouvert = d.statut === "envoye" && !d.expire;

  return (
    <section className="devis-zone wrap">
      {d.statut === "brouillon" && <p className="devis-bandeau">Aperçu : ce devis n&apos;est pas encore envoyé.</p>}
      {d.statut === "annule" && <p className="devis-bandeau devis-bandeau-non">Ce devis a été annulé.</p>}
      {d.expire && <p className="devis-bandeau devis-bandeau-non">Ce devis a expiré le {jour(d.valide_jusqu)}. Demandez-nous un nouveau devis : <a href={site.contact.phoneHref}>{site.contact.phone}</a>.</p>}

      <article className="devis-feuille" aria-label={`Devis ${d.numero}`}>
        <header className="devis-tete">
          <div>
            <p className="devis-marque">Walty</p>
            <p className="devis-petit">
              {legal.ownerName}, {legal.legalFormInline}
              <br />
              {legal.address}
              <br />
              SIRET {legal.siret}
              <br />
              {site.contact.email} · {site.contact.phone}
            </p>
          </div>
          <div className="devis-ref">
            <h1 className="devis-titre">Devis</h1>
            <p className="devis-petit">
              N° <b>{d.numero}</b>
              <br />
              Du {jour(d.date)}
              <br />
              Valable jusqu&apos;au {jour(d.valide_jusqu)}
            </p>
          </div>
        </header>

        <div className="devis-client">
          <p className="devis-etiquette">Pour</p>
          <p>
            <b>{c.nom || "—"}</b>
            {c.contact && <><br />{c.contact}</>}
            {c.adresse && <><br />{c.adresse}</>}
            {(c.email || c.telephone) && <><br />{[c.email, c.telephone].filter(Boolean).join(" · ")}</>}
          </p>
        </div>

        <table className="devis-table">
          <thead>
            <tr>
              <th scope="col">Désignation</th>
              <th scope="col" className="num">Qté</th>
              <th scope="col" className="num">Prix</th>
              <th scope="col" className="num">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <b>Abonnement Walty {plan.name}</b>
                <span className="devis-detail">Carte de fidélité Apple Wallet et Google Wallet, sans engagement.</span>
                <ul className="devis-points">
                  {(highlights[plan.id] || []).filter(([ok]) => ok).map(([, t]) => <li key={t}>{t}</li>)}
                </ul>
              </td>
              <td className="num">1</td>
              <td className="num">{euro(d.prix_formule)}<span className="devis-par"> / mois</span></td>
              <td className="num">{euro(d.prix_formule)}<span className="devis-par"> / mois</span></td>
            </tr>
            <tr>
              <td><b>Installation et mise en place de la carte</b><span className="devis-detail">Préparation de la carte à vos couleurs, QR code du comptoir.</span></td>
              <td className="num">1</td>
              <td className="num">Offerte</td>
              <td className="num">{euro(0)}</td>
            </tr>
            {lignes.map((l, i) => (
              <tr key={i}>
                <td><b>{l.libelle}</b></td>
                <td className="num">{l.quantite || 1}</td>
                <td className="num">{Number(l.prix) === 0 ? "Offert" : <>{euro(l.prix)}{l.type === "mensuel" && <span className="devis-par"> / mois</span>}</>}</td>
                <td className="num">{euro(Number(l.prix) * Number(l.quantite || 1))}{l.type === "mensuel" && <span className="devis-par"> / mois</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="devis-totaux">
          <p><span>Abonnement mensuel</span><b>{euro(mensuel)} / mois</b></p>
          {unique !== 0 && <p><span>Frais uniques</span><b>{euro(unique)}</b></p>}
          {d.essai_jours > 0 && <p className="devis-essai"><span>Essai gratuit</span><b>{d.essai_jours} jours</b></p>}
          <p className="devis-petit">Prix nets en euros. {legal.vat}.</p>
        </div>

        <div className="devis-conditions">
          <p className="devis-etiquette">Conditions</p>
          <ul>
            {d.essai_jours > 0 && <li>Essai gratuit de {d.essai_jours} jours à compter de l&apos;activation de la carte.</li>}
            <li>Abonnement payé au mois, par carte bancaire (paiement sécurisé par Stripe), sans engagement : résiliable à tout moment par écrit, effet à la fin du mois en cours.</li>
            <li>Ce devis vaut commande une fois accepté (bon pour accord), selon nos <Link href="/cgv">conditions générales de vente</Link>, qui précisent aussi le droit de rétractation des petites entreprises (article 4).</li>
          </ul>
          {d.note && <p className="devis-note">{d.note}</p>}
        </div>

        <div className="devis-accord">
          {d.statut === "accepte" || d.statut === "paye" ? (
            <p className="devis-ok">
              Bon pour accord : devis accepté le {jour(d.accepte_at)} par <b>{d.accepte_par}</b>.
              {d.statut === "paye" && <> Abonnement activé le {jour(d.paye_at)}.</>}
            </p>
          ) : (
            <p className="devis-petit devis-imprime">Bon pour accord, date et signature :</p>
          )}
        </div>
      </article>

      <AccepterDevis code={code} ouvert={ouvert} accepte={d.statut === "accepte"} paye={d.statut === "paye"} lienPaiement={d.lien_paiement} total={euro(mensuel)} />
    </section>
  );
}
