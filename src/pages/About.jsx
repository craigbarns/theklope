import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import Newsletter from '../components/Newsletter.jsx'
import { IconCheck, IconLeaf, IconShield, IconArrowRight } from '../components/icons.jsx'
import { STORE_REVIEW_SUMMARY } from '../data/reviews.js'

const VALUES = [
  { icon: IconCheck, title: 'Sélection exigeante', text: 'Nous ne référençons que des produits fiables, testés et reconnus pour leur qualité.' },
  { icon: IconLeaf, title: 'Design avant tout', text: 'Des objets pensés pour être beaux, simples et agréables à utiliser au quotidien.' },
  { icon: IconShield, title: 'Vape responsable', text: 'Une boutique réservée aux majeurs, transparente et engagée pour un usage maîtrisé.' },
]

export default function About() {
  return (
    <>
      <Seo title="À propos" description="THEKLOPE, une boutique moderne qui sélectionne des produits de vape fiables, design et accessibles." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'À propos' }]} />

        <div className="mt-6 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">Notre histoire</p>
            <h1 className="font-display text-4xl font-bold leading-tight text-white">
              Une nouvelle façon de vivre la vape
            </h1>
            <p className="mt-5 leading-relaxed text-ash/70">
              Découvrez une sélection de cigarettes électroniques, e-liquides et accessoires pensés pour offrir
              une expérience simple, élégante et performante. Chez THEKLOPE, chaque produit est choisi pour sa
              fiabilité, son design et son rapport qualité-prix.
            </p>
            <p className="mt-4 leading-relaxed text-ash/70">
              Née à Marseille, notre boutique réunit l'accueil et le conseil d'un point de vente physique —
              188 Rue de Rome, dans le 6ᵉ — et la simplicité d'une boutique en ligne. Nous mettons l'accent sur
              la qualité, la transparence et un service client à l'écoute, dans un univers sobre et premium,
              loin des codes trop agressifs du secteur.
            </p>
            <Link to="/boutique" className="btn-primary mt-7">
              Découvrir la boutique <IconArrowRight width={18} height={18} />
            </Link>
          </div>
          <div className="card overflow-hidden rounded-3xl p-2">
            <img
              src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='640' viewBox='0 0 800 640'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='30%25' r='80%25'%3E%3Cstop offset='0%25' stop-color='%2310241a'/%3E%3Cstop offset='100%25' stop-color='%23070707'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='800' height='640' fill='url(%23g)'/%3E%3Ccircle cx='400' cy='240' r='200' fill='%2335FF8A' opacity='0.12'/%3E%3Ctext x='400' y='350' text-anchor='middle' font-family='sans-serif' font-size='64' font-weight='700' fill='%23ffffff'%3ETHE%3Ctspan fill='%2335FF8A'%3EKLOPE%3C/tspan%3E%3C/text%3E%3Ctext x='400' y='400' text-anchor='middle' font-family='sans-serif' font-size='22' fill='%23E5E5E5' opacity='0.7'%3ELa vape nouvelle g%C3%A9n%C3%A9ration%3C/text%3E%3C/svg%3E"
              alt="THEKLOPE"
              className="w-full rounded-2xl"
            />
          </div>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="card p-6">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-neon/30 bg-neon/10 text-neon">
                <v.icon />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">{v.title}</h3>
              <p className="mt-2 text-sm text-muted">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 rounded-3xl border border-white/10 bg-anthracite/60 p-8 text-center sm:grid-cols-3">
          <Stat value="300+" label="Produits sélectionnés" />
          <Stat value="24/48h" label="Livraison en France" />
          <Stat value={STORE_REVIEW_SUMMARY.ratingLabel} label={STORE_REVIEW_SUMMARY.countLabel} />
        </div>
      </div>
      <Newsletter />
    </>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="font-display text-3xl font-bold text-neon">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  )
}
