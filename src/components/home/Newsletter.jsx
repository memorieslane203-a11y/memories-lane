import { useState } from 'react'
import Reveal from '../ui/Reveal'
import { useUI } from '../../store/uiStore'
import { claimWelcomeCode } from '../../lib/welcomeCoupon'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(null)
  const [busy, setBusy] = useState(false)
  const pushToast = useUI((s) => s.pushToast)

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      const res = await claimWelcomeCode(email)
      setCode(res.code)
      pushToast(res.reused ? `Already claimed — your code is ${res.code} 🎟️` : `Welcome! Your 10% code: ${res.code} 🎉`, 'success')
      setEmail('')
    } catch (err) {
      pushToast(err.message, 'error')
    }
    setBusy(false)
  }

  return (
    <section className="py-20 container-px">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-gold-sheen p-8 sm:p-14 text-center shadow-gold">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 2px, transparent 2px), radial-gradient(circle at 80% 70%, white 2px, transparent 2px)', backgroundSize: '60px 60px' }} />
          <div className="relative">
            <span className="script-accent text-3xl text-maroon-700">Join the lane</span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-maroon-800">
              Get 10% off your first gift
            </h2>
            <p className="mt-3 text-maroon-700/80 max-w-xl mx-auto">
              Early access to limited boxes, subscriber-only stories, and seasonal gift guides — no spam, only sparkle.
            </p>
            <form onSubmit={submit} className="mx-auto mt-7 flex max-w-lg flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input flex-1"
              />
              <button type="submit" disabled={busy} className="btn-primary whitespace-nowrap disabled:opacity-50">{busy ? 'Reserving…' : 'Get my 10% off'}</button>
            </form>
            {code && (
              <div className="mx-auto mt-5 max-w-lg rounded-2xl bg-white/70 border border-maroon-700/20 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-widest text-maroon-700/70">Your 10% off code — one per email</p>
                <p className="mt-1 font-serif text-3xl tracking-wider text-maroon-800">{code}</p>
                <p className="mt-1 text-xs text-maroon-700/70">Sign in with this same email at checkout to use it on your first order.</p>
              </div>
            )}
            <p className="mt-3 text-xs text-maroon-700/60">By subscribing you agree to our friendly privacy policy.</p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
