"use client";

import { useId, useState } from "react";
import Icon from "@/components/Icon";

/**
 * « Supprimer ce client » (GÉRANT seulement, le logiciel de cartes refuse aussi un code PIN).
 * Définitif : il faut écrire SUPPRIMER. onDelete() → la réponse du serveur ({ ok, error, … }).
 */
export default function SupprimerClient({ name, onDelete }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [mot, setMot] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const pret = mot.trim().toUpperCase() === "SUPPRIMER";
  const fermer = () => { setOpen(false); setMot(""); setError(""); };

  async function submit(e) {
    e.preventDefault();
    if (!pret) return;
    setSending(true);
    setError("");
    const r = await onDelete();
    setSending(false);
    if (r && !r.ok && r.status !== 401) setError(r.error || "Suppression impossible. Réessayez.");
  }

  if (!open) {
    return (
      <button type="button" className="ec-linkbtn ec-remove-btn" onClick={() => setOpen(true)}>
        <Icon name="x" size={16} /> Supprimer ce client
      </button>
    );
  }
  return (
    <form className="ec-remove" role="alertdialog" aria-labelledby={`${id}-t`} onSubmit={submit}>
      <p id={`${id}-t`}>Supprimer {name || "ce client"} ?</p>
      <span className="field-hint">
        Sa carte, ses tampons, ses cadeaux et son historique sont effacés. Impossible de revenir en arrière.
        La carte ne se met plus à jour dans son téléphone. Il pourra se réinscrire.
      </span>
      <div className="field">
        <label htmlFor={`${id}-m`}>Écrivez SUPPRIMER pour confirmer</label>
        <input id={`${id}-m`} className="input" value={mot} maxLength={12} autoFocus autoComplete="off" autoCapitalize="characters" onChange={(e) => { setMot(e.target.value); setError(""); }} />
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="ec-inline" style={{ flexWrap: "wrap" }}>
        <button type="submit" className="btn btn-primary" disabled={sending || !pret}>
          {sending ? "Un instant…" : "Oui, supprimer"}
        </button>
        <button type="button" className="btn btn-ghost" disabled={sending} onClick={fermer}>
          Annuler
        </button>
      </div>
    </form>
  );
}
