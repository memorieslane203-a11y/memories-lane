import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuth = create((set) => ({
  user: null,
  session: null,
  initialized: false,
  loading: false,

  async init() {
    if (!supabase) {
      set({ initialized: true })
      return
    }
    const {
      data: { session },
    } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null, initialized: true })
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  async signUp(email, password, fullName) {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName?.trim() || '' } },
      })
      if (error) return { ok: false, message: error.message }
      return {
        ok: true,
        needsConfirmation: !data.session,
      }
    } catch (e) {
      return { ok: false, message: e.message }
    } finally {
      set({ loading: false })
    }
  },

  async signIn(email, password) {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { ok: false, message: error.message }
      set({ session: data.session, user: data.user })
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e.message }
    } finally {
      set({ loading: false })
    }
  },

  async signInWithGoogle(nextPath) {
    if (!supabase) return { ok: false, message: 'Supabase not configured' }
    if (nextPath) localStorage.setItem('oauth_next', nextPath)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  },

  async signOut() {
    await supabase.auth.signOut()
    set({ session: null, user: null })
  },
}))
