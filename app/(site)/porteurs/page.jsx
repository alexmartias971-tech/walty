import Link from "next/link";
import LegalPage, { Email } from "@/components/Legal";
import { legal, site, dataLocation } from "@/lib/site.config";

export const metadata = {
  title: "Vos données de porteur de carte",
  description: "Vous avez une carte de fidélité Walty dans votre téléphone ? Ce que deviennent vos données, comment accepter ou refuser les offres par notification, et comment exercer vos droits.",
};

export default function Porteurs() {
  return (
    <LegalPage index="L6" label="Légal" title="Vos données de porteur de carte">
      <p>Vous avez ajouté dans votre téléphone (Apple Wallet ou Google Wallet) la carte de fidélité d'un commerce qui fonctionne avec Walty ? Voici ce que deviennent vos données, expliqué simplement.</p>

      <div className="porteurs-tldr">
        <p className="porteurs-tldr-title">En bref</p>
        <ul>
          <li>La carte est celle du commerce : c'est lui le responsable de vos données. Walty la fait fonctionner pour son compte.</li>
          <li>Vous recevez ses offres seulement si vous avez coché la case prévue. Sans cette case, votre carte marche quand même.</li>
          <li>Vous pouvez arrêter les offres à tout moment.</li>
          <li>Vos données ne sont jamais vendues. Votre position n'est jamais collectée.</li>
        </ul>
      </div>

      <h2>1. Qui est responsable ?</h2>
      <p>Le <strong>commerce</strong> qui vous propose la carte (son nom figure sur la carte et sur le formulaire d'inscription) est responsable du traitement de vos données. <strong>Walty</strong>, exploité par {legal.ownerName}, {legal.legalFormInline}, {legal.address}, SIRET {legal.siret}, agit comme sous-traitant pour son compte (article 28 du RGPD) : nous faisons fonctionner la carte, et nous n'utilisons vos données pour rien d'autre.</p>

      <h2>2. Quelles données ?</h2>
      <ul>
        <li>Votre prénom, votre nom (facultatif), votre téléphone et/ou votre e-mail.</li>
        <li>Votre date de naissance, seulement si vous la donnez (pour une surprise le jour J).</li>
        <li>L'historique de votre carte : tampons, points, cashback, récompenses, dates de passage.</li>
        <li>Vos choix : accord ou non pour recevoir les offres et, si le commerce propose un classement, accord ou non pour y apparaître.</li>
        <li>Un identifiant technique de la carte et de votre téléphone, fourni par Apple ou Google, pour pouvoir mettre la carte à jour.</li>
      </ul>
      <p>Si le commerce l'a prévu, votre téléphone peut afficher la carte quand vous passez près de la boutique. C'est votre téléphone (et Apple ou Google, selon vos réglages) qui s'en charge : ni Walty ni le commerce ne reçoivent votre position.</p>

      <h2>3. Pourquoi ?</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>À quoi ça sert</th><th>Base légale (art. 6 RGPD)</th></tr>
          </thead>
          <tbody>
            <tr><td>Faire fonctionner votre carte : tampons, points, récompenses, et les messages de service (« +1 tampon », « votre cadeau est prêt »)</td><td>Les conditions du programme de fidélité que vous avez rejoint (6.1.b)</td></tr>
            <tr><td>Vous envoyer les offres du commerce par notification</td><td>Votre accord (6.1.a), que vous pouvez retirer à tout moment</td></tr>
            <tr><td>Vous faire une surprise pour votre anniversaire</td><td>Votre accord, en donnant ou non votre date de naissance (6.1.a)</td></tr>
            <tr><td>Vous faire apparaître au classement, si le commerce en propose un</td><td>Votre accord (6.1.a)</td></tr>
            <tr><td>Donner au commerce ses chiffres (passages, récompenses distribuées) et empêcher la triche sur les tampons</td><td>L'intérêt légitime du commerce (6.1.f)</td></tr>
          </tbody>
        </table>
      </div>

      <h2>4. Les offres par notification : votre accord</h2>
      <p>Votre carte peut vous envoyer deux sortes de messages.</p>
      <ul>
        <li><strong>Les messages de service</strong> concernent votre carte : un tampon ajouté, un cadeau prêt, un changement des conditions du programme. Ils font partie de la carte.</li>
        <li><strong>Les offres</strong> : promotions, nouveautés, événements du commerce. Vous les recevez seulement si vous avez coché cette case en créant votre carte :</li>
      </ul>
      <div className="porteurs-optin" aria-label="La case d'accord, telle qu'elle apparaît à l'inscription">
        <span className="porteurs-box" aria-hidden="true" />
        <p>J'accepte de recevoir les offres de [nom du commerce] par notification sur ma carte. Je peux arrêter à tout moment.</p>
      </div>
      <p>Cette case n'est jamais cochée d'avance, et la carte fonctionne aussi bien sans. Nous gardons la date, l'heure et la version du texte que vous avez vu, pour pouvoir prouver votre choix. Le nombre d'offres que le commerce peut envoyer est limité par sa formule.</p>

      <h3>Pour ne plus recevoir les offres</h3>
      <ul>
        <li><strong>Demandez-le au commerce</strong>, ou écrivez-nous à <Email /> : nous retirons votre accord, et vous continuez à recevoir les messages de service de votre carte.</li>
        <li><strong>Dans votre téléphone</strong> : ouvrez la carte dans votre Wallet, puis ses réglages (bouton « … » sur iPhone, menu ⋮ sur Android), et désactivez les notifications. Attention, cela coupe aussi les messages de service.</li>
        <li><strong>Supprimez la carte</strong> de votre téléphone : vous ne recevez plus rien. Pour que vos données soient aussi effacées, demandez-le (voir l'article 7).</li>
      </ul>

      <h2>5. Qui voit vos données ?</h2>
      <ul>
        <li>Le commerce : son gérant, et son équipe à la caisse pour ajouter vos tampons.</li>
        <li>Walty, pour faire fonctionner la carte.</li>
        <li>Apple ou Google, pour afficher et mettre à jour la carte dans votre Wallet.</li>
        <li>Nos hébergeurs : Supabase pour la base de données, stockée en {dataLocation}, et Vercel pour les serveurs du service. Le détail est dans notre <Link href="/confidentialite">politique de confidentialité</Link>.</li>
      </ul>
      <p>Vos données ne sont jamais vendues ni louées. Un commerce ne voit que ses propres clients.</p>

      <h2>6. Combien de temps ?</h2>
      <ul>
        <li>Tant que vous utilisez la carte, puis au plus <strong>3 ans après votre dernier passage</strong>. Ensuite, elles sont effacées ou rendues anonymes.</li>
        <li>Si le commerce arrête d'utiliser Walty, vos données lui sont rendues, puis effacées chez nous dans les 30 jours.</li>
        <li>La trace de vos choix (accord donné ou retiré) est gardée aussi longtemps que vos données.</li>
      </ul>

      <h2>7. Vos droits</h2>
      <p>Vous pouvez consulter vos données, les corriger, les faire effacer, vous opposer à leur utilisation, en limiter l'usage, les récupérer (portabilité), retirer votre accord pour les offres à tout moment, et donner des directives sur leur sort après votre décès.</p>
      <p>Adressez-vous au commerce, ou écrivez-nous à <Email /> : nous traitons ou transmettons votre demande, et une réponse vous est apportée dans un délai d'un mois. Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la CNIL : <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">www.cnil.fr/fr/plaintes</a>.</p>

      <h2>8. Vous êtes commerçant ?</h2>
      <p>Cette page est la mention d'information de vos clients. Walty l'affiche dans le formulaire d'inscription à votre carte et applique le filtre des offres pour vous. Vos engagements sont décrits dans les <Link href="/cgv">conditions générales de vente</Link> (articles 2, 9 et 11).</p>
      <p>Une question ? <Email /> ou <a href={site.contact.phoneHref}>{site.contact.phone}</a>.</p>
    </LegalPage>
  );
}
