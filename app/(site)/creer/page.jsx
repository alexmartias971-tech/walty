import { Suspense } from "react";
import CreerWizard from "./CreerWizard";

export const metadata = {
  title: "Créer ma carte",
  description: "Créez la carte de fidélité de votre commerce en 5 minutes : couleurs, logo, cadeau. 14 jours gratuits, sans carte bancaire.",
};

export default function CreerPage() {
  return (
    <section className="wiz-page">
      <Suspense fallback={<div className="wiz-shell" style={{ minHeight: 600 }} />}>
        <CreerWizard />
      </Suspense>
    </section>
  );
}
