import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Reveal from '../components/ui/Reveal'
import { useUI } from '../store/uiStore'

const schema = z.object({
  name: z.string().min(2, 'Please tell us your name'),
  email: z.string().email('Enter a valid email'),
  topic: z.string().min(1, 'Pick a topic'),
  message: z.string().min(10, 'Tell us a little more (min 10 chars)'),
})

const contactChannels = [
  { icon: '✉️', title: 'Email us', value: 'hello@memorieslane.example', note: 'We reply within 24h' },
  { icon: '📞', title: 'Call us', value: '+1 (555) 012-3456', note: 'Mon–Sat, 9am–6pm' },
  { icon: '💬', title: 'Live chat', value: 'Chat with a human', note: 'Avg. wait under 1 minute' },
  { icon: '📍', title: 'Studio', value: '14 Wrapper Row, London', note: 'By appointment only' },
]

export default function Contact() {
  const pushToast = useUI((s) => s.pushToast)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = (data) => {
    // ---- WIRE UP: POST /api/contact  { ...data }
    setSent(true)
    pushToast('Message received — we’ll be in touch soon 💌')
  }

  return (
    <section className="py-12 container-px">
      <div className="mb-14 text-center">
        <span className="script-accent text-3xl block">We love a good story</span>
        <h1 className="mt-1 font-serif text-4xl sm:text-5xl text-maroon-800">Say hello</h1>
        <p className="mx-auto mt-4 max-w-xl text-ink/70">
          Questions about a box, a custom order, or just want to talk ribbons? We’re all ears.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Channels */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {contactChannels.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.07}>
              <div className="rounded-3xl bg-white p-6 shadow-soft flex items-start gap-4 hover:shadow-lift transition-shadow">
                <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-blush-100 text-2xl">{c.icon}</span>
                <div>
                  <h3 className="font-serif text-lg text-maroon-800">{c.title}</h3>
                  <p className="font-bold text-gold-600 text-sm">{c.value}</p>
                  <p className="text-xs text-ink/50 mt-0.5">{c.note}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Form */}
        <Reveal>
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-lift">
            {sent ? (
              <div className="py-16 text-center">
                <p className="text-6xl mb-4 animate-float">💌</p>
                <h2 className="font-serif text-2xl text-maroon-800">Message sent!</h2>
                <p className="mt-2 text-ink/60">Thanks for writing to us — we’ll reply within a day.</p>
                <button onClick={() => setSent(false)} className="btn-ghost mt-6">Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label">Your name</label>
                    <input className="input" placeholder="Jane Doe" {...register('name')} />
                    {errors.name && <p className="mt-1 text-xs font-bold text-red-600">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input className="input" placeholder="you@example.com" {...register('email')} />
                    {errors.email && <p className="mt-1 text-xs font-bold text-red-600">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="label">What’s it about?</label>
                  <select className="input" {...register('topic')}>
                    <option value="">Choose a topic…</option>
                    <option>Order question</option>
                    <option>Corporate gifting</option>
                    <option>Build-your-own hamper</option>
                    <option>Magazines</option>
                    <option>Press & partnerships</option>
                    <option>Something else</option>
                  </select>
                  {errors.topic && <p className="mt-1 text-xs font-bold text-red-600">{errors.topic.message}</p>}
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea rows={5} className="input resize-none" placeholder="Tell us everything…" {...register('message')} />
                  {errors.message && <p className="mt-1 text-xs font-bold text-red-600">{errors.message.message}</p>}
                </div>
                <button type="submit" className="btn-primary w-full">Send message →</button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
