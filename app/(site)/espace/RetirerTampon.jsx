"use client";

import { useId, useState } from "react";
import Icon from "@/components/Icon";

/**
 * « Retirer 1 tampon » (GÉRANT seulement) : depuis la fiche du client ou après un scan, à tout moment
 * (erreur de saisie, fraude…). Confirmation « Retirer 1 tampon à Marie ? » + raison obligatoire (notée dans l'historique).
 * Jamais en dessous de 0 ; un cadeau déjà remis n'est pas touché (seul le compteur en cours baisse).
 * Le logiciel de cartes refuse aussi côté serveur un employé (code PIN) et une raison trop courte.
 *
 * onRemove(raison) → la réponse du serveur ({ ok, error, … }).
 */
export default function RetirerTampon({ first, filled = 0, total = 0, busy = false, onRemove }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [why, setWhy] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  if (filled <= 0) return null;

  const ready = total > 0 && filled >= total;
  const name = first || "ce client";

  async function submit(e) {
    e.preventDefault();
    const reason = why.trim().replace(/\s+/g, " ");
    if (reason.length < 3) return setError("Indiquez la raison (3 caractères au moins).");
    setSending(true);
    setError("");
    const r = await onRemove(reason);
    setSending(false);
    if (r?.ok) {
      setOpen(false);
      setWhy("");
    } else if (r && r.status !== 401) {
      setError(r.error || "Retrait impossible. Réessayez.");
    }
  }

  if (!open) {
    return (
      <button type="button" className="ec-linkbtn ec-remove-btn" disabled={busy} onClick={() => { setOpen(true); setError(""); }}>
        <Icon name="x" size={16} /> Retirer 1 tampon
      </button>
    );
  }
  return (
    <form className="ec-remove" role="alertdialog" aria-labelledby={`${id}-t`} onSubmit={submit}>
      <p id={`${id}-t`}>Retirer 1 tampon à {name} ?</p>
      <span className="field-hint">
        Son compteur passe de {filled} à {filled - 1}{total ? ` sur ${total}` : ""}.
        {ready ? " Son cadeau ne sera plus prêt." : ""} Un cadeau déjà remis n'est pas touché.
      </span>
      <div className="field">
        <label htmlFor={`${id}-r`}>Raison (obligatoire, notée dans l'historique)</label>
        <input
          id={`${id}-r`}
          className="input"
          value={why}
          maxLength={200}
          autoFocus
          placeholder="Ex. : tampon ajouté par erreur, carte prêtée…"
          onChange={(e) => { setWhy(e.target.value); setError(""); }}
        />
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="ec-inline">
        <button type="submit" className="btn btn-primary" disabled={sending || busy || why.trim().length < 3}>
          {sending ? "Un instant…" : "Oui, retirer 1 tampon"}
        </button>
        <button type="button" className="btn btn-ghost" disabled={sending} onClick={() => { setOpen(false); setWhy(""); setError(""); }}>
          Annuler
        </button>
      </div>
    </form>
  );
}
