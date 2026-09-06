import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { isSupabaseReady } from '../lib/supabase'
import { useAuth } from '../store/authStore'
import { useUI } from '../store/uiStore'

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const next = new URLSearchParams(location.search).get('next') || '/admin'
  const { signUp, signInWithGoogle, loading } = useAuth()
  const pushToast = useUI((s) => s.pushToast)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState(null)
  const [done, setDone] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    if (!name.trim()) return setErr('Please enter your name.')
    if (!email.trim()) return setErr('Please enter your email.')
    if (password.length < 6) return setErr('Password must be at least 6 characters.')
    if (password !== confirm) return setErr('Passwords do not match.')
    const res = await signUp(email.trim(), password, name.trim())
    if (!res.ok) return setErr(res.message)
    if (res.needsConfirmation) {
      setDone(true)
    } else {
      pushToast('Account created — welcome to Memories Lane! 🎀')
      navigate(next, { replace: true })
    }
  }

  if (done) {
    return (
      <section className="py-16 container-px">
        <div className="mx-auto max-w-md">
          <div className="rounded-[2rem] bg-white p-8 shadow-soft text-center">
            <p className="text-5xl">📬</p>
            <h1 className="mt-4 font-serif text-3xl text-maroon-800">Check your inbox</h1>
            <p className="mt-3 text-sm text-ink/60">
              We sent a confirmation link to <span className="font-bold text-maroon-700">{email}</span>.
              Click it to activate your account, then come back and sign in.
            </p>
            <Link to={`/login${next !== '/admin' ? `?next=${next}` : ''}`} className="btn-gold mt-6 inline-block">Go to sign in</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 container-px">
      <div className="mx-auto max-w-md">
        <div className="rounded-[2rem] bg-white p-8 shadow-soft">
          <span className="script-accent block text-center text-2xl">Join the lane</span>
          <h1 className="mt-1 text-center font-serif text-3xl text-maroon-800">Create account</h1>
          <p className="mt-2 text-center text-sm text-ink/60">
            One account for orders, wishlist and managing your shop.
          </p>

          {!isSupabaseReady() && (
            <p className="mt-5 rounded-2xl bg-blush-50 border border-blush-200 p-4 text-sm text-maroon-700">
              ⚠️ Supabase isn’t connected yet — add your keys to <code className="font-bold">.env</code> and restart
              the dev server first.
            </p>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="signup-name">Name</label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="signup-password">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg opacity-60 hover:opacity-100"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="signup-confirm">Confirm password</label>
              <input
                id="signup-confirm"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="input"
              />
            </div>

            {err && (
              <p className="rounded-2xl bg-blush-50 border border-blush-200 p-3 text-sm text-maroon-700">{err}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-blush-200" />
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40">or</span>
            <span className="h-px flex-1 bg-blush-200" />
          </div>

          <button
            onClick={async () => { setErr(null); setGoogleLoading(true); const r = await signInWithGoogle(next); if (!r.ok) { setErr(r.message); setGoogleLoading(false) } }}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-blush-200 bg-white py-3 text-sm font-bold text-maroon-800 hover:border-gold-400 hover:bg-blush-50 transition"
          >
            <span className="text-lg">G</span> {googleLoading ? 'Opening Google…' : 'Continue with Google'}
          </button>

          <p className="mt-5 text-center text-sm text-ink/60">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-maroon-700 hover:text-gold-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}