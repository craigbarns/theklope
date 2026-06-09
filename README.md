# THEKLOPE — Boutique e-commerce premium

Site e-commerce moderne et premium pour **THEKLOPE**, spécialisé dans la vente de cigarettes
électroniques, pods, e-liquides et accessoires de vape.

Univers visuel sombre et haut de gamme (inspiration Apple / Nothing / Tesla), responsive
mobile / tablette / desktop, prêt à être connecté à une vraie solution e-commerce (Stripe,
Shopify, WooCommerce, Supabase…).

## Stack technique

- **React 18** + **Vite** (build rapide)
- **React Router 6** (navigation multi-pages)
- **Tailwind CSS 3** (design system, palette de marque)
- State global via **Context API** (panier, favoris, vérification d'âge, code promo) avec
  persistance `localStorage`
- Aucune dépendance d'images externes : visuels produits générés en SVG (placeholders premium)

## Démarrer en local

```bash
npm install      # installe les dépendances
npm run dev      # lance le serveur de développement (http://localhost:5173)
npm run build    # build de production dans /dist
npm run preview  # prévisualise le build de production
```

> Node 18+ recommandé.

## Structure du projet

```
src/
├── main.jsx                 # point d'entrée, providers (Router + Store)
├── App.jsx                  # routes + layout global
├── index.css                # styles de base + classes utilitaires (boutons, cartes…)
├── context/
│   └── StoreContext.jsx     # panier, favoris, âge, cookies, codes promo, totaux
├── data/
│   ├── products.js          # 12 produits de démonstration + catégories + helpers
│   └── productImage.js      # générateur d'images placeholder SVG
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
    ├── Checkout.jsx         # tunnel d'achat en 3 étapes (simulé)
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
- **Checkout** en 3 étapes (coordonnées → livraison → paiement) avec confirmation
- **Newsletter**, **bandeau cookies**, **footer** complet, pages **légales**
- **SEO** : titres et meta description par page, balises Open Graph, langue `fr`
- Design **mobile-first** et responsive

### Codes promo de démonstration

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
- **Paiement réel** : brancher Stripe / un prestataire dans `src/pages/Checkout.jsx`

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
aux non-fumeurs. Les produits, prix et visuels de cette version sont **fictifs** (démonstration).
