# Walti — site vitrine + espace admin

Carte de fidélité digitale (Apple Wallet & Google Wallet) pour les commerces de Guadeloupe.
Site Next.js prêt pour GitHub → Vercel.

## Ce qu'il y a dedans

| Page | Adresse |
| --- | --- |
| Accueil | `/` |
| Le produit | `/produit` |
| Tarifs (29 / 49 / 79 €) | `/tarifs` |
| À propos | `/a-propos` |
| Contact (formulaire de démo) | `/contact` |
| Identité de marque + planche mascotte | `/marque` |
| Mentions légales, Confidentialité, CGV, CGU, Cookies | `/mentions-legales`, `/confidentialite`, `/cgv`, `/cgu`, `/cookies` |
| **Espace admin** (prospects, pipeline, clients, relances, export CSV) | `/admin` |

## 1. Mettre en ligne (sans rien installer)

1. Dézippez le fichier `walti-site.zip`.
2. Sur GitHub : **New repository** → nom `walti-site` → **Create**.
3. Cliquez sur **uploading an existing file**, glissez **tout le contenu** du dossier (pas le dossier lui-même), puis **Commit changes**.
4. Sur Vercel : **Add New → Project** → importez `walti-site` → **Deploy**. Rien à régler, Vercel détecte Next.js.

Le site marche tout de suite en **mode démo** : l'admin (`/admin` → « Entrer dans la démo ») affiche des données fictives
qui restent dans votre navigateur. Une demande envoyée depuis `/contact` apparaît dans l'admin du même navigateur.

## 2. Brancher la vraie base de données (Supabase)

1. Dans Supabase, créez un projet (région **Frankfurt / eu-central-1**, pour rester en Europe).
2. **SQL Editor → New query** : collez `supabase/schema.sql` → **Run**.
3. **Authentication → Users → Add user** : votre e-mail + un mot de passe.
4. Dans le SQL Editor, exécutez (avec votre e-mail) :
   `insert into public.admins (email) values ('votre-email@exemple.fr');`
5. **Project Settings → API** : copiez l'URL et la clé `anon public`.
6. Dans Vercel : **Settings → Environment Variables**, ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (ex. `https://heywalti.fr`)
7. **Deployments → Redeploy**. L'admin demande alors votre e-mail et mot de passe, et les demandes du site arrivent dans votre pipeline.

Sécurité : les visiteurs peuvent seulement *déposer* une demande, jamais lire la base. Seuls les e-mails de la table `admins` voient les données.

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
- [ ] Faire relire les CGV par un professionnel du droit si vous ajoutez des services (paiement en ligne, etc.).
- [ ] Si vous ajoutez un jour Google Analytics, un pixel Meta ou TikTok : il faudra un bandeau de consentement cookies.

## 4. Modifier le contenu

- Les formules et prix : `lib/offer.js` (se répercute sur l'accueil, les tarifs et l'admin).
- Les couleurs : en haut de `app/globals.css`.
- La mascotte : `components/Mascot.jsx` (dessin) et `app/mascot.css` (animations).

## Pour les développeurs

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

Next.js 16 (App Router), React 19, CSS pur, polices auto-hébergées (@fontsource), Supabase optionnel.
