import { Suspense } from "react";
import CreerWizard from "./CreerWizard";

export const metadata = {
  title: "Créer ma carte",
  description: "Créez la carte de fidélité de votre commerce : tampons, points, cashback, niveaux VIP… à vos couleurs. 14 jours gratuits, sans carte bancaire.",
};

export default function CreerPage() {
  return (
    <section className="wiz-page">
      <Suspense fallback={<div className="wiz" style={{ minHeight: 700 }} />}>
        <CreerWizard />
      </Suspense>
    </section>
  );
}
