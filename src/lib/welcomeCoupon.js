// ============================================================================
// WELCOME COUPONS — one-time 10% off for first orders, tied to login email
// ----------------------------------------------------------------------------
// Claim  : newsletter signup issues ONE code per email (re-claim reminders ok)
// Redeem : code works only when signed in as that same email, only if the
//          account has zero orders yet, and only once (used flag burned at
//          order placement).
// ============================================================================

import { supabase, isSupabaseReady } from './supabase'
import { useAuth } from '../store/authStore'

const CODE_PREFIX = 'WELCOME-'

function genCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return `${CODE_PREFIX}${s}`
}

const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

// Issues (or re-reminds) a 10% code for this email. Throws on rule breaks.
export async function claimWelcomeCode(rawEmail) {
  const email = (rawEmail || '').trim().toLowerCase()
  if (!looksLikeEmail(email)) throw new Error('Enter a valid email address')
  if (!isSupabaseReady()) throw new Error('Signups are offline right now — try again soon')

  const loginEmail = useAuth.getState().user?.email?.toLowerCase()
  if (loginEmail && loginEmail !== email) {
    throw new Error('Use your login email — the 10% off only works on that account')
  }

  const { data: existing } = await supabase.from('welcome_coupons').select('*').eq('email', email).maybeSingle()
  if (existing) {
    if (existing.used) throw new Error('This email already used its 10% off — one per customer 💛')
    return { code: existing.code, reused: true }
  }

  const code = genCode()
  const { error } = await supabase.from('welcome_coupons').insert({ email, code })
  if (error) {
    // Someone just claimed it a second ago — treat as existing
    if (error.code === '23505') {
      const { data } = await supabase.from('welcome_coupons').select('*').eq('email', email).maybeSingle()
      if (data && !data.used) return { code: data.code, reused: true }
      throw new Error('This email already used its 10% off — one per customer 💛')
    }
    throw new Error(error.message)
  }
  return { code, reused: false }
}

// Validates a typed-in code against the signed-in user. Returns {ok, coupon|error}.
export async function validateWelcomeCode(rawCode) {
  const code = (rawCode || '').trim().toUpperCase()
  const { user } = useAuth.getState()
  if (!user?.email) return { ok: false, error: 'Sign in to use a welcome code' }
  if (!isSupabaseReady()) return { ok: false, error: 'Coupons are offline right now' }

  const { data, error } = await supabase.from('welcome_coupons').select('*').eq('code', code).maybeSingle()
  if (error || !data) return { ok: false, error: 'Invalid coupon code' }
  if (data.used) return { ok: false, error: 'This code was already used — one per customer 💛' }
  if (data.email !== user.email.toLowerCase()) {
    return { ok: false, error: `This code belongs to ${data.email} — sign in with that email` }
  }
  const { count } = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
  if ((count ?? 0) > 0) return { ok: false, error: 'Welcome codes work on your first order only' }

  return { ok: true, coupon: { code: data.code, type: 'percent', value: 10, welcome: true } }
}

// Burns the code after the order is placed. Best-effort — never fails checkout.
export async function markWelcomeUsed(code) {
  try {
    await supabase.from('welcome_coupons').update({ used: true, used_at: new Date().toISOString() }).eq('code', code)
  } catch {
    /* checkout already succeeded — admin can reconcile from the order record */
  }
}
