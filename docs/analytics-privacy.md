# Confidentialité de la mesure d’audience

## Règles appliquées par le site

- Google Analytics et Vercel Analytics sont limités à `https://theklope.com` et
  `https://www.theklope.com`, après acceptation de la mesure d’audience.
- Les chemins commençant par `/admin`, sans distinction de casse, les anciennes
  URL d’administration et les routes `/api` sont exclus. Les URL encodées sont
  vérifiées également.
- Les autres domaines, les aperçus Vercel et les serveurs de développement ne
  chargent pas les outils de mesure via ces composants.
- Les événements Vercel sont filtrés au moment de leur envoi : une navigation
  vers l’administration ou un retrait du consentement les bloque même si le
  script a déjà été chargé. Les paramètres et fragments des URL sont retirés.
- Un événement Google en attente du chargement du script est abandonné si le
  consentement est retiré ou si la page a changé.
- Une URL d’administration n’est pas transmise comme référent à Google lors
  du retour vers une page publique.

Le choix de cookies reste distinct de l’éligibilité de la page. Visiter
l’administration n’efface pas un accord précédemment donné et ne transforme
pas cet accord en autorisation de mesurer l’administration.

## Vérifications à effectuer après mise en ligne

1. Sur une page publique, sans consentement puis après un refus, vérifier
   l’absence de chargement de Google Analytics et Vercel Analytics.
2. Après acceptation, vérifier une page publique puis naviguer vers `/admin` :
   les événements émis par l’application doivent être bloqués. Tester aussi
   un accès direct à `/ADMIN` et à une ancienne URL d’administration.
3. Vérifier le retrait du consentement, y compris pendant le chargement de
   Google Analytics, puis un nouveau cycle d’acceptation.
4. Vérifier qu’aucun paramètre d’URL ni fragment n’apparaît dans les URL envoyées.

## Limites et configuration externe

Cette modification ne corrige pas les données historiques et n’identifie pas
les employés lorsqu’ils consultent des pages publiques. Une propriété GA4
supplémentaire ou un ancien site ayant sa propre balise ne sont pas modifiés.

Le site envoie ses pages vues manuellement (`send_page_view: false`). Vérifier
dans le flux GA4 que les pages vues automatiques sur changement d’historique
sont désactivées : elles constituent une autre source d’événements, hors des
appels manuels protégés ici. Cette configuration distante n’est pas contrôlée
par le dépôt et n’a pas été modifiée.

Références :

- [Pages vues Google Analytics](https://developers.google.com/analytics/devguides/collection/ga4/views)
- [Mesure des applications monopages](https://developers.google.com/analytics/devguides/collection/ga4/measure-spa-gtm)
- [Filtrage avant envoi Vercel](https://vercel.com/docs/analytics/package#beforesend)

## Validation locale

```sh
node --test src/lib/analytics.test.js src/lib/analyticsPolicy.test.js src/lib/analyticsPrivacy.test.js
npm run test:render
npm run build
```

Le script exploratoire `test-search.mjs`, sans assertions et dépendant de
DuckDuckGo, est découvert par le `node --test` global de `npm test`. Il peut
échouer dans un environnement sans accès réseau. Les fichiers `*.test.js` et
`*.test.mjs` sous `src`, `api` et `scripts` peuvent être exécutés séparément.
