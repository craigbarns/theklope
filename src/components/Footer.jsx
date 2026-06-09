import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

const COLUMNS = [
  {
    title: 'Boutique',
    links: [
      { to: '/boutique', label: 'Tous les produits' },
      { to: '/categorie/cigarettes-electroniques', label: 'Cigarettes électroniques' },
      { to: '/categorie/pods', label: 'Pods' },
      { to: '/categorie/e-liquides', label: 'E-liquides' },
      { to: '/categorie/accessoires', label: 'Accessoires' },
      { to: '/categorie/packs-debutants', label: 'Packs débutants' },
    ],
  },
  {
    title: 'Aide',
    links: [
      { to: '/faq', label: 'FAQ' },
      { to: '/contact', label: 'Contact' },
      { to: '/legal/retour', label: 'Livraison & retours' },
      { to: '/faq', label: 'Choisir son matériel' },
    ],
  },
  {
    title: 'Marque',
    links: [
      { to: '/a-propos', label: 'À propos' },
      { to: '/categorie/nouveautes', label: 'Nouveautés' },
      { to: '/categorie/meilleures-ventes', label: 'Meilleures ventes' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { to: '/legal/mentions-legales', label: 'Mentions légales' },
      { to: '/legal/cgv', label: 'CGV' },
      { to: '/legal/confidentialite', label: 'Confidentialité' },
      { to: '/legal/retour', label: 'Politique de retour' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-anthracite/60">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              La vape nouvelle génération. Cigarettes électroniques, e-liquides et accessoires sélectionnés
              pour une expérience simple, élégante et performante.
            </p>
            <address className="mt-4 not-italic text-sm leading-relaxed text-muted">
              188 Rue de Rome, 13006 Marseille<br />
              <a href="tel:+33491555555" className="hover:text-neon">04 91 55 55 55</a> ·{' '}
              <a href="mailto:contact@theklope.com" className="hover:text-neon">contact@theklope.com</a>
            </address>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip">Boutique à Marseille</span>
              <span className="chip">4,7★ · 409 avis</span>
              <span className="chip">Paiement sécurisé</span>
              <span className="chip">+18 uniquement</span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold text-white">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link to={l.to} className="text-sm text-muted transition hover:text-neon">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-noir/50 p-5 text-center">
          <p className="text-xs leading-relaxed text-muted">
            <strong className="text-ash/80">Avertissement légal —</strong> La vente de produits de vapotage
            est interdite aux mineurs. Les produits contenant de la nicotine créent une forte dépendance. Leur
            utilisation est déconseillée aux non-fumeurs.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-faint">© {new Date().getFullYear()} THEKLOPE. Tous droits réservés.</p>
          <p className="text-xs text-faint">Site de démonstration — produits et prix fictifs.</p>
        </div>
      </div>
    </footer>
  )
}
