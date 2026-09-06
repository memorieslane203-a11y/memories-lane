import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/layout/Layout'
import PageLoader from './components/ui/PageLoader'
import FestiveFall from './components/ui/FestiveFall'
import { useProducts } from './store/productStore'
import { useAuth } from './store/authStore'
import { useTheme } from './store/themeStore'

const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const BuildHamper = lazy(() => import('./pages/BuildHamper'))
const FramesBouquets = lazy(() => import('./pages/FramesBouquets'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Account = lazy(() => import('./pages/Account'))
const Explore = lazy(() => import('./pages/Explore'))
const Contact = lazy(() => import('./pages/Contact'))
const Faq = lazy(() => import('./pages/Faq'))
const TrackOrder = lazy(() => import('./pages/TrackOrder'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Admin = lazy(() => import('./pages/Admin'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:category" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/build-your-hamper" element={<BuildHamper />} />
          <Route path="/frames-bouquets" element={<FramesBouquets />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

export default function App() {
  const loadProducts = useProducts((s) => s.load)
  const initAuth = useAuth((s) => s.init)
  const loadTheme = useTheme((s) => s.load)
  useEffect(() => {
    loadProducts()
    initAuth()
    loadTheme()
    const next = localStorage.getItem('oauth_next')
    if (next) {
      localStorage.removeItem('oauth_next')
      if (window.location.pathname === '/') window.history.replaceState(null, '', next)
    }
  }, [loadProducts, initAuth, loadTheme])

  return (
    <BrowserRouter>
      <Layout>
        <FestiveFall />
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  )
}
