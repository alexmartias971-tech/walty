import Link from "next/link";
import LegalPage, { V, Email } from "@/components/Legal";
import { legal, processors } from "@/lib/site.config";
import { plans, planById, sav, trialDays } from "@/lib/offer";

export const metadata = { title: "Conditions générales de vente", description: "Conditions générales de vente des services Walty, réservés aux professionnels : formules Essentiel et Tout compris, paiement au mois, sans engagement." };

const essentiel = planById.essentiel;
const toutCompris = planById["tout-compris"];

export default function CGV() {
  return (
    <LegalPage index="L3" label="Légal" title="Conditions générales de vente" updated="20 octobre 2026">
      <p>Les présentes conditions générales de vente (« CGV ») s'appliquent à toutes les prestations fournies par <strong>Walty</strong>, exploité par <V v={legal.ownerName} />, {legal.legalFormInline}, <V v={legal.address} />, SIRET <V v={legal.siret} /> (« Walty »), à ses clients professionnels (« le Client »). Elles constituent, conformément à l'article L441-1 du Code de commerce, le socle unique de la relation commerciale.</p>

      <h2>1. Champ d'application</h2>
      <p>Les services Walty sont <strong>réservés aux professionnels</strong> (commerçants, artisans, indépendants, entreprises, associations) agissant pour les besoins de leur activité. Toute commande implique l'acceptation sans réserve des présentes CGV, qui prévalent sur tout autre document du Client, sauf accord écrit contraire. Les CGV applicables sont celles en vigueur à la date de la commande.</p>

      <h2>2. Services et formules</h2>
      <p>Walty propose la création, la mise en place et l'exploitation de cartes de fidélité digitales compatibles Apple Wallet et Google Wallet (le « Service »). La carte est une <strong>carte à tampons</strong> : le porteur reçoit un tampon à chaque passage et, au bout du nombre de tampons fixé par le Client, un produit offert ou une remise, définis par le Client. Deux formules sont proposées, payées au mois :</p>
      <ul>
        {plans.map((p) => (
          <li key={p.id}><strong>{p.name}</strong> : {p.monthly} € par mois.</li>
        ))}
      </ul>
      <p>Le contenu de chaque formule est celui décrit sur la page <Link href="/tarifs">Tarifs</Link> à la date de la commande. En particulier :</p>
      <ul>
        <li><strong>Formule {essentiel.name}.</strong> Carte à tampons au logo et aux couleurs du Client, tampons sécurisés, messages automatiques de la carte (tampon ajouté, récompense disponible), 1 accès équipe pour tamponner, installation à distance offerte, aide par WhatsApp ou e-mail sans délai garanti. Ne comprend pas : statistiques, notifications, offre d'anniversaire, lien d'avis Google, parrainage, import du fichier clients, installation sur place.</li>
        <li><strong>Formule {toutCompris.name}.</strong> Tout le contenu de la formule {essentiel.name}, avec une carte sur mesure (photos, visuels de saison), des statistiques, des notifications, une offre d'anniversaire automatique, un lien d'avis Google sur la carte, le parrainage, l'import du fichier clients offert, des accès équipe illimités, l'installation sur place et la formation de l'équipe offertes, et le SAV sous {sav.delay} garanti décrit ci-dessous.</li>
        <li><strong>Notifications.</strong> La formule {essentiel.name} ne permet pas d'envoyer de notifications aux porteurs (seuls les messages automatiques de la carte sont envoyés). La formule {toutCompris.name} permet jusqu'à 4 notifications par semaine (du lundi au dimanche), non reportables. Le Client rédige ses messages depuis son espace ; Walty les envoie à sa demande, en principe le jour même, entre 8 h et 18 h, et peut refuser ou reporter un message illicite, trompeur ou contraire aux règles d'Apple et de Google. Ces règles peuvent limiter le nombre de notifications affichées (par exemple, Google n'en affiche pas plus de 3 par carte en 24 heures) : Walty peut alors étaler les envois.</li>
        <li><strong>Accord des porteurs.</strong> Les messages de service de la carte (tampon ajouté, récompense disponible, changement des conditions du programme) sont envoyés à tous les porteurs. Les messages commerciaux (offres, promotions, nouveautés) ne sont envoyés qu'aux porteurs qui l'ont accepté en cochant, lors de leur inscription, une case non cochée par défaut. Ce filtre est appliqué automatiquement par Walty. Un porteur peut retirer son accord à tout moment ; il ne reçoit alors plus aucune offre, dès la prise en compte de sa demande. Les informations données aux porteurs figurent sur la page <Link href="/porteurs">vos données de porteur de carte</Link>.</li>
        <li><strong>Mise en place.</strong> La carte est installée à distance (formule {essentiel.name}) ou sur place, avec la formation de l'équipe (formule {toutCompris.name}), sans frais. Les porteurs ajoutent la carte en scannant un QR code imprimé sur une feuille posée au comptoir.</li>
        <li><strong>SAV sous {sav.delay} garanti (formule {toutCompris.name}).</strong> Toute demande d'assistance est prise en charge en moins de {sav.delay}, {sav.hours}. {sav.sunday} La prise en charge s'entend de la réponse de Walty et du début du traitement de la demande. Avec la formule {essentiel.name}, l'aide est apportée par WhatsApp ou e-mail, sans délai garanti.</li>
        <li><strong>Aucune option payante</strong> n'est proposée : tout ce qui est fourni est compris dans le prix de la formule.</li>
      </ul>

      <h2>3. Commande</h2>
      <p>La commande peut être passée de deux façons :</p>
      <ul>
        <li><strong>Après une démo</strong> : elle est formée par l'accord écrit du Client (signature, e-mail ou message écrit) sur la formule et son prix.</li>
        <li><strong>En ligne</strong>, avec le service « Créer ma carte » lorsqu'il est ouvert : le Client y choisit sa carte et sa formule. Cet envoi est une demande ; le contrat est formé lorsque Walty confirme par écrit (e-mail ou WhatsApp) l'activation de la carte, en rappelant la formule et le prix.</li>
      </ul>
      <p>La commande précise la formule choisie et son prix mensuel.</p>
      <p><strong>Essai gratuit.</strong> {trialDays > 0 ? `La carte est créée pendant la démo. Toute nouvelle carte peut être essayée gratuitement pendant ${trialDays} jours à compter de son activation, sans moyen de paiement. À la fin de l'essai, l'abonnement ne démarre que si le Client le confirme par écrit ; à défaut, la carte est désactivée, sans frais.` : "Aucun essai gratuit n'est proposé actuellement."}</p>

      <h2>4. Droit de rétractation des petites entreprises</h2>
      <p>Lorsque le contrat est conclu <strong>hors établissement</strong> (par exemple lors d'une visite de Walty dans les locaux du Client), que son objet n'entre pas dans le champ de l'activité principale du Client et que celui-ci emploie <strong>5 salariés au plus</strong>, le Client bénéficie, conformément à l'article L221-3 du Code de la consommation, d'un délai de <strong>14 jours</strong> à compter de la conclusion du contrat pour se rétracter, sans motif ni frais. Il lui suffit d'adresser à Walty une déclaration claire (e-mail ou courrier), ou le formulaire figurant à la fin des présentes CGV. Si le Client a demandé que le Service commence avant la fin de ce délai, il paie seulement la part correspondant au service fourni jusqu'à sa rétractation. Walty rembourse les sommes dues dans les 14 jours suivant la rétractation.</p>

      <h2>5. Prix</h2>
      <p>Les prix sont indiqués en euros. <strong>{legal.vat}</strong> : les montants facturés sont nets. Ils comprennent toutes les prestations décrites dans la formule. Le paiement se fait uniquement au mois.</p>
      <p><strong>Évolution des prix.</strong> Walty peut faire évoluer ses tarifs. Toute hausse est notifiée au Client au moins 30 jours à l'avance ; le Client peut alors résilier sans frais avant son entrée en vigueur. Les périodes déjà payées ne sont pas affectées.</p>
      <p><strong>Changement de formule.</strong> Le passage à la formule {toutCompris.name} prend effet immédiatement ; la différence de prix est due au prorata du mois en cours. Le retour à la formule {essentiel.name} prend effet au début du mois suivant.</p>

      <h2>6. Facturation et paiement</h2>
      <p>L'abonnement est facturé d'avance, chaque mois. Aucun frais d'installation n'est facturé. Les factures sont payables à réception, et au plus tard sous 15 jours, par virement ou tout autre moyen accepté par Walty. Aucun escompte n'est accordé pour paiement anticipé.</p>
      <p>Conformément à l'article L441-10 du Code de commerce, tout retard de paiement entraîne de plein droit des pénalités calculées au taux d'intérêt appliqué par la Banque centrale européenne à son opération de refinancement la plus récente, majoré de 10 points de pourcentage, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 € (article D441-5). Après une mise en demeure restée sans effet pendant 15 jours, Walty peut suspendre le Service jusqu'au paiement complet.</p>

      <h2>7. Durée et résiliation</h2>
      <p>L'abonnement est <strong>sans engagement</strong>. Il se renouvelle chaque mois et peut être résilié à tout moment par écrit (e-mail ou message) ; la résiliation prend effet à la fin du mois en cours. Le mois commencé reste dû.</p>
      <p>En cas de manquement grave de l'une des parties, non réparé 15 jours après une mise en demeure écrite, l'autre partie peut résilier le contrat de plein droit.</p>
      <p><strong>Fin du contrat.</strong> À la fin du contrat, la carte cesse de fonctionner pour les porteurs. Le Client garde la liste de ses clients : Walty lui remet, sur demande formulée dans les 30 jours, l'export de son fichier clients dans un format courant (CSV), puis supprime les données dans les conditions de l'article 11.</p>

      <h2>8. Obligations de Walty</h2>
      <p>Walty s'engage à créer la carte du Client (pendant la démo, ou, pour une carte sur mesure, dans un délai indicatif de 7 jours ouvrés après réception des éléments du Client : logo, photos, récompense), à activer une carte créée en ligne dans un délai indicatif de 24 heures ouvrées, à la mettre en place selon la formule choisie et à assurer l'assistance prévue à l'article 2. Walty est tenu d'une obligation de moyens, sauf pour le délai de prise en charge du SAV de la formule {toutCompris.name}.</p>

      <h2>9. Obligations du Client</h2>
      <ul>
        <li>Fournir des éléments (logo, photos, textes) dont il détient les droits, et garantir Walty contre toute réclamation à ce titre.</li>
        <li>Rédiger ou valider des notifications licites, loyales et non trompeuses, et honorer les récompenses et offres annoncées aux porteurs.</li>
        <li>N'adresser d'offres commerciales qu'aux porteurs ayant donné leur accord, ne pas contourner ce filtre (par exemple en glissant une promotion dans un message de service) et respecter sans délai tout retrait d'accord qui lui serait signalé directement. Les clients importés depuis un fichier existant ne reçoivent d'offres qu'après avoir installé la carte et donné leur accord.</li>
        <li>Garder confidentiels les accès caisse de son personnel et signaler sans délai toute perte ou usage anormal.</li>
        <li>Informer les porteurs de carte du traitement de leurs données : Walty affiche pour lui la mention d'information dans le formulaire d'inscription à la carte et la publie sur la page <Link href="/porteurs">vos données de porteur de carte</Link>.</li>
      </ul>

      <h2>10. Disponibilité et services tiers</h2>
      <p>Le Service repose sur des technologies de tiers, notamment Apple Wallet, Google Wallet et les hébergeurs listés à l'article 11. Walty met en œuvre des moyens raisonnables pour assurer la disponibilité du Service, sans pouvoir la garantir en continu. Walty ne saurait être responsable d'une interruption, d'une limitation ou d'une modification décidée par ces tiers (par exemple, un changement des règles d'Apple ou de Google sur les notifications ou les cartes). Des interruptions ponctuelles pour maintenance peuvent avoir lieu, de préférence en dehors des heures d'ouverture.</p>

      <h2>11. Données personnelles des porteurs de carte</h2>
      <p>Pour les données des porteurs de carte (clients du Client), <strong>le Client est responsable du traitement</strong> et <strong>Walty agit en qualité de sous-traitant</strong> au sens de l'article 28 du RGPD. À ce titre, Walty s'engage à :</p>
      <ul>
        <li>ne traiter les données que sur instruction documentée du Client et pour les seuls besoins du Service (gestion de la carte, tampons, notifications, statistiques) ;</li>
        <li>veiller à ce que les personnes autorisées à traiter les données soient soumises à la confidentialité ;</li>
        <li>mettre en œuvre des mesures de sécurité appropriées (chiffrement des échanges, authentification, cloisonnement des données par client) ;</li>
        <li>ne recourir qu'aux sous-traitants ultérieurs suivants : {processors.map((p) => p.name).join(", ")}, ainsi qu'Apple Inc. et Google LLC pour la mise à jour des cartes et l'envoi des notifications, et informer le Client de tout changement prévu, qui pourra s'y opposer ;</li>
        <li>recueillir pour le compte du Client l'accord des porteurs pour recevoir ses offres, en conserver la preuve (date, heure et version du texte affiché) et la lui remettre sur demande ;</li>
        <li>aider le Client à répondre aux demandes d'exercice des droits des porteurs et à respecter ses obligations de sécurité et d'analyse d'impact ;</li>
        <li>notifier au Client toute violation de données dans les meilleurs délais après en avoir pris connaissance ;</li>
        <li>au terme du contrat, restituer les données au Client puis les supprimer, au plus tard 30 jours après la fin du contrat, sauf obligation légale de conservation ;</li>
        <li>mettre à la disposition du Client les informations nécessaires pour démontrer le respect de ces obligations.</li>
      </ul>
      <p>Walty ne vend ni n'utilise ces données pour son propre compte. Les données personnelles du Client lui-même sont traitées conformément à la <Link href="/confidentialite">politique de confidentialité</Link>.</p>

      <h2>12. Propriété intellectuelle</h2>
      <p>Le logiciel, l'outil de gestion, la marque et la mascotte Walty restent la propriété exclusive de Walty. Les visuels de carte créés pour le Client lui sont concédés en usage pour la durée du contrat ; les éléments fournis par le Client (logo, photos) restent sa propriété, et il concède à Walty le droit de les utiliser pour exécuter le Service. Sauf opposition écrite du Client, Walty peut mentionner son nom et son logo comme référence commerciale.</p>
      <p>La feuille portant le QR code, remise au Client pour son comptoir, lui appartient.</p>

      <h2>13. Responsabilité</h2>
      <p>La responsabilité de Walty ne peut être engagée qu'en cas de faute prouvée et pour les seuls dommages directs. Sont exclus les dommages indirects tels que la perte de chiffre d'affaires, de clientèle ou d'image. En tout état de cause, la responsabilité totale de Walty est limitée aux sommes effectivement payées par le Client au cours des 12 mois précédant le fait générateur.</p>

      <h2>14. Force majeure</h2>
      <p>Aucune partie n'est responsable d'un manquement causé par un cas de force majeure au sens de l'article 1218 du Code civil, notamment cyclone, tempête tropicale, séisme, inondation, coupure généralisée d'électricité ou de réseau, ou décision des autorités. Les obligations sont suspendues pendant la durée de l'événement ; au-delà de 30 jours, chaque partie peut résilier sans indemnité.</p>

      <h2>15. Confidentialité</h2>
      <p>Chaque partie garde confidentielles les informations non publiques de l'autre (chiffres, fichiers, conditions commerciales) pendant le contrat et 2 ans après.</p>

      <h2>16. Droit applicable et litiges</h2>
      <p>Les présentes CGV sont soumises au droit français. Les parties recherchent d'abord une solution amiable. À défaut, lorsque le Client a la qualité de commerçant, tout litige relève de la compétence exclusive du {legal.court}, y compris en cas de pluralité de défendeurs ou d'appel en garantie ; dans les autres cas, les règles de compétence de droit commun s'appliquent.</p>

      <h2>17. Contact</h2>
      <p>Pour toute question sur ces conditions : <Email />.</p>

      <h2>Annexe : formulaire de rétractation</h2>
      <p>(À compléter et renvoyer uniquement si vous souhaitez vous rétracter dans les conditions de l'article 4.)</p>
      <p>À l'attention de Walty, <V v={legal.ownerName} />, <V v={legal.address} />, <Email /> :<br />
      Je notifie par la présente ma rétractation du contrat portant sur la prestation de services ci-dessous :<br />
      Formule : … · Commandée le : … · Nom du commerce : … · Nom du représentant : … · Adresse : …<br />
      Date et signature (en cas d'envoi papier) : …</p>
    </LegalPage>
  );
}
