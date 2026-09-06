// ============================================================================
// FESTIVE THEMES — occasion skins (Valentine's, Rakhi, Diwali, Christmas…)
// ----------------------------------------------------------------------------
// The active theme is picked in /admin and stored in Supabase (site_settings),
// so it works on the hosted site with zero redeploys. Keep every Tailwind
// class as a FULL literal string here so the JIT compiler picks it up.
// ============================================================================

export const FESTIVE_THEMES = {
  default: {
    id: 'default',
    name: 'Default',
    emoji: '🎀',
    bar: 'bg-maroon-700 text-cream-100',
    banner: '🎁 Every box tells a story',
    heroEyebrow: 'Every box tells a story',
    heroTitleA: 'Unbox a',
    heroTitleB: 'Memory',
    heroAccent: 'text-gold-400',
    heroSub:
      'Surprise gift boxes, magazines and hampers — hand-curated, beautifully wrapped, and delivered with a note written just for them.',
    ctaPrimary: { label: 'Shop the collection', to: '/shop' },
    ctaSecondary: { label: 'Build a hamper', to: '/build-your-hamper' },
    heroOverlay: '',
    floaters: ['🎀', '✨', '💌', '🎁'],
    fall: null,
    collectionTitle: '',
    collections: [],
  },
  valentine: {
    id: 'valentine',
    name: "Valentine's Week",
    emoji: '💝',
    bar: 'bg-rose-700 text-rose-50',
    banner: '💘 Valentine week is here — wrap it with love',
    heroEyebrow: 'Made for Valentine’s week',
    heroTitleA: 'Unwrap',
    heroTitleB: 'Love',
    heroAccent: 'text-rose-300',
    heroSub:
      'Luxury hampers, roses, chocolates, teddy bears & personalized photo frames — wrapped to make hearts skip a beat.',
    ctaPrimary: { label: 'Shop Valentine gifts', to: '/shop/hampers' },
    ctaSecondary: { label: 'Personalize a frame', to: '/frames-bouquets' },
    heroOverlay: 'bg-gradient-to-br from-rose-950/70 via-maroon-900/50 to-pink-900/60',
    floaters: ['💝', '🌹', '💌', '❤️'],
    fall: ['🌹', '❤️', '💝', '💌'],
    collectionTitle: 'Shop the Valentine edit',
    collections: [
      { emoji: '💃', label: 'Gifts for Her', to: '/shop/gift-boxes' },
      { emoji: '🤵', label: 'Gifts for Him', to: '/shop/hampers' },
      { emoji: '💑', label: 'Couple Gifts', to: '/build-your-hamper' },
      { emoji: '🖼️', label: 'Personalized Gifts', to: '/frames-bouquets' },
      { emoji: '🎁', label: 'Surprise Hampers', to: '/shop' },
    ],
  },
  rakhi: {
    id: 'rakhi',
    name: 'Rakhi',
    emoji: '🪢',
    bar: 'bg-orange-700 text-amber-50',
    banner: '🪢 Rakhi edit is live — gifts that say “you’re stuck with me”',
    heroEyebrow: 'Tie it with love this Rakhi',
    heroTitleA: 'Tie a',
    heroTitleB: 'Memory',
    heroAccent: 'text-amber-300',
    heroSub:
      'Elegant rakhis, sibling hampers, chocolates, mugs & keepsakes — for the brother who teases and the sister who treasures.',
    ctaPrimary: { label: 'Shop Rakhi hampers', to: '/shop/hampers' },
    ctaSecondary: { label: 'Build a hamper', to: '/build-your-hamper' },
    heroOverlay: 'bg-gradient-to-br from-orange-900/60 via-red-950/50 to-amber-800/50',
    floaters: ['🪢', '🪔', '🌼', '✨'],
    fall: ['🌼', '🪢', '✨'],
    collectionTitle: 'The Rakhi collection',
    collections: [
      { emoji: '🤝', label: 'For Brother', to: '/shop/hampers' },
      { emoji: '🎀', label: 'For Sister', to: '/shop/gift-boxes' },
      { emoji: '🧺', label: 'Rakhi Hampers', to: '/shop' },
      { emoji: '🖼️', label: 'Personalized Gifts', to: '/frames-bouquets' },
      { emoji: '✨', label: 'Premium Rakhi Combos', to: '/build-your-hamper' },
    ],
  },
  diwali: {
    id: 'diwali',
    name: 'Diwali',
    emoji: '🪔',
    bar: 'bg-purple-900 text-amber-100',
    banner: '🪔 Diwali gifting is on — light up their day',
    heroEyebrow: 'Light up their Diwali',
    heroTitleA: 'Light up',
    heroTitleB: 'Diwali',
    heroAccent: 'text-amber-300',
    heroSub:
      'Premium hampers, dry-fruit boxes, sweets, candles, diyas & glowing keepsakes — luxury gifting, delivered to their door.',
    ctaPrimary: { label: 'Shop Diwali hampers', to: '/shop/hampers' },
    ctaSecondary: { label: 'Corporate gifting', to: '/shop/gift-boxes' },
    heroOverlay: 'bg-gradient-to-br from-purple-950/80 via-indigo-950/60 to-amber-800/50',
    floaters: ['🪔', '🎇', '✨', '🎁'],
    fall: ['🪔', '✨', '🎇'],
    collectionTitle: 'Diwali gifting edit',
    collections: [
      { emoji: '🪔', label: 'Diwali Hampers', to: '/shop/hampers' },
      { emoji: '💼', label: 'Corporate Gifts', to: '/shop/gift-boxes' },
      { emoji: '👑', label: 'Luxury Gifts', to: '/shop' },
      { emoji: '🍬', label: 'Sweet & Dry Fruit Boxes', to: '/build-your-hamper' },
      { emoji: '🖼️', label: 'Personalized Gifts', to: '/frames-bouquets' },
    ],
  },
  christmas: {
    id: 'christmas',
    name: 'Christmas',
    emoji: '🎄',
    bar: 'bg-emerald-800 text-emerald-50',
    banner: '🎄 Merry gifting season — wrap it before the sleigh leaves',
    heroEyebrow: 'Merry little gifts',
    heroTitleA: 'Merry',
    heroTitleB: 'Gifting',
    heroAccent: 'text-emerald-200',
    heroSub:
      'Cozy hampers, candles, mugs, teddy bears & surprise boxes — under every tree, a memory waiting to be unwrapped.',
    ctaPrimary: { label: 'Shop Christmas gifts', to: '/shop/gift-boxes' },
    ctaSecondary: { label: 'Secret Santa picks', to: '/shop' },
    heroOverlay: 'bg-gradient-to-br from-emerald-950/70 via-green-950/50 to-red-950/50',
    floaters: ['🎄', '❄️', '🎁', '🔔'],
    fall: ['❄️', '🎄', '🔔'],
    collectionTitle: 'Christmas gift guide',
    collections: [
      { emoji: '🎄', label: 'Christmas Hampers', to: '/shop/hampers' },
      { emoji: '💃', label: 'Gifts for Her', to: '/shop/gift-boxes' },
      { emoji: '🤵', label: 'Gifts for Him', to: '/shop' },
      { emoji: '🎅', label: 'Secret Santa', to: '/build-your-hamper' },
      { emoji: '🖼️', label: 'Family Gifts', to: '/frames-bouquets' },
      { emoji: '💼', label: 'Corporate Christmas Gifts', to: '/shop/gift-boxes' },
    ],
  },
}

export const THEME_IDS = Object.keys(FESTIVE_THEMES)

// Picks the effective theme from admin settings + optional auto-schedule.
// Outside [starts_at, ends_at] (when set) it falls back to default.
export function resolveTheme(settings, now = new Date()) {
  const raw = FESTIVE_THEMES[settings?.theme] ? settings.theme : 'default'
  if (raw === 'default') return FESTIVE_THEMES.default
  if (settings?.starts_at && now < new Date(settings.starts_at)) return FESTIVE_THEMES.default
  if (settings?.ends_at && now > new Date(settings.ends_at)) return FESTIVE_THEMES.default
  return FESTIVE_THEMES[raw]
}

export function resolveBanner(settings, preset) {
  if (settings?.banner_enabled === false) return null
  const custom = (settings?.banner_text || '').trim()
  return custom || preset.banner
}
