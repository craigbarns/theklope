import { STORE_REVIEW_SUMMARY } from '../data/reviews.js'
import { useStore } from '../context/StoreContext.jsx'

export default function GoogleReviews() {
  const { reviewsChoice, setReviewsChoice } = useStore()

  return (
    <section id="avis-clients" className="container-page scroll-mt-24 py-14">
      <div className="mb-8 text-center">
        <p className="eyebrow mb-2">Ils nous font confiance</p>
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Les avis de nos clients
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          {STORE_REVIEW_SUMMARY.sentence}
        </p>
      </div>
      {reviewsChoice === 'accepted' ? (
        <div
          className="elfsight-app-d3ee988e-faab-4c3f-81d5-fc3ff7d42140"
          data-elfsight-app-lazy
        />
      ) : (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-6 text-center">
          <p className="text-sm text-muted">
            L'affichage du widget d'avis Google via Elfsight nécessite votre accord. Il n'active pas la mesure d'audience.
          </p>
          <button className="btn-ghost mt-4 px-5 py-2.5 text-xs" onClick={() => setReviewsChoice('accepted')}>
            Autoriser et afficher les avis
          </button>
        </div>
      )}
    </section>
  )
}
