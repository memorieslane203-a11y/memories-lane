import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { isSupabaseReady } from '../lib/supabase'
import { useAuth } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const next = new URLSearchParams(location.search).get('next') || '/admin'
  const { signIn, signInWithGoogle, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    if (!email.trim() || !password) {
      setErr('Please enter your email and password.')
      return
    }
    const res = await signIn(email.trim(), password)
    if (res.ok) {
      navigate(next, { replace: true })
    } else {
      setErr(res.message)
    }
  }

  return (
    <section className="py-16 container-px">
      <div className="mx-auto max-w-md">
        <div className="rounded-[2rem] bg-white p-8 shadow-soft">
          <span className="script-accent block text-center text-2xl">Welcome back</span>
          <h1 className="mt-1 text-center font-serif text-3xl text-maroon-800">Sign in</h1>
          <p className="mt-2 text-center text-sm text-ink/60">
            Manage your orders, wishlist and the admin catalogue.
          </p>

          {!isSupabaseReady() && (
            <p className="mt-5 rounded-2xl bg-blush-50 border border-blush-200 p-4 text-sm text-maroon-700">
              ⚠️ Supabase isn’t connected yet — add your keys to <code className="font-bold">.env</code> and restart
              the dev server first.
            </p>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="login-password">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            {err && (
              <p className="rounded-2xl bg-blush-50 border border-blush-200 p-3 text-sm text-maroon-700">{err}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign in'}
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
            New here?{' '}
            <Link to="/signup" className="font-bold text-maroon-700 hover:text-gold-600">
              Create an account
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-ink/40">
            <Link to="/" className="hover:text-maroon-700">← Back to the shop</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
