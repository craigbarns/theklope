# Correctifs techniques — 25 octobre 2026

Base : `craigbarns/theklope`, commit `1d047f818b665020cbb0eca3129b036587787735`.
Branche locale : `codex/theklope-technical-audit-20261025`.

Cette intervention traite le rendu des pages d'information, l'accessibilité,
la cohérence des métadonnées et les dates du sitemap. Elle ne constitue pas
une correction des quinze recommandations commerciales du rapport initial.
Aucun déploiement ni changement de données en production n'a été effectué.

## Corrections

- Les sept pages `/guides`, `/faq`, `/contact` et `/legal/*` utilisent leurs
  composants React existants pour produire le HTML initial. Les textes légaux
  et les articles existants n'ont pas été réécrits.
- L'index des guides contient les liens vers les 37 articles. La FAQ contient
  ses 24 questions et réponses dans des accordéons HTML natifs, utilisables
  au clavier et sans JavaScript.
- Les titres, descriptions et données structurées de ces pages proviennent
  des mêmes sources avant et après le chargement de React. Le schéma de
  contact ne disparaît plus après ce chargement.
- Les pages d'information disposent immédiatement d'une navigation, d'un
  repère `main`, d'un lien d'évitement et de liens vers les documents légaux.
  Leur instantané de chargement conserve les styles du composant.
- Le formulaire de contact pré-rendu reste désactivé avant l'installation
  des gestionnaires JavaScript. Sa méthode native est POST, et un contact
  par e-mail est proposé sans JavaScript. Les états d'envoi et les erreurs
  sont annoncés aux lecteurs d'écran.
- La recherche des guides possède un libellé, les filtres annoncent leur
  sélection et le nombre de résultats est annoncé. Les images disposent de
  dimensions et celles situées après les deux premières sont chargées à la
  demande.
- Les coordonnées du pied de page disposent de zones tactiles plus grandes.
- Les dates connues du sitemap sont conservées ; `lastmod` est omis lorsque
  la date réelle n'est pas connue. La date de la requête ne sert plus de
  remplacement. [Référence Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
- Les groupes nommés de `robots.txt` répètent les exclusions des espaces
  privés : ils n'héritent pas du groupe générique. Ces règles de crawl ne
  remplacent pas les contrôles d'accès. [Spécification](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec).
- Le script réseau `test-search.mjs`, qui faisait échouer la suite hors
  réseau, devient un diagnostic manuel dans `scripts/search-diagnostic.mjs`.
- Le build vérifie le contenu des fichiers HTML écrits, leurs métadonnées et
  leur JSON-LD. Une coquille vide sur ces pages fait désormais échouer le build.
- L'aperçu Vite sert les bons fichiers pré-rendus aux URL sans slash final,
  au lieu de servir l'accueil puis de laisser React remplacer la page.

## Vérifications

| Contrôle | Résultat |
| --- | --- |
| `npm test` | 345 tests réussis et 18 pages rendues sans erreur |
| `npm run build` | 427 pages générées ; contrôle des sept pages d'information réussi |
| `NODE_ENV=production npm run test:prerender` | Réussi |
| `node scripts/crawl-links.mjs` | 8 986 liens internes contrôlés, aucun lien cassé |
| `git diff --check` | Réussi |

Le build local utilise le catalogue statique de secours, soit 309 produits.
La production contrôlée en comporte 532. Aucun accès Supabase privé n'a été
utilisé pour cette intervention ; la validation locale ne constitue donc pas
une nouvelle vérification des prix et des stocks de production.

Texte extrait du HTML initial, hors scripts, styles et SVG :

| Page | Avant | Après |
| --- | ---: | ---: |
| FAQ | 31 mots | 853 mots |
| Contact | 17 mots | 199 mots |
| Guides | 28 mots, aucun lien d'article | 1 682 mots, 37 liens d'articles uniques |
| Mentions légales | 16 mots | 270 mots |
| Confidentialité | 19 mots | 223 mots |

Les réponses de FAQ restent repliables ; leur présence dans le HTML ne
signifie pas qu'elles sont toutes dépliées à l'ouverture de la page.

## Mesures et limites

La FAQ publique a été mesurée avec Lighthouse 13.5.0, profil mobile :
performance 83/100, accessibilité automatisée 96/100, LCP 4,03 s, TBT 44 ms,
CLS 0. Le rapport brut et la dernière mesure locale sont référencés dans
`logs/mission-theklope-technical-20261025.json`.

Sur le dernier build local, après vérification HTTP du fichier servi à
`/faq` : performance 95/100, accessibilité automatisée 100/100, LCP 2,565 s,
TBT 16 ms et CLS 0. Les mesures antérieures réalisées sur le fallback de
l'accueil dans Vite preview ont été invalidées et ne sont pas utilisées.

Les mesures locales et celles de production utilisent des infrastructures et
des catalogues différents. Elles ne prouvent pas une amélioration chiffrée
en production. L'objectif LCP de 2,5 s et les Core Web Vitals terrain restent
à vérifier après une éventuelle publication, via des mesures comparables et
Search Console. Un score automatisé d'accessibilité ne remplace pas une
vérification manuelle complète.

Le code documente déjà une confirmation des coordonnées et horaires par
l'exploitant. Ces informations ont été reprises telles qu'elles existent,
sans nouvelle vérification humaine de ma part.

Les recommandations portant sur les promotions, avis destinés à la
conversion, CTA d'achat, prix et badges du catalogue, variantes, panier et
checkout n'ont pas été mises en œuvre. Les articles existants étaient déjà
prérendus ; l'absence générale de JSON-LD et de prix annoncée par l'audit
initial n'était pas reproductible sur l'échantillon contrôlé.

Le balisage sémantique n'est pas une promesse de résultats enrichis. Les
règles de Google excluent notamment les contenus promouvant les produits de
vapotage des résultats enrichis produit. [Règles Google](https://developers.google.com/search/docs/appearance/structured-data/product-snippet#content-guidelines).
