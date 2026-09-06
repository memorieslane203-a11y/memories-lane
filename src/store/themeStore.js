import { create } from 'zustand'
import { supabase, isSupabaseReady } from '../lib/supabase'
import { FESTIVE_THEMES, resolveTheme, resolveBanner } from '../lib/festiveThemes'

// ============================================================================
// THEME STORE — occasion skin picked in /admin (Supabase: site_settings id=1)
// Falls back to Default when Supabase isn't configured. Not persisted —
// always fresh so a theme flip shows up instantly on the hosted site.
// ============================================================================

const DEFAULT_SETTINGS = {
  theme: 'default',
  banner_text: '',
  banner_enabled: true,
  starts_at: null,
  ends_at: null,
}

export const useTheme = create((set) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  load: async () => {
    if (!isSupabaseReady()) {
      set({ loaded: true })
      return
    }
    try {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
      if (data) set({ settings: { ...DEFAULT_SETTINGS, ...data }, loaded: true })
      else set({ loaded: true })
    } catch {
      set({ loaded: true })
    }
  },

  setSettings: (settings) => set({ settings }),
}))

// Convenience selectors for components
export function selectPreset(settings) {
  return resolveTheme(settings || DEFAULT_SETTINGS)
}

export function selectBanner(settings) {
  return resolveBanner(settings || DEFAULT_SETTINGS, selectPreset(settings))
}

export { FESTIVE_THEMES }
