# Walti — site, création de carte en ligne, espace commerçant, espace admin

Carte de fidélité digitale (Apple Wallet & Google Wallet) pour les commerces de Guadeloupe.
Site Next.js prêt pour GitHub → Vercel. Version 8 (espace commerçant à onglets avec envoi de notifications, file « Notifications » dans l'admin).

## Ce qu'il y a dedans

| Page | Adresse |
| --- | --- |
| Accueil | `/` |
| Le produit | `/produit` |
| Tarifs (Essentiel 29 € · Premium 49 € · Pro 79 €) | `/tarifs` |
| **Créer ma carte** : écran « Bientôt disponible » animé (agent IA à venir) avec « Réserver une démo » et une liste d'attente « Me prévenir ». L'ancien assistant en 9 étapes est gardé dans `app/(site)/creer/CreerWizard.jsx` | `/creer` |
| **Espace commerçant** (sa carte, ses chiffres, l'envoi de messages, les automatismes) | `/espace` |
| Contact (réserver une démo) | `/contact` |
| À propos | `/a-propos` |
| Identité de marque + planche mascotte (page interne : pas de lien sur le site, pas sur Google) | `/marque` |
| Mentions légales, Confidentialité, CGV, CGU, Cookies | `/mentions-legales`, `/confidentialite`, `/cgv`, `/cgu`, `/cookies` |
| **Espace admin** (prospects, pipeline, clients, relances, cartes créées en ligne, export CSV) | `/admin` |

Partout, deux portes d'entrée : **Créer ma carte** (le commerçant fait seul, essai 14 jours) et **Réserver une démo** (vous venez chez lui).

## 1. Mettre en ligne (sans rien installer)

1. Dézippez le fichier `walti-site-v8.zip`.
2. Sur GitHub, ouvrez votre dépôt existant (ex. `walty`) → **Add file → Upload files**, glissez **tout le contenu** du dossier (pas le dossier lui-même), puis **Commit changes**. Les fichiers existants sont remplacés.
3. Vercel redéploie tout seul si le dépôt est relié au projet. Sinon : **Add New → Project** → importez le dépôt → **Deploy**.

Le site marche tout de suite en **mode démo** :
- `/creer` : la carte créée apparaît dans l'admin et dans l'espace commerçant **du même navigateur** ;
- `/espace` : n'importe quel e-mail fonctionne, ou « Voir un exemple » ; un sélecteur permet de comparer Essentiel / Premium / Pro (pratique en rendez-vous) ;
- `/admin` → « Entrer dans la démo » : données fictives.

## 2. Brancher la vraie base de données (Supabase)

1. Dans Supabase, créez un projet (région **Frankfurt / eu-central-1**, pour rester en Europe).
2. **SQL Editor → New query** : collez `supabase/schema.sql` → **Run**. (Si vous l'aviez déjà exécuté avant, relancez-le : il ajoute les nouvelles colonnes, dont la facturation, sans rien effacer.)
3. **Authentication → Users → Add user** : votre e-mail + un mot de passe.
4. Dans le SQL Editor, exécutez (avec votre e-mail) :
   `insert into public.admins (email) values ('votre-email@exemple.fr');`
5. **Project Settings → API** : copiez l'URL et la clé `anon public`.
6. Dans Vercel : **Settings → Environment Variables**, ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (ex. `https://heywalti.fr`)
7. **Deployments → Redeploy**.

**Donner son accès à un commerçant** : dans l'admin, passez sa fiche à l'étape « Client » avec son e-mail. Puis dans Supabase, **Authentication → Users → Add user** avec ce même e-mail et un mot de passe que vous lui envoyez. Il se connecte sur `/espace` et ne voit que sa carte.

Sécurité : les visiteurs peuvent seulement *déposer* une demande, jamais lire la base. Les commerçants ne voient que leur carte (jamais vos notes ni les autres clients). Seuls les e-mails de la table `admins` voient tout.

> Les chiffres de l'espace commerçant sont pour l'instant des **données d'exemple**. Ils deviendront réels quand votre application de cartes (tampons, Wallet) sera branchée : le fichier `lib/kpis.js` liste les 8 chiffres attendus.

## 3. Avant d'ouvrir le site au public (obligatoire)

Ouvrez `lib/site.config.js` et remplacez chaque `[À COMPLÉTER]` :

- [ ] Nom et prénom de l'exploitant, adresse, SIREN, SIRET (si Walti passe par une micro-entreprise existante, mettez la sienne)
- [ ] E-mail et téléphone de contact (+ numéro WhatsApp si vous voulez le bouton)
- [ ] Directeur de la publication

Puis, dans Vercel, ajoutez `NEXT_PUBLIC_SITE_PUBLIC=true` et redéployez.
Tant que cette variable n'est pas à `true`, le site n'est **pas indexé par Google** (aperçu privé).

Autres vérifications :
- [ ] Vérifier le nom « Walti » sur [data.inpi.fr](https://data.inpi.fr) avant de déposer la marque.
- [ ] Les domaines `walti.fr`, `.com`, `.app`, `.co`, `.io` sont déjà pris. Libres au 30/09/2026 : `heywalti.fr`, `heywalti.com`, `monwalti.fr`, `walti.cards`.
- [ ] Les CGV prévoient le droit de rétractation de 14 jours des petites entreprises (5 salariés au plus) signées chez elles : remettez le formulaire en annexe lors des rendez-vous.
- [ ] Faire relire les CGV par un professionnel du droit avant d'ajouter le paiement en ligne.
- [ ] Si vous ajoutez un jour Google Analytics, un pixel Meta ou TikTok : il faudra un bandeau de consentement cookies.

## 4. Modifier le contenu

- Formules, prix, limites de clients, options, durée d'essai : `lib/offer.js` (se répercute sur l'accueil, les tarifs, Créer ma carte, l'espace commerçant, les CGV et l'admin). `trialDays = 0` retire l'essai gratuit partout.
- Les chiffres de l'espace commerçant : `lib/kpis.js`.
- Les couleurs : en haut de `app/globals.css` (thème sombre ; la classe `.dark` donne un bloc teinté crépuscule).
- Les types de carte, les secteurs et les validations (e-mail, téléphone, SIRET) : `lib/programs.js`.
- La mascotte : `components/Mascot.jsx` (dessin) et `app/mascot.css` (animations).

## Pour les développeurs

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

Next.js 16 (App Router), React 19, CSS pur, polices auto-hébergées (@fontsource), Supabase optionnel.

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

## Notifications des commerçants (comment ça marche)

1. Le commerçant ouvre son espace (`/espace`), onglet **Notifications**, écrit son message (ou choisit une idée toute prête), choisit « Maintenant » ou « Programmer » (Pro), puis confirme.
2. La notification arrive dans votre admin, onglet **Notifications** (le nombre en orange = à envoyer).
3. Vous l'envoyez depuis votre application de cartes (bouton « Copier le texte »), puis vous cliquez **« Marquer comme envoyée »**. Le commerçant voit « Envoyée » dans son espace.

Limites appliquées par la base de données : Essentiel = pas de notification, Premium = 2 par semaine (lundi → dimanche) sans programmation, Pro = illimité et programmable.
Le texte « envoyée le jour même, entre 8 h et 18 h » se change dans `lib/offer.js` (`pushRules.delay`).
