# THEKLOPE — Boutique e-commerce premium

Site e-commerce moderne et premium pour **THEKLOPE**, spécialisé dans la vente de cigarettes
électroniques, pods, e-liquides et accessoires de vape.

Univers visuel sombre et haut de gamme (inspiration Apple / Nothing / Tesla), responsive
mobile / tablette / desktop, branché à Supabase pour le catalogue/les commandes et à Mollie
pour le paiement sécurisé.

## Stack technique

- **React 18** + **Vite** (build rapide)
- **React Router 6** (navigation multi-pages)
- **Tailwind CSS 3** (design system, palette de marque)
- **Supabase** optionnel pour le catalogue, les commandes, les stocks et l'auth admin
- **Mollie** pour le checkout hébergé et la confirmation serveur par webhook
- State global via **Context API** (panier, favoris, vérification d'âge, code promo) avec
  persistance `localStorage`
- Visuels produits locaux, avec fallback placeholder si une image manque

## Démarrer en local

```bash
npm install      # installe les dépendances
npm run dev      # lance le serveur de développement (http://localhost:5173)
npm run build    # build de production dans /dist
npm run preview  # prévisualise le build de production
```

> Node 20.19+ recommandé (ou Node 22.12+), requis par Vite 8.

## Configuration Supabase

Le site fonctionne en local sans Supabase. Dès que les variables ci-dessous sont présentes,
le catalogue, les commandes, le stock et la connexion admin passent par Supabase.

1. Créez `.env.local` à partir de `.env.example` :

```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_publishable_key
```

2. Dans Supabase, ouvrez **SQL Editor** et exécutez `supabase/schema.sql`.

Ce fichier crée les tables `products`, `orders`, `order_items`, les règles RLS et la fonction
`finalize_paid_order` qui finalise une commande payée et décrémente le stock de façon atomique.

3. Dans Supabase, créez un utilisateur admin :

```text
Authentication > Users > Add user
```

4. Lancez le site, ouvrez `/admin`, connectez-vous avec cet utilisateur, puis allez dans
`Pilotage` et cliquez sur `Réinitialiser le catalogue` pour publier les produits initiaux
dans Supabase.

5. Sur Vercel, ajoutez les mêmes variables d'environnement :

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Ne mettez jamais de `service_role_key` dans Vite ou dans le navigateur.

## Paiement — Mollie

Le paiement utilise **Mollie** (checkout hébergé, par redirection). Le montant
est **toujours recalculé côté serveur** à partir des identifiants produits : le
navigateur n'envoie jamais de prix. Le statut « payé » est confirmé uniquement
par le **webhook Mollie** (source de vérité), impossible à falsifier côté client.

### Variables d'environnement (Vercel → Settings → Environment Variables)

| Variable | Portée | Rôle |
|---|---|---|
| `MOLLIE_API_KEY` | serveur | Clé API Mollie (`test_…` puis `live_…`) |
| `SUPABASE_SERVICE_ROLE_KEY` | serveur | Le serveur crée/finalise les commandes (contourne la RLS) |
| `SUPABASE_URL` | serveur | (optionnel) si l'URL n'est pas déjà fournie |
| `PUBLIC_BASE_URL` | serveur | URL publique du site (redirect + webhook Mollie) |
| `RESEND_API_KEY` | serveur | (optionnel) e-mails transactionnels via Resend |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | client | Catalogue + auth admin |

> Aucune clé Mollie ni service_role ne doit être exposée au navigateur.

### Flux

1. `POST /api/create-payment` : relit les prix, recalcule le total, crée le
   paiement Mollie **et** une commande « en attente » dans Supabase, renvoie
   l'URL de checkout.
2. Le client est redirigé vers Mollie pour payer.
3. Retour sur `/checkout/retour?order=…` : la page interroge
   `GET /api/payment-status` qui relit le vrai statut auprès de Mollie.
4. `POST /api/mollie-webhook` : confirme le paiement, passe la commande à
   « payée », décrémente le stock de façon atomique ou marque un incident stock
   à traiter manuellement si le stock a bougé entre le panier et le paiement.

### Tester en local

Le webhook Mollie ne peut pas joindre `localhost` : utilisez un tunnel (ngrok)
et mettez son URL dans `PUBLIC_BASE_URL`. Lancez les fonctions `api/` avec
`vercel dev` (le simple `vite` ne sert pas les routes `/api`).

## Structure du projet

```
src/
├── main.jsx                 # point d'entrée, providers (Router + Store)
├── App.jsx                  # routes + layout global
├── index.css                # styles de base + classes utilitaires (boutons, cartes…)
├── context/
│   └── StoreContext.jsx     # panier, favoris, commandes, Supabase, âge, cookies, codes promo
├── data/
│   ├── products.js          # catalogue produits de référence
│   ├── productCopy.js       # enrichissement des descriptions produit
│   └── reviews.js           # note Google et extraits d'avis boutique
├── components/
│   ├── Header.jsx           # menu sticky, recherche, panier, favoris, menu mobile
│   ├── Footer.jsx           # liens utiles + avertissement légal
│   ├── AgeGate.jsx          # pop-up vérification d'âge (+18) à l'arrivée
│   ├── CookieBanner.jsx     # bandeau cookies
│   ├── CartDrawer.jsx       # panier latéral
│   ├── SearchOverlay.jsx    # recherche produit
│   ├── Newsletter.jsx       # inscription newsletter
│   ├── ProductCard.jsx      # carte produit (badge, note, favori, ajout panier)
│   ├── Badge / Stars / Logo / Seo / Breadcrumbs …
└── pages/
    ├── Home.jsx             # accueil (hero, catégories, best-sellers, packs, nouveautés)
    ├── Shop.jsx             # boutique + filtres (catégorie, prix, marque, type, nicotine, saveur) + tri
    ├── Product.jsx          # fiche produit (galerie, variantes, avis, similaires)
    ├── Cart.jsx             # panier + code promo
    ├── Checkout.jsx         # tunnel d'achat en 3 étapes vers Mollie
    ├── Admin.jsx            # dashboard admin catalogue, ventes, commandes, stock
    ├── Categories.jsx       # grille des catégories
    ├── CategoryPage.jsx     # page d'une catégorie
    ├── Favorites.jsx        # favoris
    ├── About.jsx / Contact.jsx / FAQ.jsx
    ├── Legal.jsx            # mentions légales, CGV, confidentialité, retour
    └── NotFound.jsx
```

## Fonctionnalités incluses

- Pop-up de **vérification d'âge** (+18) au premier accès
- Menu **sticky**, **barre de recherche**, **panier** et **favoris** dans le header
- **Filtres** boutique (catégorie, prix, marque, type, taux de nicotine, saveur) et **tri**
- **Badges** produits : Nouveau, Best-seller, Promo, Stock limité
- **Panier** complet : quantités, code promo, livraison offerte dès 49€, totaux
- **Checkout** en 3 étapes (coordonnées → livraison → paiement Mollie)
- **Dashboard admin** `/admin` : création produit, édition catalogue, suivi des ventes,
  commandes, statuts, stock faible, export JSON
- Connexion **Supabase Auth** pour protéger l'admin quand Supabase est configuré
- **Newsletter**, **bandeau cookies**, **footer** complet, pages **légales**
- **SEO** : titres et meta description par page, balises Open Graph, langue `fr`
- Design **mobile-first** et responsive

### Codes promo disponibles

| Code         | Effet                       |
|--------------|-----------------------------|
| `THEKLOPE10` | −10%                        |
| `BIENVENUE`  | −15% (première commande)    |
| `LIVRAISON`  | Livraison offerte           |

## Palette de marque

| Rôle          | Couleur     |
|---------------|-------------|
| Noir          | `#050505`   |
| Anthracite    | `#121212`   |
| Gris clair    | `#E5E5E5`   |
| Blanc         | `#FFFFFF`   |
| Vert néon     | `#35FF8A`   |
| Bleu électrique | `#3B82F6` |

## Personnaliser

- **Produits / prix / textes** : `src/data/products.js`
- **Vraies photos** : renseignez le champ `images` de chaque produit (URL ou import)
- **Couleurs / typographie** : `tailwind.config.js`
- **Mentions légales / CGV** : `src/pages/Legal.jsx` (champs entre crochets à compléter)
- **Paiement** : Mollie (voir section « Paiement — Mollie ») — `api/create-payment.js`, `api/mollie-webhook.js`, `src/pages/Checkout.jsx`

## Déploiement

Le projet est prêt pour **Vercel** ou **Netlify** (fichiers `vercel.json` et `public/_redirects`
inclus pour le routage SPA).

```bash
npm run build      # génère /dist
# puis déployer le dossier /dist (ou connecter le repo à Vercel/Netlify)
```

---

⚠️ **Avertissement légal** — La vente de produits de vapotage est interdite aux mineurs. Les
produits contenant de la nicotine créent une forte dépendance. Leur utilisation est déconseillée
aux non-fumeurs.
