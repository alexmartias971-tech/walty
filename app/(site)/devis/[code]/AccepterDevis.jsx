"use client";

import { useState } from "react";

/**
 * Sous le devis : « J'accepte » (nom et prénom du signataire, et la case des CGV), puis le lien de paiement Stripe.
 * Et « Enregistrer en PDF » (l'impression du navigateur : le devis seul, sans le reste du site).
 */
export default function AccepterDevis({ code, ouvert, accepte, paye, lienPaiement, total }) {
  const [nom, setNom] = useState("");
  const [cgv, setCgv] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [fait, setFait] = useState(accepte || paye ? { lien: lienPaiement } : null);

  async function accepter(e) {
    e.preventDefault();
    if (nom.trim().length < 2) return setErreur("Indiquez votre nom et votre prénom.");
    if (!cgv) return setErreur("Cochez la case pour accepter le devis et les conditions générales de vente.");
    setEnvoi(true);
    setErreur("");
    try {
      const r = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, nom: nom.trim(), cgv: true }),
        cache: "no-store",
      });
      const data = await r.json().catch(() => ({}));
      if (!data.ok) throw new Error(data.error || "L'acceptation n'a pas marché. Réessayez dans un instant.");
      setFait({ lien: data.lien_paiement || null, nouveau: true });
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="devis-actions">
      {fait ? (
        <div className="devis-carte">
          {paye ? (
            <p><b>Votre abonnement est activé.</b> Merci, et bienvenue chez Walty !</p>
          ) : (
            <>
              <p>
                <b>{fait.nouveau ? "Merci, le devis est accepté." : "Le devis est accepté."}</b>{" "}
                {fait.lien ? "Il reste à activer votre abonnement, par carte bancaire." : "Nous vous envoyons le lien de paiement dans un instant."}
              </p>
              {fait.lien && (
                <a className="btn btn-primary btn-lg devis-payer" href={fait.lien} target="_blank" rel="noopener noreferrer">
                  Activer mon abonnement ({total} / mois)
                </a>
              )}
              {fait.lien && <p className="devis-petit">Paiement sécurisé par Stripe.</p>}
            </>
          )}
        </div>
      ) : ouvert ? (
        <form className="devis-carte" onSubmit={accepter}>
          <p><b>Ce devis vous convient ?</b> Acceptez-le en ligne : c&apos;est votre bon pour accord.</p>
          <label className="devis-champ">
            <span>Votre nom et votre prénom</span>
            <input value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" maxLength={120} required />
          </label>
          <label className="devis-case">
            <input type="checkbox" checked={cgv} onChange={(e) => setCgv(e.target.checked)} />
            <span>J&apos;accepte ce devis et les <a href="/cgv" target="_blank" rel="noopener">conditions générales de vente</a>.</span>
          </label>
          {erreur && <p className="devis-erreur" role="alert">{erreur}</p>}
          <button className="btn btn-primary btn-lg" type="submit" disabled={envoi}>
            {envoi ? "Un instant…" : "J'accepte le devis"}
          </button>
        </form>
      ) : null}
      <button type="button" className="devis-pdf" onClick={() => window.print()}>
        Enregistrer en PDF ou imprimer
      </button>
    </div>
  );
}
