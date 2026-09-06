import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SectionHeading from '../components/ui/SectionHeading'
import Reveal from '../components/ui/Reveal'
import { faqs } from '../data/content'

const categories = ['Orders & delivery', 'Gifting', 'Returns']

export default function Faq() {
  const [open, setOpen] = useState(0)
  const [cat, setCat] = useState('Orders & delivery')
  const filtered = faqs.filter((f, i) => i % 4 === categories.indexOf(cat) % 4 || cat === 'Orders & delivery')

  return (
    <section className="py-12 container-px">
      <SectionHeading
        eyebrow="Everything you might ask"
        title="Frequently asked questions"
        sub="If you can’t find your answer here, our humans reply within a day."
      />

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside>
          <div className="lg:sticky lg:top-28 flex lg:flex-col gap-2 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-bold transition ${cat === c ? 'bg-maroon-700 text-cream-100 shadow-soft' : 'bg-white text-maroon-700 hover:bg-blush-50'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </aside>

        <Reveal>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((f, i) => (
                <motion.div
                  key={f.q}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-3xl bg-white shadow-soft overflow-hidden ${open === i ? 'ring-2 ring-gold-400' : ''}`}
                >
                  <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                    <span className="font-serif text-lg text-maroon-800">{f.q}</span>
                    <span className={`text-gold-600 text-2xl transition-transform ${open === i ? 'rotate-45' : ''}`}>＋</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="px-5 pb-5 text-ink/70 leading-relaxed">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-8 rounded-3xl bg-maroon-800 p-8 text-center text-cream-100">
            <h3 className="font-serif text-2xl">Still curious?</h3>
            <p className="mt-2 text-cream-100/70 text-sm">Our team answers every message within a day.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="btn-gold text-sm">Contact us</Link>
              <Link to="/track-order" className="btn !border-2 !border-cream-100/40 text-cream-100 hover:bg-cream-100 hover:text-maroon-800 px-6 py-3 text-sm">Track an order</Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
