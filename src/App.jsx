import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import AgeGate from './components/AgeGate.jsx'
import CookieBanner from './components/CookieBanner.jsx'
import SearchOverlay from './components/SearchOverlay.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import CoachVape from './components/CoachVape.jsx'
import ConsentManager from './components/ConsentManager.jsx'

// Pages chargées à la demande (code-splitting) pour alléger le bundle initial.
const Home = lazy(() => import('./pages/Home.jsx'))
const Shop = lazy(() => import('./pages/Shop.jsx'))
const Product = lazy(() => import('./pages/Product.jsx'))
const Cart = lazy(() => import('./pages/Cart.jsx'))
const Checkout = lazy(() => import('./pages/Checkout.jsx'))
const CheckoutReturn = lazy(() => import('./pages/CheckoutReturn.jsx'))
const Categories = lazy(() => import('./pages/Categories.jsx'))
const CategoryPage = lazy(() => import('./pages/CategoryPage.jsx'))
const Favorites = lazy(() => import('./pages/Favorites.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const FAQ = lazy(() => import('./pages/FAQ.jsx'))
const Legal = lazy(() => import('./pages/Legal.jsx'))
const Admin = lazy(() => import('./pages/Admin.jsx'))
import NotFound from './pages/NotFound.jsx'
const Configurateur = lazy(() => import('./pages/Configurateur.jsx'))
const CalculetteDiy = lazy(() => import('./pages/CalculetteDiy.jsx'))
const Blog = lazy(() => import('./pages/Blog.jsx'))
const BlogPost = lazy(() => import('./pages/BlogPost.jsx'))
const StaticSeoPage = lazy(() => import('./pages/StaticSeoPage.jsx'))

function BlogRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/guides/${slug}`} replace />
}

function PageFallback() {
  return (
    <div className="container-page flex min-h-[50vh] items-center justify-center py-20">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-neon" aria-label="Chargement" />
    </div>
  )
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenu" className="skip-link">Aller au contenu</a>
      <ScrollToTop />
      <AgeGate />
      <Header />
      <SearchOverlay />
      <CartDrawer />

      <main id="contenu" className="flex-1">
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
      </main>

      <Footer />
      <CookieBanner />
      <CoachVape />
      <ConsentManager />
    </div>
  )
}
