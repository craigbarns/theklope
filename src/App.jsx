import { Suspense } from 'react'
import { Link, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import AgeGate from './components/AgeGate.jsx'
import CookieBanner from './components/CookieBanner.jsx'
import SearchOverlay from './components/SearchOverlay.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import CoachVape from './components/CoachVape.jsx'
import ConsentManager from './components/ConsentManager.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Logo from './components/Logo.jsx'
import { IconLock } from './components/icons.jsx'
import { getPrerenderSnapshot } from './lib/prerenderSnapshot.js'
import { lazyWithRetry } from './lib/lazyWithRetry.js'

// Pages chargées à la demande (code-splitting) pour alléger le bundle initial.
const Home = lazyWithRetry(() => import('./pages/Home.jsx'))
const Shop = lazyWithRetry(() => import('./pages/Shop.jsx'))
const Product = lazyWithRetry(() => import('./pages/Product.jsx'))
const Cart = lazyWithRetry(() => import('./pages/Cart.jsx'))
const Checkout = lazyWithRetry(() => import('./pages/Checkout.jsx'))
const CheckoutReturn = lazyWithRetry(() => import('./pages/CheckoutReturn.jsx'))
const Categories = lazyWithRetry(() => import('./pages/Categories.jsx'))
const CategoryPage = lazyWithRetry(() => import('./pages/CategoryPage.jsx'))
const Favorites = lazyWithRetry(() => import('./pages/Favorites.jsx'))
const About = lazyWithRetry(() => import('./pages/About.jsx'))
const Contact = lazyWithRetry(() => import('./pages/Contact.jsx'))
const FAQ = lazyWithRetry(() => import('./pages/FAQ.jsx'))
const Legal = lazyWithRetry(() => import('./pages/Legal.jsx'))
const Admin = lazyWithRetry(() => import('./pages/Admin.jsx'))
import NotFound from './pages/NotFound.jsx'
const Configurateur = lazyWithRetry(() => import('./pages/Configurateur.jsx'))
const CalculetteDiy = lazyWithRetry(() => import('./pages/CalculetteDiy.jsx'))
const Blog = lazyWithRetry(() => import('./pages/Blog.jsx'))
const BlogPost = lazyWithRetry(() => import('./pages/BlogPost.jsx'))
const StaticSeoPage = lazyWithRetry(() => import('./pages/StaticSeoPage.jsx'))

function BlogRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/guides/${slug}`} replace />
}

function PageFallback() {
  const location = useLocation()
  const snapshot = getPrerenderSnapshot(location.pathname)
  if (snapshot) {
    return (
      <div
        className={`container-page prerender-seo ${location.pathname === '/' ? '' : 'py-8'}`}
        aria-busy="true"
        dangerouslySetInnerHTML={{ __html: snapshot }}
      />
    )
  }
  return (
    <div className="container-page flex min-h-[50vh] items-center justify-center py-20">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-neon" aria-label="Chargement" />
    </div>
  )
}

function CheckoutHeader() {
  return (
    <header className="border-b border-white/10 bg-noir/90 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-2 text-xs font-medium text-muted">
          <IconLock width={16} height={16} className="text-neon" />
          <span className="hidden sm:inline">Paiement sécurisé par Mollie</span>
          <Link to="/panier" className="text-neon hover:underline">Retour au panier</Link>
        </div>
      </div>
    </header>
  )
}

export default function App() {
  const location = useLocation()
  const checkoutShell = location.pathname === '/checkout' || location.pathname.startsWith('/checkout/')

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenu" className="skip-link">Aller au contenu</a>
      <ScrollToTop />
      <AgeGate />
      {checkoutShell ? <CheckoutHeader /> : <Header />}
      {!checkoutShell && <SearchOverlay />}
      {!checkoutShell && <CartDrawer />}

      <main id="contenu" className="flex-1">
        <ErrorBoundary variant="page" resetKey={`${location.pathname}${location.search}`}>
          <Suspense fallback={<PageFallback />}>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/boutique" element={<Shop />} />
            <Route path="/configurateur" element={<Configurateur />} />
            <Route path="/calculette-diy" element={<CalculetteDiy />} />
            <Route path="/guides" element={<Blog />} />
            <Route path="/guides/:slug" element={<BlogPost />} />
            <Route path="/blog" element={<Navigate to="/guides" replace />} />
            <Route path="/blog/:slug" element={<BlogRedirect />} />
            <Route path="/boutique-vape-marseille" element={<StaticSeoPage />} />
            <Route path="/conformite-vape" element={<StaticSeoPage />} />
            <Route path="/livraison-retours" element={<StaticSeoPage />} />
            <Route path="/produit/:id" element={<Product />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/retour" element={<CheckoutReturn />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categorie/:slug" element={<CategoryPage />} />
            <Route path="/favoris" element={<Favorites />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/legal/:slug" element={<Legal />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {!checkoutShell && <Footer />}
      <CookieBanner />
      {!checkoutShell && <CoachVape />}
      <ConsentManager />
    </div>
  )
}
