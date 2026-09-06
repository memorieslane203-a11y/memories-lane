import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductTilt from './ProductTilt'
import Price from './Price'
import { useCart } from '../../store/cartStore'
import { useWishlist } from '../../store/wishlistStore'
import { useUI } from '../../store/uiStore'

export default function ProductCard({ product, className = '' }) {
  const addItem = useCart((s) => s.addItem)
  const wishlist = useWishlist((s) => s)
  const pushToast = useUI((s) => s.pushToast)
  const wished = wishlist.isWishlisted(product.slug)

  const onAdd = (e) => {
    e.preventDefault()
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0]?.src,
      price: product.price,
    })
    pushToast(`${product.name} added to cart 🎁`)
  }

  const onWish = (e) => {
    e.preventDefault()
    const added = wishlist.toggle(product)
    pushToast(added ? 'Added to wishlist ♥' : 'Removed from wishlist', added ? 'success' : 'info')
  }

  return (
    <ProductTilt className={className}>
      <motion.article
        whileHover="hover"
        className="group relative rounded-3xl bg-white overflow-hidden shadow-soft hover:shadow-lift transition-shadow duration-300"
      >
        <Link to={`/product/${product.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-cream-100">
            <img
              src={product.images?.[0]?.src}
              alt={product.images?.[0]?.alt ?? product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div style={{ transform: 'translateZ(40px)' }} className="absolute inset-0">
              {product.badge && (
                <span className="absolute top-3 left-3 rounded-full bg-gold-500 text-maroon-800 text-xs font-extrabold px-3 py-1.5 shadow-gold">
                  {product.badge}
                </span>
              )}
            </div>
            {product.stock < 10 && product.stock > 0 && (
              <span className="absolute top-3 right-3 rounded-full bg-maroon-600 text-cream-100 text-xs font-extrabold px-3 py-1.5">
                Only {product.stock} left
              </span>
            )}
            {product.stock === 0 && (
              <span className="absolute top-3 right-3 rounded-full bg-ink/70 text-cream-100 text-xs font-extrabold px-3 py-1.5">
                Out of stock
              </span>
            )}
            {/* hover action bar — always visible on touch, hover-reveal on desktop */}
            <div className="absolute inset-x-3 bottom-3 flex gap-2 md:opacity-0 md:translate-y-3 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300">
              <button type="button" onClick={onAdd} className="btn-gold flex-1 !py-3 text-sm">
                Add to Cart
              </button>
              <button
                type="button"
                onClick={onWish}
                aria-label="Toggle wishlist"
                className={`btn !px-4 !py-3 rounded-full ${wished ? 'bg-blush-100 text-maroon-600' : 'bg-white text-maroon-700'}`}
              >
                {wished ? '♥' : '♡'}
              </button>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-widest font-extrabold text-gold-600">
                {product.category === 'gift-boxes' ? 'Gift Box' : product.category === 'magazines' ? 'Magazine' : 'Hamper'}
              </span>
            </div>
            <h3 className="mt-1.5 font-serif text-lg text-maroon-800 leading-snug">{product.name}</h3>
            <p className="mt-1 text-sm text-ink/60 line-clamp-2">{product.short}</p>
            <div className="mt-3 flex items-center justify-between">
              <Price price={product.price} compareAt={product.compareAt} />
            </div>
          </div>
        </Link>
      </motion.article>
    </ProductTilt>
  )
}
