import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import ProductCard from '../ui/ProductCard'
import Reveal from '../ui/Reveal'
import { bestsellersFrom } from '../../data/products'
import { useProducts } from '../../store/productStore'

export default function Bestsellers() {
  const products = useProducts((s) => s.products)
  const bestsellers = bestsellersFrom(products, 6)
  const trackRef = useRef(null)

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <section className="py-20 overflow-hidden bg-gradient-to-b from-cream-50 to-blush-50">
      <div className="container-px">
        <SectionHeading
          eyebrow="Loved, wrapped & delivered"
          title="This season's bestsellers"
          sub="The boxes our customers reorder again and again."
        />
        <div className="relative">
          <div ref={trackRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none">
            {bestsellers.map((p, i) => (
              <motion.div
                key={p.id}
                className="w-72 sm:w-80 flex-shrink-0 snap-start"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => scroll(-1)} aria-label="Scroll left" className="btn-outline !px-5 !py-2.5">←</button>
            <button onClick={() => scroll(1)} aria-label="Scroll right" className="btn-outline !px-5 !py-2.5">→</button>
          </div>
        </div>
      </div>
      <Reveal className="mt-10 text-center">
        <Link to="/shop" className="btn-gold">Shop all bestsellers</Link>
      </Reveal>
    </section>
  )
}
