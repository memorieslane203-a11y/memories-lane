import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../ui/Reveal'
import ThreeD from '../three/ThreeD'
import SurpriseBox3D from '../three/SurpriseBox3D'
import { products } from '../../data/products'

const surpriseBundles = [
  { occasion: 'Birthday', theme: 'golden-hour', items: 'Candle · Truffles · Photo frame', product: 'golden-hour-anniversary' },
  { occasion: 'Self-Care', theme: 'blush-bliss', items: 'Silk mask · Rose tea · Bath salts', product: 'blush-bliss-box' },
  { occasion: 'Anniversary', theme: 'midnight-velvet', items: 'Pocket watch · Honey · Beeswax', product: 'golden-hour-anniversary' },
  { occasion: 'Festive', theme: 'golden-hour', items: 'Diyas · Ladoos · Spices', product: 'diwali-lights-box' },
  { occasion: 'Cozy Night', theme: 'midnight-velvet', items: 'Fleece socks · Cocoa · Puzzle', product: 'cozy-nights-box' },
  { occasion: 'Thank You', theme: 'blush-bliss', items: 'Shortbread · Tea · Keepsake tin', product: 'thank-you-tin' },
]

function FallbackBox() {
  return (
    <div className="grid h-full w-full place-items-center">
      <motion.div
        className="relative"
        animate={{ rotate: [0, 4, -4, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      >
        <div className="h-40 w-44 rounded-xl bg-maroon-600 shadow-lift" />
        <div className="absolute -inset-1.5 rounded-2xl border-2 border-gold-400 bg-blush-300/60" />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl">🎁</span>
      </motion.div>
    </div>
  )
}

export default function SurpriseMe() {
  const [spinKey, setSpinKey] = useState(0)
  const [open, setOpen] = useState(false)
  const [bundle, setBundle] = useState(null)

  const onSurprise = () => {
    setBundle(null)
    setOpen(false)
    setTimeout(() => {
      setSpinKey((k) => k + 1)
      setTimeout(() => {
        setBundle(surpriseBundles[Math.floor(Math.random() * surpriseBundles.length)])
        setOpen(true)
      }, 1900)
    }, 60)
  }

  return (
    <section className="py-20 overflow-hidden bg-maroon-800 text-cream-100">
      <div className="container-px grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading
            dark
            center={false}
            eyebrow="Feeling indecisive?"
            title="Let us surprise you"
            sub="Spin the box and we’ll reveal a themed bundle suggestion matched to the occasion you have in mind."
          />
          <div className="flex flex-wrap gap-3">
            <button onClick={onSurprise} className="btn-gold text-lg">
              🎲 Surprise me
            </button>
            <Link to="/shop" className="btn !border-2 !border-cream-100/40 text-cream-100 hover:bg-cream-100 hover:text-maroon-800 px-7 py-3.5">
              Browse instead
            </Link>
          </div>

          <div className="mt-8 min-h-32">
            <AnimatePresence mode="wait">
              {bundle ? (
                <motion.div
                  key={bundle.product}
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-3xl bg-white/10 border border-gold-400/40 p-6 backdrop-blur"
                >
                  <span className="script-accent text-2xl block">It’s a …</span>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-4xl">{bundle.occasion === 'Festive' ? '🪔' : '🎀'}</span>
                    <div>
                      <p className="font-serif text-2xl text-gold-300">{bundle.occasion} Bundle</p>
                      <p className="text-sm text-cream-100/75">{bundle.items}</p>
                    </div>
                  </div>
                  <Link
                    to={`/product/${bundle.product}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-extrabold text-maroon-800 hover:bg-gold-400 transition-colors"
                  >
                    See this box →
                  </Link>
                </motion.div>
              ) : (
                <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-cream-100/60 italic">
                  Press the button — a little luck never hurts.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="h-[320px] sm:h-[420px]">
          <ThreeD
            fallback={<FallbackBox />}
            children={<SurpriseBox3D spinKey={spinKey} open={open} className="h-full w-full" />}
          />
        </div>
      </div>
    </section>
  )
}
