import { Link } from 'react-router-dom'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { useTheme, selectPreset } from '../../store/themeStore'

// Festive collection cards (glassmorphism) — only renders while a theme
// like Valentine's / Rakhi / Diwali / Christmas is active.
export default function OccasionCollections() {
  const preset = selectPreset(useTheme((s) => s.settings))
  if (preset.id === 'default' || preset.collections.length === 0) return null

  return (
    <section className="container-px py-14">
      <SectionHeading
        eyebrow={`${preset.emoji} Limited time`}
        title={preset.collectionTitle}
        sub="Hand-picked corners of the shop, dressed for the occasion."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {preset.collections.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.05}>
            <Link
              to={c.to}
              className="glass-festive group flex flex-col items-center gap-2 rounded-[1.75rem] bg-maroon-800/60 px-4 py-8 text-center"
            >
              <span className="text-5xl transition duration-300 group-hover:scale-125 group-hover:-rotate-6">
                {c.emoji}
              </span>
              <span className="font-serif text-lg leading-snug text-cream-100">{c.label}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-400 opacity-0 transition group-hover:opacity-100">
                Shop now →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
