"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { downloadExport } from "./outils";

/**
 * « Exporter en Excel » (gérant) : un fichier CSV que l'Excel français ouvre directement (UTF-8, séparateur « ; »).
 * type = « clients » (Clients) ou « passages » (Historique). Préparé par le logiciel de cartes, via la passerelle.
 */
export default function ExportButton({ type, label, guard, say }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    if (busy) return;
    setBusy(true);
    setError("");
    const r = await downloadExport(type);
    setBusy(false);
    if (r.status === 401) return guard?.(r);
    if (!r.ok) return setError(r.unavailable ? "L'export arrive très bientôt dans votre espace." : r.error || "Export impossible. Réessayez.");
    say?.(`Fichier téléchargé ✓ (${r.name})`);
  }

  return (
    <div className="ec-export">
      <button type="button" className="btn btn-ghost btn-sm" onClick={run} disabled={busy}>
        <Icon name="download" size={16} /> {busy ? "Préparation du fichier…" : label}
      </button>
      {error && <p className="ec-alert ec-small" role="alert">{error}</p>}
      {type === "clients" && (
        <p className="field-hint">
          RGPD : les clients marqués « non » dans la colonne « Accepte les offres » ne doivent recevoir aucune promotion
          (ni SMS, ni e-mail, ni message). Gardez ce fichier pour vous, ne le partagez pas.
        </p>
      )}
    </div>
  );
}
