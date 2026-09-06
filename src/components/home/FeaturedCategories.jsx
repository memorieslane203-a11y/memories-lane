import { Link } from 'react-router-dom'
import SectionHeading from '../ui/SectionHeading'
import Reveal, { RevealStagger, RevealItem } from '../ui/Reveal'
import { categories } from '../../data/products'

const icons = { 'gift-boxes': '🎁', magazines: '📚', hampers: '🧺' }

export default function FeaturedCategories() {
  return (
    <section className="py-20 container-px">
      <SectionHeading
        eyebrow="Curated for every story"
        title="Three ways to say it beautifully"
        sub="Pick a ready-made surprise, a story that keeps arriving, or build something entirely yours."
      />
      <RevealStagger className="grid gap-6 md:grid-cols-3">
        {categories.map((c) => (
          <RevealItem key={c.slug}>
            <Link
              to={`/shop/${c.slug}`}
              className="group relative block overflow-hidden rounded-3xl shadow-soft hover:shadow-lift transition-shadow duration-300"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-blush-200 via-cream-100 to-gold-300">
                <div className="absolute inset-0 grid place-items-center">
                  <span className="text-8xl transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-6">
                    {icons[c.slug]}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-maroon-900/85 to-transparent p-6 pt-20">
                  <p className="script-accent text-2xl">{c.tagline}</p>
                  <h3 className="font-serif text-2xl text-cream-100 mt-1">{c.name}</h3>
                  <p className="mt-2 text-sm text-cream-100/80 line-clamp-2">{c.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-500 text-maroon-800 px-4 py-2 text-sm font-extrabold md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300">
                    Explore {c.name.split(' ')[0]} →
                  </span>
                </div>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealStagger>
      <Reveal className="mt-10 text-center">
        <Link to="/shop" className="btn-outline">Browse everything</Link>
      </Reveal>
    </section>
  )
}
