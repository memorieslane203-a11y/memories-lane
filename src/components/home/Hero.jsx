import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ThreeD from '../three/ThreeD'
import GiftBox3D from '../three/GiftBox3D'
import { useTheme, selectPreset } from '../../store/themeStore'

function HeroFallback() {
  return (
    <div className="relative mx-auto h-full w-full max-w-md">
      <motion.div
        className="absolute inset-0 grid place-items-center"
        animate={{ y: [0, -14, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
      >
        <div className="relative">
          <div className="h-44 w-52 rounded-xl bg-maroon-600 shadow-lift" />
          <div className="absolute -inset-1.5 -top-2.5 rounded-2xl bg-blush-300/70 border-2 border-gold-400" />
          <div className="absolute left-1/2 -top-3 h-7 w-32 -translate-x-1/2 rounded-full bg-gold-500 shadow-gold" />
          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-6 text-4xl animate-float">🎀</span>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl">✨</span>
        </div>
      </motion.div>
    </div>
  )
}

export default function Hero() {
  const preset = selectPreset(useTheme((s) => s.settings))
  const festive = preset.id !== 'default'
  return (
    <section className="relative overflow-hidden bg-hero-pattern">
      {festive && preset.heroOverlay && (
        <div aria-hidden className={`pointer-events-none absolute inset-0 ${preset.heroOverlay}`} />
      )}
      <div className="container-px relative grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:min-h-[82vh]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center lg:text-left"
        >
          <span className="script-accent block">{preset.heroEyebrow}</span>
          <h1 className="mt-2 font-serif text-5xl sm:text-6xl lg:text-7xl text-cream-100 leading-[1.05] text-balance">
            {preset.heroTitleA}
            <span className={`relative inline-block px-2 ${preset.heroAccent}`}>
              {preset.heroTitleB}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 9C60 2 140 2 198 9" stroke="#D9AC5C" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="festive-dark-text mt-6 text-lg font-medium text-cream-100 max-w-xl mx-auto lg:mx-0">
            {preset.heroSub}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <Link to={preset.ctaPrimary.to} className="btn-gold !px-6 !py-2.5 !text-sm btn-glow">{preset.ctaPrimary.label}</Link>
            <Link to={preset.ctaSecondary.to} className="btn !border-2 !border-cream-100/70 !px-6 !py-2.5 !text-sm text-cream-100 hover:!border-gold-400 hover:text-gold-300">{preset.ctaSecondary.label}</Link>
          </div>
          <div className="mt-10 flex items-center justify-center lg:justify-start gap-4">
            <div className="rounded-full bg-white px-5 py-2.5 shadow-soft">
              <p className="font-serif text-lg text-maroon-800">₹200+ <span className="text-sm font-bold uppercase tracking-widest text-ink/50">Free shipping</span></p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[340px] sm:h-[440px] lg:h-[560px]"
        >
          <ThreeD
            fallback={<HeroFallback />}
            children={<GiftBox3D className="h-full w-full" />}
          />
        </motion.div>
      </div>

      {/* Floating decorative ribbons */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          ['left-[4%] top-[12%]', '-rotate-12', 'text-4xl'],
          ['right-[6%] top-[18%]', 'rotate-12', 'text-5xl'],
          ['left-[12%] bottom-[8%]', 'rotate-6', 'text-3xl'],
          ['right-[14%] bottom-[12%]', '-rotate-6', 'text-4xl'],
        ].map(([pos, rot, size], i) => (
          <span key={i} className={`absolute ${pos} ${rot} ${size} opacity-30 animate-float`} style={{ animationDelay: `${i * 0.7}s` }}>
            {preset.floaters[i]}
          </span>
        ))}
      </div>
    </section>
  )
}
