import Link from "next/link";
import LegalPage, { V, Email } from "@/components/Legal";
import { legal, processors } from "@/lib/site.config";
import { plans, addons } from "@/lib/offer";

export const metadata = { title: "Conditions générales de vente", description: "Conditions générales de vente des services Walti, réservés aux professionnels." };

export default function CGV() {
  return (
    <LegalPage index="L3" label="Légal" title="Conditions générales de vente">
      <p>Les présentes conditions générales de vente (« CGV ») s'appliquent à toutes les prestations fournies par <strong>Walti</strong>, exploité par <V v={legal.ownerName} />, {legal.legalForm.toLowerCase()}, <V v={legal.address} />, SIRET <V v={legal.siret} /> (« Walti »), à ses clients professionnels (« le Client »). Elles constituent, conformément à l'article L441-1 du Code de commerce, le socle unique de la relation commerciale.</p>

      <h2>1. Champ d'application</h2>
      <p>Les services Walti sont <strong>réservés aux professionnels</strong> (commerçants, artisans, indépendants, entreprises, associations) agissant pour les besoins de leur activité. Toute commande implique l'acceptation sans réserve des présentes CGV, qui prévalent sur tout autre document du Client, sauf accord écrit contraire. Les CGV applicables sont celles en vigueur à la date de la commande.</p>

      <h2>2. Services</h2>
      <p>Walti propose la création, la mise en place et l'exploitation de cartes de fidélité digitales compatibles Apple Wallet et Google Wallet (le « Service »), comprenant selon la formule choisie :</p>
      <ul>
        <li>la conception graphique de la carte aux couleurs du Client ;</li>
        <li>la mise en place sur place, le kit comptoir et la formation du personnel ;</li>
        <li>l'accès à l'outil de tamponnage et de gestion de la clientèle ;</li>
        <li>l'envoi de notifications aux porteurs de la carte, dans la limite prévue par la formule ;</li>
        <li>les bilans chiffrés et services complémentaires prévus par la formule.</li>
      </ul>
      <p>Le contenu de chaque formule ({plans.map((p) => p.name).join(", ")}) et des options ({addons.length} options à la carte) est celui décrit sur la page <Link href="/tarifs">Tarifs</Link> et/ou dans le devis à la date de la commande.</p>

      <h2>3. Commande</h2>
      <p>La commande est formée par l'acceptation écrite du devis ou du bon de commande par le Client (signature, e-mail ou message écrit). Elle précise la formule, le mode de paiement (mensuel ou annuel), les options et, le cas échéant, le bénéfice de l'offre fondateurs.</p>

      <h2>4. Prix</h2>
      <p>Les prix sont indiqués en euros. <strong>{legal.vat}</strong> : les montants facturés sont nets. Ils comprennent les prestations décrites dans la formule ; les options sont facturées en sus.</p>
      <p><strong>Offre fondateurs.</strong> Les dix premiers Clients désignés comme « fondateurs » dans leur devis conservent le prix de leur formule à la date de souscription tant que leur abonnement se poursuit sans interruption. Un changement de formule applique le prix fondateur de la nouvelle formule s'il existe, à défaut le prix en vigueur.</p>
      <p><strong>Évolution des prix.</strong> Walti peut faire évoluer ses tarifs. Toute hausse est notifiée au Client au moins 30 jours à l'avance ; le Client peut alors résilier sans frais avant son entrée en vigueur. Les périodes déjà payées ne sont pas affectées.</p>

      <h2>5. Facturation et paiement</h2>
      <p>La mise en place est facturée à la commande. L'abonnement est facturé d'avance, chaque mois ou pour 12 mois selon l'option choisie. Les factures sont payables à réception, et au plus tard sous 15 jours, par virement ou tout autre moyen accepté par Walti. Aucun escompte n'est accordé pour paiement anticipé.</p>
      <p>Conformément à l'article L441-10 du Code de commerce, tout retard de paiement entraîne de plein droit des pénalités calculées au taux d'intérêt appliqué par la Banque centrale européenne à son opération de refinancement la plus récente, majoré de 10 points, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 € (article D441-5). Après une mise en demeure restée sans effet pendant 15 jours, Walti peut suspendre le Service jusqu'au paiement complet.</p>

      <h2>6. Durée, renouvellement et résiliation</h2>
      <ul>
        <li><strong>Essentiel et Premium, paiement mensuel :</strong> sans engagement. L'abonnement se renouvelle chaque mois et peut être résilié à tout moment par écrit (e-mail ou message) ; la résiliation prend effet à la fin du mois en cours.</li>
        <li><strong>Paiement annuel :</strong> l'abonnement court pour 12 mois. Walti rappelle au Client l'échéance au moins 30 jours avant ; à défaut de résiliation avant l'échéance, il est reconduit pour 12 mois. La période annuelle payée n'est pas remboursable, sauf manquement de Walti.</li>
        <li><strong>Enseigne :</strong> engagement de 12 mois, puis reconduction mensuelle sans engagement, sauf stipulation contraire du devis.</li>
      </ul>
      <p>En cas de manquement grave de l'une des parties, non réparé 15 jours après une mise en demeure écrite, l'autre partie peut résilier le contrat de plein droit.</p>
      <p><strong>Fin du contrat.</strong> À la fin du contrat, la carte cesse de fonctionner pour les porteurs. Walti remet au Client, sur demande formulée dans les 30 jours, l'export de son fichier clients dans un format courant (CSV), puis supprime les données dans les conditions de l'article 10.</p>

      <h2>7. Obligations de Walti</h2>
      <p>Walti s'engage à réaliser la carte et la mise en place dans un délai indicatif de 7 jours ouvrés après réception des éléments du Client (logo, photos, récompense), à former le personnel désigné, et à assurer un support par e-mail ou WhatsApp aux horaires indiqués sur le site. Walti est tenu d'une obligation de moyens.</p>

      <h2>8. Obligations du Client</h2>
      <ul>
        <li>Fournir des éléments (logo, photos, textes) dont il détient les droits, et garantir Walti contre toute réclamation à ce titre.</li>
        <li>Rédiger ou valider des notifications licites, loyales et non trompeuses, et honorer les récompenses et offres annoncées aux porteurs.</li>
        <li>Garder confidentiels les accès caisse de son personnel et signaler sans délai toute perte ou usage anormal.</li>
        <li>Informer les porteurs de carte du traitement de leurs données (Walti fournit un modèle de mention d'information).</li>
      </ul>

      <h2>9. Disponibilité et services tiers</h2>
      <p>Le Service repose sur des technologies de tiers, notamment Apple Wallet, Google Wallet et les hébergeurs listés à l'article 10. Walti met en œuvre des moyens raisonnables pour assurer la disponibilité du Service, sans pouvoir la garantir en continu. Walti ne saurait être responsable d'une interruption, d'une limitation ou d'une modification décidée par ces tiers (par exemple, un changement des règles d'Apple ou de Google sur les notifications ou les cartes). Des interruptions ponctuelles pour maintenance peuvent avoir lieu, de préférence en dehors des heures d'ouverture.</p>

      <h2>10. Données personnelles des porteurs de carte</h2>
      <p>Pour les données des porteurs de carte (clients du Client), <strong>le Client est responsable du traitement</strong> et <strong>Walti agit en qualité de sous-traitant</strong> au sens de l'article 28 du RGPD. À ce titre, Walti s'engage à :</p>
      <ul>
        <li>ne traiter les données que sur instruction documentée du Client et pour les seuls besoins du Service (gestion de la carte, tampons, notifications, statistiques) ;</li>
        <li>veiller à ce que les personnes autorisées à traiter les données soient soumises à la confidentialité ;</li>
        <li>mettre en œuvre des mesures de sécurité appropriées (chiffrement des échanges, authentification, cloisonnement des données par client) ;</li>
        <li>ne recourir qu'aux sous-traitants ultérieurs suivants : {processors.map((p) => p.name).join(", ")}, ainsi qu'Apple Inc. et Google LLC pour la mise à jour des cartes et l'envoi des notifications, et informer le Client de tout changement prévu, qui pourra s'y opposer ;</li>
        <li>aider le Client à répondre aux demandes d'exercice des droits des porteurs et à respecter ses obligations de sécurité et d'analyse d'impact ;</li>
        <li>notifier au Client toute violation de données dans les meilleurs délais après en avoir pris connaissance ;</li>
        <li>au terme du contrat, restituer les données au Client puis les supprimer, au plus tard 30 jours après la fin du contrat, sauf obligation légale de conservation ;</li>
        <li>mettre à la disposition du Client les informations nécessaires pour démontrer le respect de ces obligations.</li>
      </ul>
      <p>Walti ne vend ni n'utilise ces données pour son propre compte. Les données personnelles du Client lui-même sont traitées conformément à la <Link href="/confidentialite">politique de confidentialité</Link>.</p>

      <h2>11. Propriété intellectuelle</h2>
      <p>Le logiciel, l'outil de gestion, la marque et la mascotte Walti restent la propriété exclusive de Walti. Les visuels de carte créés pour le Client lui sont concédés en usage pour la durée du contrat ; les éléments fournis par le Client (logo, photos) restent sa propriété, et il concède à Walti le droit de les utiliser pour exécuter le Service. Sauf opposition écrite du Client, Walti peut mentionner son nom et son logo comme référence commerciale.</p>
      <p>Le kit comptoir et la plaque NFC remis au Client lui appartiennent ; leur remplacement est facturé au prix des options.</p>

      <h2>12. Responsabilité</h2>
      <p>La responsabilité de Walti ne peut être engagée qu'en cas de faute prouvée et pour les seuls dommages directs. Sont exclus les dommages indirects tels que la perte de chiffre d'affaires, de clientèle ou d'image. En tout état de cause, la responsabilité totale de Walti est limitée aux sommes effectivement payées par le Client au cours des 12 mois précédant le fait générateur.</p>

      <h2>13. Force majeure</h2>
      <p>Aucune partie n'est responsable d'un manquement causé par un cas de force majeure au sens de l'article 1218 du Code civil, notamment cyclone, tempête tropicale, séisme, inondation, coupure généralisée d'électricité ou de réseau, ou décision des autorités. Les obligations sont suspendues pendant la durée de l'événement ; au-delà de 30 jours, chaque partie peut résilier sans indemnité.</p>

      <h2>14. Confidentialité</h2>
      <p>Chaque partie garde confidentielles les informations non publiques de l'autre (chiffres, fichiers, conditions commerciales) pendant le contrat et 2 ans après.</p>

      <h2>15. Droit applicable et litiges</h2>
      <p>Les présentes CGV sont soumises au droit français. Les parties recherchent d'abord une solution amiable. À défaut, lorsque le Client a la qualité de commerçant, tout litige relève de la compétence exclusive du {legal.court}, y compris en cas de pluralité de défendeurs ou d'appel en garantie ; dans les autres cas, les règles de compétence de droit commun s'appliquent.</p>

      <h2>16. Contact</h2>
      <p>Pour toute question sur ces conditions : <Email />.</p>
    </LegalPage>
  );
}
