# Sélecteur de valeur Ohm sur les résistances — Design

**Date :** 2026-07-09
**Branche :** `feat/ohm-selector`
**Périmètre :** ajouter le choix de la valeur Ohm (Ω) sur les fiches résistances. Les remises marque/volume et la livraison sont **déjà en place** dans `src/lib/pricing.js` (hors périmètre — seront simplement vérifiées).

## Contexte

- Les résistances sont un sous-ensemble de la catégorie `accessoire`, détectées par `isResistanceProduct()` (`src/data/catalog.js`).
- `product.ohm` (scalaire, string) est déjà normalisé (`StoreContext.jsx`), propagé vers Supabase (`ohm` / `productToRow`) et affiché en lecture seule sur la fiche (`Product.jsx` ~l.435). **Aucun produit ne le renseigne** et il n'existe **aucun sélecteur**.
- Les lignes du panier sont dédupliquées par `JSON.stringify(variant)` (`StoreContext.jsx` ~l.362) : ajouter `variant.ohm` crée automatiquement des lignes distinctes par valeur.
- Le sélecteur de nicotine (`VariantPicker`) est le patron à répliquer.

## Décisions validées

- **Ohm = choix parmi plusieurs valeurs** (comme le taux de nicotine).
- **Valeurs saisies dans les données** par nous, validées par l'utilisateur.
- **Le prix ne dépend pas de la valeur ohm choisie.**

## Conception

### 1. Données — `src/data/products.js`
Nouveau champ `ohmOptions` (tableau de strings) sur les résistances. Le scalaire `ohm` existant reste inchangé.

Valeurs déductibles des noms (à valider) :

| Produit | id | `ohmOptions` proposé |
|---|---|---|
| Pnp X … Voopoo | `pnp-x-015020304506ohm-voopoo-pack-de-5-302` | `["0.15","0.2","0.3","0.45","0.6"]` |
| Gti Mesh … Vaporesso | `gti-mesh-015020405-vaporesso-pack-de-5-300` | `["0.15","0.2","0.4","0.5"]` |
| Ito V2 … Voopoo | `ito-v2-0-7-1-2-voopoo-pack-de-5-301` | `["0.7","1.2"]` *(à confirmer : 0.7/1.0/1.2 ?)* |

Sans ohm dans le nom → **valeurs à fournir par l'utilisateur** (sinon pas de `ohmOptions`, comportement inchangé) :
`bvc-ce5-27` (BVC CE5), `bvc-nautilus-28` (BVC NAUTILUS), `gt-core-69` (GT CORE), `voopoo-tpp-187` (VOOPOO TPP).

### 2. Normalisation — `src/context/StoreContext.jsx`
- `normalizeProduct` : ajouter `ohmOptions: normalizeArray(product.ohmOptions)` (même traitement que `flavors`/`colors`).
- `productToRow` / `productFromRow` : propager `ohm_options` (miroir de `flavors`/`colors`). Le catalogue statique fonctionne même si la colonne Supabase est absente ; ajouter la colonne à `supabase/schema.sql` si présent.

### 3. UI fiche produit — `src/pages/Product.jsx`
- État : `const [ohm, setOhm] = useState(product?.ohmOptions?.[0] ?? null)`, réinitialisé dans l'effet de changement de produit (~l.117-119).
- Nouveau `VariantPicker` rendu si `product.ohmOptions?.length > 0` :
  ```jsx
  <VariantPicker label="Résistance (Ω)" options={product.ohmOptions}
                 value={ohm} onChange={setOhm} render={(v) => `${v} Ω`} />
  ```
- `handleAdd` : `if (ohm != null) variant.ohm = ohm`.
- `handleAddBundle` : `if (item.ohmOptions?.length) variant.ohm = item.ohmOptions[0]`.
- Affichage lecture seule de `product.ohm` (specs) : masqué quand `ohmOptions` prend le relais, conservé sinon.

### 4. Panier / commande / email
La valeur ohm choisie est portée par `variant.ohm` : afficher sur la ligne panier (miroir de la nicotine) dans `Cart.jsx` et partout où les variantes s'affichent (récap commande, email). Vérifier le composant de rendu des variantes.

## Data flow
choix ohm (fiche) → `variant.ohm` → ligne panier (clé = `JSON.stringify(variant)`) → commande → Supabase / email Resend. Prix inchangé par l'ohm.

## Tests / vérification
1. Une résistance avec `ohmOptions` affiche le sélecteur « Résistance (Ω) » ; sans, aucun sélecteur.
2. Ajouter la même résistance en 0.15 Ω puis 0.2 Ω → **2 lignes distinctes** au panier.
3. La valeur ohm s'affiche sur la ligne panier et dans le récap de commande.
4. Régression : `computeTotals` inchangé — remises marque/volume (59€ / 88,50€ / -25% 50ml) et livraison (offerte ≥49€, sinon 7,50€, 3 modes) toujours correctes.

## Hors périmètre
Remises et livraison (déjà livrées). Toute variation de prix selon l'ohm.
