// Widget d'avis Google (Elfsight). Le script platform.js est chargé dans
// index.html ; il détecte ce conteneur et monte le widget automatiquement.
// data-elfsight-app-lazy => chargement différé quand le bloc devient visible.
export default function GoogleReviews() {
  return (
    <section className="container-page py-14">
      <div className="mb-8 text-center">
        <p className="eyebrow mb-2">Ils nous font confiance</p>
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Les avis de nos clients
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Note moyenne 4,7★ sur Google — merci à nos vapoteurs pour leur confiance.
        </p>
      </div>
      <div
        className="elfsight-app-d3ee988e-faab-4c3f-81d5-fc3ff7d42140"
        data-elfsight-app-lazy
      />
    </section>
  )
}
