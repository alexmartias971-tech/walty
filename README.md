# Walty — site, création de carte en ligne, espace commerçant, espace admin

Carte de fidélité digitale (Apple Wallet & Google Wallet) pour les commerces de Guadeloupe.
Site Next.js prêt pour GitHub → Vercel. **Version 12 : le vrai espace commerçant sur walty.fr/espace** (lien d'accès + code PIN, scanner des cartes, clients, chiffres, offres, messages, branché au logiciel de cartes « cartedefid » ; voir `A-LIRE.md` livré avec cette version). Version 11 : branché au CRM Walty (chaque demande de démo arrive dans le CRM avec une notification, visites comptées sans cookie). Version 10 (e-mail contact@walty.fr, demandes reçues par e-mail via Resend, page « porteurs de carte », prestataires à jour, visible sur Google en production).

## Ce qu'il y a dedans

| Page | Adresse |
| --- | --- |
| Accueil | `/` |
| Le produit | `/produit` |
| Tarifs (Essentiel 9 € · Tout compris 15 €, au mois, sans engagement) | `/tarifs` |
| **Créer ma carte** : écran « Bientôt disponible » animé (agent IA à venir) avec « Réserver une démo » et une liste d'attente « Me prévenir ». L'ancien assistant en 9 étapes est gardé dans `app/(site)/creer/CreerWizard.jsx` | `/creer` |
| **Espace commerçant** (lien d'accès + code PIN ; scanner les cartes, clients, chiffres, offres, messages). Lien discret en bas de chaque page | `/espace` |
| Contact (réserver une démo) | `/contact` |
| À propos | `/a-propos` |
| Identité de marque + planche mascotte (page interne : pas de lien sur le site, pas sur Google) | `/marque` |
| Mentions légales, Confidentialité, CGV, CGU, Cookies | `/mentions-legales`, `/confidentialite`, `/cgv`, `/cgu`, `/cookies` |
| Vos données de porteur de carte (clients des commerces, accord pour les offres) | `/porteurs` |
| **Espace admin** (prospects, pipeline, clients, suivi, cartes créées en ligne, export CSV) | `/admin` |

Partout, deux portes d'entrée : **Créer ma carte** (le commerçant fait seul, essai 14 jours) et **Réserver une démo** (vous venez chez lui).

## 1. Mettre en ligne (sans rien installer)

1. Dézippez le fichier `walty-site-v10.zip`.
2. Sur GitHub, ouvrez votre dépôt existant (ex. `walty`) → **Add file → Upload files**, glissez **tout le contenu** du dossier (pas le dossier lui-même), puis **Commit changes**. Les fichiers existants sont remplacés.
3. Vercel redéploie tout seul si le dépôt est relié au projet. Sinon : **Add New → Project** → importez le dépôt → **Deploy**.

Le site marche tout de suite en **mode démo** :
- `/creer` : la carte créée apparaît dans l'admin et dans l'espace commerçant **du même navigateur** ;
- `/espace` : le **vrai** espace commerçant (lien d'accès et code PIN donnés par Walty à chaque commerce), relié au logiciel de cartes ;
- `/admin` → « Entrer dans la démo » : données fictives.

## 1 bis. Brancher le CRM Walty (version 11)

1. **Supabase → projet carte-fidelite → Table Editor → `crm_config`** : copiez la valeur de la ligne `site_token`.
2. **Vercel → projet walty → Settings → Environment Variables** : ajoutez `CRM_SITE_TOKEN` = cette valeur, cochez Production et Preview, **Save**.
3. Envoyez cette version sur GitHub (comme d'habitude) : Vercel redéploie tout seul.

Ensuite, chaque demande de démo crée (ou complète) la fiche du commerce dans le CRM, avec une tâche « Rappeler » et une notification sur le téléphone. Les visites (page, provenance, téléphone ou ordinateur) sont comptées sans cookie, sans identifiant et sans adresse IP : pas de bandeau de consentement à ajouter. Sans `CRM_SITE_TOKEN`, le site fonctionne exactement comme la version 10.

## 2. Recevoir les demandes par e-mail (Resend)

Les formulaires « Réserver une démo » et « Me prévenir » envoient un e-mail à **contact@walty.fr** (route `app/api/contact/route.js`).

1. **Resend → Domains → Add domain** : `walty.fr`, région **Ireland (eu-west-1)** (important : c'est ce qu'annonce la politique de confidentialité).
2. Resend affiche 3 à 4 enregistrements DNS (DKIM `resend._domainkey`, SPF et MX sur `send`). Dans **OVHcloud → Noms de domaine → walty.fr → Zone DNS → Ajouter une entrée**, créez-les un par un en recopiant exactement le type, le sous-domaine et la valeur. Ne touchez pas aux MX existants de walty.fr : ce sont ceux de votre boîte mail OVH.
3. Revenez dans Resend → **Verify DNS records**. Comptez de quelques minutes à quelques heures.
4. **Resend → API Keys → Create API key** (droit « Sending access », domaine walty.fr). Copiez la clé `re_…` (elle ne s'affiche qu'une fois).
5. **Vercel → projet walty → Settings → Environment Variables** : ajoutez `RESEND_API_KEY` = la clé, cochez Production (et Preview), **Save**.
6. **Deployments → … → Redeploy**. Testez le formulaire de `/contact` : l'e-mail arrive dans contact@walty.fr, avec des boutons Appeler / WhatsApp / Répondre.

Tant que `RESEND_API_KEY` n'est pas en place, le formulaire invite le visiteur à vous appeler (rien n'est perdu sans prévenir).
Facultatif : `CONTACT_TO` (autre adresse de réception) et `RESEND_FROM` (autre expéditeur, par défaut `Walty <site@walty.fr>`).

## 3. Brancher la base de données de l'espace admin (Supabase) — plus tard

> ⚠️ **Ne lancez pas `supabase/schema.sql` dans le projet « carte-fidelite »** : il contient déjà une table `admins` et une fonction `is_admin()` utilisées par l'application des cartes, que ce script remplacerait. Il faudra une version adaptée (à préparer ensemble).

Ce qui suit concerne un projet Supabase dédié au site.

1. Dans Supabase, créez un projet (région **Frankfurt / eu-central-1**, pour rester en Europe).
2. **SQL Editor → New query** : collez `supabase/schema.sql` → **Run**. (Si vous l'aviez déjà exécuté avant, relancez-le : il ajoute les nouvelles colonnes, dont la facturation, sans rien effacer.)
3. **Authentication → Users → Add user** : votre e-mail + un mot de passe.
4. Dans le SQL Editor, exécutez (avec votre e-mail) :
   `insert into public.admins (email) values ('votre-email@exemple.fr');`
5. **Project Settings → API** : copiez l'URL et la clé `anon public`.
6. Dans Vercel : **Settings → Environment Variables**, ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (`https://walty.fr`)
7. **Deployments → Redeploy**.

**Donner son accès à un commerçant** : ce n'est plus ici. L'accès se crée dans le logiciel de cartes (cartedefid → fiche du commerce → accès commerçant : lien + code PIN). Le commerçant ouvre `https://walty.fr/espace?acces=<le code du lien>` et tape son PIN.

Sécurité : les visiteurs peuvent seulement *déposer* une demande, jamais lire la base. Les commerçants ne voient que leur carte (jamais vos notes ni les autres clients). Seuls les e-mails de la table `admins` voient tout.

> L'espace commerçant (`/espace`) affiche les **vrais** chiffres, lus dans le logiciel de cartes. `lib/kpis.js` ne sert plus qu'à l'aperçu d'exemple de la page d'accueil.

## 4. Visibilité sur Google

En production sur Vercel, le site est **visible par Google automatiquement** (robots.txt et sitemap ouverts).
Les aperçus Vercel et les adresses `….vercel.app` restent cachés de Google. Pour tout cacher : `NEXT_PUBLIC_SITE_PUBLIC=false` dans Vercel, puis Redeploy.
Ensuite, déclarez le site dans [Google Search Console](https://search.google.com/search-console) et envoyez `https://walty.fr/sitemap.xml`.

## 5. Vérifications légales

- [x] Exploitant, adresse, SIREN, SIRET, téléphone, e-mail contact@walty.fr, directeur de la publication
- [x] Hébergeurs et prestataires : Vercel, Supabase (données en Irlande), Resend (envois depuis l'Irlande), OVH
- [x] Page `/porteurs` : informations des clients des commerces, accord pour les offres, comment arrêter
- [ ] Vérifier que l'activité « services numériques » est bien déclarée sur votre entreprise individuelle (guichet unique INPI)
- [ ] Vérifier le nom « Walty » sur [data.inpi.fr](https://data.inpi.fr) avant de déposer la marque
- [ ] Nom de domaine `walty.fr` (OVHcloud, au nom d'Alexandre MARTIAS) : valider la demande « titulaire » d'OVH avant le 16 novembre 2026
- [ ] Rendez-vous chez un commerçant de 5 salariés au plus : remettre le formulaire de rétractation (annexe des CGV)
- [ ] Faire relire les CGV par un professionnel du droit avant d'ajouter le paiement en ligne
- Aucun cookie de suivi : pas de bandeau nécessaire. Si un jour vous ajoutez Google Analytics, un pixel Meta ou TikTok, il faudra un bandeau de consentement.

## Après la mise en ligne de la v10 sur GitHub

Supprimez l'ancien fichier `app/(site)/tarifs/Plans.jsx` resté dans le dépôt (il n'est plus utilisé) : ouvrez-le sur GitHub → « … » → **Delete file** → **Commit changes**.

## 6. Modifier le contenu

- Formules, prix, comparatif, durée d'essai : `lib/offer.js` (se répercute sur l'accueil, les tarifs, Créer ma carte, l'espace commerçant, les CGV et l'admin). `trialDays = 0` retire l'essai gratuit partout.
- Les chiffres d'exemple de l'aperçu (page d'accueil) : `lib/kpis.js`.
- Les prestataires, l'e-mail, le téléphone : `lib/site.config.js`.
- Les couleurs : en haut de `app/globals.css` (thème sombre ; la classe `.dark` donne un bloc teinté crépuscule).
- Les types de carte, les secteurs et les validations (e-mail, téléphone, SIRET) : `lib/programs.js`.
- La mascotte : `components/Mascot.jsx` (dessin) et `app/mascot.css` (animations).

## Pour les développeurs

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

Next.js 16 (App Router), React 19, CSS pur, polices auto-hébergées (@fontsource), Resend (via son API, sans dépendance), Supabase optionnel.

## Badges Apple Wallet et Google Wallet

Les badges sous la carte de l'accueil sont les fichiers officiels, non modifiés, dans `public/badges/` :
- `google-wallet.svg` : badge français fourni par Google (developers.google.com/wallet, « Brand guidelines »).
- `apple-wallet.svg` : badge fourni par Apple (developer.apple.com/wallet). La version française est dans le pack
  « Download badge files » de la page « Add to Apple Wallet badge guidelines » (il faut accepter les conditions d'Apple) :
  remplacez simplement le fichier en gardant le même nom.

Règles : ne pas recolorer, déformer, animer ni redessiner ces badges, et garder de l'espace autour.

## Écran de chargement

`components/IntroLoader.jsx` : 1,6 s, une seule fois par visite (onglet), désactivé si l'appareil demande moins d'animations.
Pour le retirer, supprimez la ligne `<IntroLoader />` dans `app/(site)/layout.jsx`.

## Espace commerçant (comment ça marche)

- Le commerçant ouvre son lien d'accès (`walty.fr/espace?acces=…`), tape son code PIN : son téléphone retient le lien (jamais le PIN). Session : 12 heures.
- Tout passe par `app/api/espace/[...chemin]/route.js`, qui relaie vers le logiciel de cartes (`CARTEDEFID_URL`, par défaut `https://cartedefid.vercel.app`). Aucun secret côté walty.fr.
- Scanner (tampons, achats, cadeaux, offres, annulation), Clients, Chiffres, Offres, Messages : les règles (limites par jour, nombre de messages par semaine…) sont appliquées par le logiciel de cartes.
- Si le logiciel de cartes n'a pas encore les adresses `me`, `stats`, `offers`, l'espace marche quand même (écran du PIN sans le nom du commerce, chiffres simples, pas d'onglet Offres).
