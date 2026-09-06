import { Link } from 'react-router-dom'
import Reveal from '../ui/Reveal'

const steps = [
  { emoji: '🎯', title: 'Pick an occasion', text: 'Birthday, anniversary, festival — or let us surprise you.' },
  { emoji: '✍️', title: 'Add your message', text: 'Write a note. Schedule delivery for the perfect day.' },
  { emoji: '🎀', title: 'We wrap it by hand', text: 'Ribbon tied, card tucked in, photographed before it ships.' },
  { emoji: '📦', title: 'They unbox the joy', text: 'A memory, delivered — every box tells a story.' },
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-blush-50/60">
      <div className="container-px">
        <Reveal className="text-center mb-12">
          <span className="script-accent block">It’s simple</span>
          <h2 className="section-title">How gifting works</h2>
        </Reveal>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1} className="relative">
              <div className="text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white shadow-soft border-2 border-gold-300 text-4xl">
                  {s.emoji}
                </div>
                <p className="mt-3 text-xs font-extrabold uppercase tracking-widest text-gold-600">Step {i + 1}</p>
                <h3 className="mt-1 font-serif text-xl text-maroon-800">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink/60 max-w-52 mx-auto">{s.text}</p>
              </div>
              {i < steps.length - 1 && (
                <span className="hidden lg:block absolute top-10 left-[60%] text-2xl text-gold-400">→</span>
              )}
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link to="/build-your-hamper" className="btn-primary">Start a hamper</Link>
        </Reveal>
      </div>
    </section>
  )
}
