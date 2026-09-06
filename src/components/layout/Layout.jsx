import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import Toasts from '../ui/Toasts'
import CartDrawer from '../ui/CartDrawer'
import { useCurrency } from '../../store/currencyStore'

export default function Layout({ children }) {
  // Subscribe so switching currency in the footer re-renders all prices.
  useCurrency()

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toasts />
      <CartDrawer />
    </div>
  )
}
