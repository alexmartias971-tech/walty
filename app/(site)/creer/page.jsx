import { Suspense } from "react";
import ComingSoon from "./ComingSoon";

// L'assistant complet (9 étapes) est gardé dans CreerWizard.jsx pour la future version avec l'agent IA.
export const metadata = {
  title: "Créer ma carte · Bientôt disponible",
  description: "Bientôt, notre agent IA crée votre carte de fidélité en 2 minutes. En attendant, réservez une démo gratuite : on crée votre carte pour vous.",
};

export default function CreerPage() {
  return (
    <section className="soon-page">
      <Suspense fallback={<div className="soon" style={{ minHeight: 640 }} />}>
        <ComingSoon />
      </Suspense>
    </section>
  );
}
