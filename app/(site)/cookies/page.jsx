import LegalPage from "@/components/Legal";

export const metadata = { title: "Cookies", description: "Walti n'utilise aucun cookie publicitaire ni de mesure d'audience." };

export default function Cookies() {
  return (
    <LegalPage index="L5" label="Légal" title="Cookies et traceurs">
      <p><strong>En bref : aucun cookie publicitaire, aucun outil de mesure d'audience, aucun bouton de réseau social qui vous suit.</strong> C'est pourquoi ce site ne vous affiche pas de bandeau de consentement.</p>

      <h2>1. Ce que nous n'utilisons pas</h2>
      <ul>
        <li>Pas de Google Analytics, Meta Pixel, TikTok Pixel ni aucun autre outil de suivi.</li>
        <li>Pas de publicité ciblée.</li>
        <li>Pas de polices chargées depuis Google Fonts : elles sont hébergées sur notre site, votre adresse IP n'est donc transmise à aucun tiers pour les afficher.</li>
        <li>Pas de vidéo, de carte ou de widget tiers intégré.</li>
      </ul>

      <h2>2. Ce que nous utilisons, et pourquoi c'est permis sans consentement</h2>
      <p>Seuls des traceurs strictement nécessaires au fonctionnement du service sont utilisés. L'article 82 de la loi « Informatique et Libertés » et les lignes directrices de la CNIL les dispensent de consentement.</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Nom</th><th>Type</th><th>Utilité</th><th>Durée</th></tr></thead>
          <tbody>
            <tr><td>sb-…-auth-token</td><td>Stockage local</td><td>Rester connecté à l'espace commerçant ou à l'espace admin (uniquement pour les personnes qui se connectent)</td><td>Jusqu'à la déconnexion</td></tr>
            <tr><td>walti-demo-accounts-v1</td><td>Stockage local</td><td>Mode démonstration uniquement : garder dans votre navigateur les données fictives de l'espace admin</td><td>Jusqu'à effacement par vous</td></tr>
            <tr><td>walti-creer-brouillon</td><td>Stockage local</td><td>Garder sur votre appareil le formulaire « Créer ma carte » que vous n'avez pas fini, pour le reprendre plus tard. Effacé à l'envoi ou avec « Tout recommencer »</td><td>Jusqu'à l'envoi ou effacement par vous</td></tr>
            <tr><td>walti-my-card</td><td>Stockage local</td><td>Garder dans votre navigateur la carte que vous venez de créer, pour l'afficher dans votre espace commerçant</td><td>Jusqu'à effacement par vous</td></tr>
            <tr><td>walti-merchant-auth</td><td>Stockage de session</td><td>Mode démonstration uniquement : rester dans l'espace commerçant de démonstration</td><td>Jusqu'à la fermeture de l'onglet</td></tr>
            <tr><td>walti-demo-auth</td><td>Stockage de session</td><td>Mode démonstration uniquement : rester dans l'espace admin de démonstration</td><td>Jusqu'à la fermeture de l'onglet</td></tr>
          </tbody>
        </table>
      </div>

      <h2>3. Si cela change</h2>
      <p>Si nous ajoutons un jour un outil de mesure d'audience ou tout traceur non essentiel, nous vous demanderons votre accord au préalable, avec la possibilité de refuser aussi facilement que d'accepter, et cette page sera mise à jour.</p>

      <h2>4. Effacer ces données</h2>
      <p>Vous pouvez à tout moment effacer le stockage local de ce site depuis les réglages de votre navigateur (rubrique « Confidentialité » ou « Données de sites »).</p>
    </LegalPage>
  );
}
