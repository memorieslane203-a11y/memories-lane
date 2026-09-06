// ============================================================================
// PLACEHOLDER PRODUCT DATA
// ----------------------------------------------------------------------------
// In production this module is replaced by API calls, e.g.:
//   const res = await fetch('/api/products')
// Every consumer reads from the same shape, so swapping the source is isolated
// to this file.
// ============================================================================

export const categories = [
  {
    slug: 'gift-boxes',
    name: 'Surprise Gift Boxes',
    tagline: 'Curated boxes of joy',
    description:
      'Beautifully wrapped, themed surprise boxes packed with small luxuries, keepsakes and handwritten-worthy goodies.',
    image: '/img/categories/gift-box.jpg',
  },
  {
    slug: 'magazines',
    name: 'Magazines',
    tagline: 'Stories to treasure',
    description:
      'Independent print magazines, beautifully wrapped and delivered to the door.',
    image: '/img/categories/magazine.jpg',
  },
  {
    slug: 'hampers',
    name: 'Gift Hampers',
    tagline: 'Generous, gorgeous, gifting',
    description:
      'Woven hampers filled with artisanal treats, candles and keepsakes — built by us or by you.',
    image: '/img/categories/hamper.jpg',
  },
]

export const occasions = [
  { slug: 'birthday', name: 'Birthday', emoji: '🎂', description: 'Celebrate another trip around the sun.' },
  { slug: 'anniversary', name: 'Anniversary', emoji: '💞', description: 'Mark the milestones of love.' },
  { slug: 'diwali', name: 'Diwali', emoji: '🪔', description: 'Light, sweets and togetherness.' },
  { slug: 'christmas', name: 'Christmas', emoji: '🎄', description: 'Festive cheer, wrapped in ribbon.' },
  { slug: 'corporate', name: 'Corporate Gifting', emoji: '💼', description: 'Thoughtful, on-brand client gifts.' },
  { slug: 'self-care', name: 'Self-Care', emoji: '🕯️', description: 'Slow-down kits for a well-deserved treat.' },
  { slug: 'thank-you', name: 'Thank You', emoji: '💌', description: 'Say it with a little something.' },
  { slug: 'new-baby', name: 'New Baby', emoji: '🍼', description: 'Welcome gifts for tiny humans.' },
]

export const themes = [
  { slug: 'blush-bliss', name: 'Blush Bliss', color: '#F6CED3' },
  { slug: 'golden-hour', name: 'Golden Hour', color: '#E8C57E' },
  { slug: 'midnight-velvet', name: 'Midnight Velvet', color: '#3D121B' },
  { slug: 'meadow', name: 'Meadow', color: '#BFD8B8' },
  { slug: 'ocean-breeze', name: 'Ocean Breeze', color: '#BFD3E8' },
]

export const recipients = [
  'Her', 'Him', 'Kids', 'Friends', 'Parents', 'Team', 'Anyone',
]

const emojiImages = [
  '🎁', '🕯️', '🍫', '📚', '🌸', '✨', '🧸', '🍪', '☕', '🛁', '💌', '🌿',
]

// Helper to produce image-slot placeholders (a small gradient tile + emoji)
export function placeholderImages(base, count = 4) {
  return Array.from({ length: count }, (_, i) => ({
    src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${i % 2 ? '#FBE7E9' : '#FAF0DE'}"/>
            <stop offset="100%" stop-color="${i % 2 ? '#E8C57E' : '#F6CED3'}"/>
          </linearGradient>
        </defs>
        <rect width="800" height="800" fill="url(#g)"/>
        <rect x="40" y="40" width="720" height="720" rx="32" fill="none" stroke="#7A2736" stroke-opacity="0.2" stroke-width="4"/>
        <text x="400" y="380" font-size="180" text-anchor="middle">${emojiImages[i % emojiImages.length]}</text>
        <text x="400" y="540" font-family="Georgia" font-size="46" fill="#7A2736" text-anchor="middle">${base}</text>
        <text x="400" y="600" font-family="Georgia" font-size="28" fill="#7A2736" text-anchor="middle" opacity="0.7">Memories Lane</text>
      </svg>`)}`,
    alt: `${base} view ${i + 1}`,
  }))
}

export const products = [
  {
    id: 'gb-001',
    slug: 'blush-bliss-box',
    name: 'Blush Bliss Box',
    category: 'gift-boxes',
    price: 49,
    compareAt: 62,
    rating: 4.9,
    reviewCount: 214,
    badge: 'Bestseller',
    stock: 18,
    occasion: ['birthday', 'self-care', 'thank-you'],
    recipient: ['Her', 'Anyone'],
    theme: 'blush-bliss',
    short: 'A blush-toned box of silk sleep mask, rose tea, cocoa truffles and a hand-tied ribbon.',
    description:
      'Our most-loved box. Wrapped in soft blush paper with a satin ribbon, Blush Bliss contains a curated edit of small luxuries chosen to feel like a warm hug in parcel form. Each box is packed by hand and finished with a handwritten-style note.',
    whatInside: [
      'Silk sleep mask (blush)',
      'Rose & chamomile loose-leaf tea tin',
      '6 handmade cocoa truffles',
      'Scented soy candle — 8h burn',
      'Hand-tied satin ribbon & keepsake card',
      'Gift note (add yours at checkout)',
    ],
    images: placeholderImages('Blush Bliss Box'),
  },
  {
    id: 'gb-002',
    slug: 'golden-hour-anniversary',
    name: 'Golden Hour Anniversary',
    category: 'gift-boxes',
    price: 79,
    compareAt: 95,
    rating: 4.8,
    reviewCount: 142,
    badge: 'New',
    stock: 9,
    occasion: ['anniversary'],
    recipient: ['Her', 'Him', 'Parents'],
    theme: 'golden-hour',
    short: 'Gold-accented keepsake box with a pocket watch charm, honey set and photo-frame card.',
    description:
      'Designed for milestone moments. The Golden Hour box celebrates love with gilded keepsakes, artisan honey, and a frameable memory card your recipient can display long after the ribbon is untied.',
    whatInside: [
      'Gold-plated pocket watch charm',
      'Raw honey jar — single orchard',
      'Photograph-frame greeting card',
      'Beeswax candle set',
      'Hand-embossed keepsake box',
    ],
    images: placeholderImages('Golden Hour'),
  },
  {
    id: 'gb-003',
    slug: 'little-stargazer',
    name: 'Little Stargazer',
    category: 'gift-boxes',
    price: 39,
    compareAt: null,
    rating: 4.7,
    reviewCount: 96,
    badge: 'For Kids',
    stock: 24,
    occasion: ['birthday', 'new-baby'],
    recipient: ['Kids'],
    theme: 'midnight-velvet',
    short: 'A night-sky themed box with glow stars, storybook and cocoa for a cosy bedtime ritual.',
    description:
      'For curious little minds. Little Stargazer brings bedtime magic with a storybook, glow-in-the-dark stars, cocoa sachets and a soft constellation-print blanket.',
    whatInside: [
      'Hardcover picture storybook',
      'Glow-in-the-dark star set',
      '2 hot-cocoa sachets (kid-safe)',
      'Constellation print blanket',
      'Puffy star stickers',
    ],
    images: placeholderImages('Little Stargazer'),
  },
  {
    id: 'gb-004',
    slug: 'surprise-me-box',
    name: 'Surprise Me — Mystery Box',
    category: 'gift-boxes',
    price: 55,
    compareAt: null,
    rating: 4.9,
    reviewCount: 321,
    badge: 'Mystery',
    stock: 40,
    occasion: ['birthday', 'thank-you', 'christmas'],
    recipient: ['Anyone'],
    theme: 'golden-hour',
    short: 'We curate, you unwrap. A mystery bundle themed to the occasion you pick.',
    description:
      'Let us do the guessing. Choose an occasion and budget and our curators fill a box with a mix of small luxuries — candles, treats, stationery, keepsakes. Contents stay secret until the lid comes off.',
    whatInside: [
      '5–7 curated surprises',
      'Always includes a candle & a sweet',
      'Limited-edition keepsake',
      'Themed wrapping + ribbon',
      'A "reveal" card describing each item',
    ],
    images: placeholderImages('Surprise Me'),
  },
  {
    id: 'mag-001',
    slug: 'kinfolk-edition',
    name: 'KINFOLK — Print Edition',
    category: 'magazines',
    price: 38,
    compareAt: 48,
    rating: 4.8,
    reviewCount: 87,
    badge: 'Editor’s Pick',
    stock: 999,
    occasion: ['self-care', 'thank-you'],
    recipient: ['Her', 'Him', 'Friends'],
    theme: 'meadow',
    short: 'Slow living stories about home, food and craft — beautifully printed and delivered in linen-wrapped parcels.',
    description:
      'Quiet, thoughtful stories about home, food and slow living — beautifully printed and delivered in protective kraft wrap with a seasonal gift card.',
    whatInside: [
      'A beautifully wrapped print issue',
      'Linen-look protective wrap',
      'Seasonal gift card',
      'Early access to limited covers',
    ],
    images: placeholderImages('KINFOLK'),
  },
  {
    id: 'mag-002',
    slug: 'monocle-edition',
    name: 'MONOCLE — Print Edition',
    category: 'magazines',
    price: 120,
    compareAt: 144,
    rating: 4.7,
    reviewCount: 54,
    badge: 'Best Value',
    stock: 999,
    occasion: ['corporate', 'anniversary'],
    recipient: ['Him', 'Friends', 'Team'],
    theme: 'midnight-velvet',
    short: 'Global affairs, design & culture — the thinking person’s monthly, wrapped with the seasonal guides.',
    description:
      'Design, business, culture and travel from around the world — a beautifully wrapped print edition with the seasonal guides included.',
    whatInside: [
      'A full year of issues (12)',
      '4 seasonal city guides',
      'Tote-bag welcome gift',
      'Digital access included',
      'Gift note printed on the slip',
    ],
    images: placeholderImages('MONOCLE'),
  },
  {
    id: 'mag-003',
    slug: 'cereal-edition',
    name: 'CEREAL — Travel & Style',
    category: 'magazines',
    price: 42,
    compareAt: null,
    rating: 4.9,
    reviewCount: 63,
    badge: 'Editor’s Pick',
    stock: 999,
    occasion: ['self-care', 'birthday'],
    recipient: ['Her', 'Him', 'Friends'],
    theme: 'blush-bliss',
    short: 'An art of place and style, wrapped in tissue and sealed with wax.',
    description:
      'CEREAL is a print magazine focused on travel, food, style and design. Each issue arrives wrapped in printed tissue with a wax seal — an unboxing moment in itself.',
    whatInside: [
      '2 beautifully crafted issues',
      'Tissue wrap + wax seal',
      'Large-format photography',
      'Gift message printed on slip',
    ],
    images: placeholderImages('CEREAL'),
  },
  {
    id: 'ham-001',
    slug: 'artisan-wine-hamper',
    name: 'Artisan Wine & Cheese Hamper',
    category: 'hampers',
    price: 89,
    compareAt: 110,
    rating: 4.8,
    reviewCount: 178,
    badge: 'Popular',
    stock: 12,
    occasion: ['anniversary', 'christmas', 'corporate'],
    recipient: ['Him', 'Her', 'Team'],
    theme: 'golden-hour',
    short: 'A woven hamper with a boutique bottle, aged cheese, crackers and fig chutney.',
    description:
      'Our classic entertainer’s hamper: a single-estate wine, artisan cheese board essentials and a keepsake wicker basket they’ll reuse for years.',
    whatInside: [
      'Boutique wine (750ml)',
      'Aged cheddar & camembert',
      'Artisan crackers & fig chutney',
      'Woven wicker basket',
      'Gift card & ribbon',
    ],
    images: placeholderImages('Wine & Cheese'),
  },
  {
    id: 'ham-002',
    slug: 'spa-day-hamper',
    name: 'Spa Day Self-Care Hamper',
    category: 'hampers',
    price: 69,
    compareAt: null,
    rating: 4.9,
    reviewCount: 243,
    badge: 'Self-Care',
    stock: 20,
    occasion: ['self-care', 'thank-you'],
    recipient: ['Her', 'Anyone'],
    theme: 'blush-bliss',
    short: 'Bath salts, candles, body oils and a fluffy robe — a spa day in a basket.',
    description:
      'A full slow-down kit: botanical bath salts, a rich body oil, scented candle, silk hair wrap and a cloud-soft robe. Packed in a reusable blush basket.',
    whatInside: [
      'Botanical bath salts (300g)',
      'Body oil — neroli & vanilla',
      'Scented candle, 25h burn',
      'Silk hair wrap',
      'Cloud-soft bath robe',
    ],
    images: placeholderImages('Spa Day'),
  },
  {
    id: 'ham-003',
    slug: 'festive-feast-hamper',
    name: 'Festive Feast Hamper',
    category: 'hampers',
    price: 99,
    compareAt: 125,
    rating: 4.7,
    reviewCount: 88,
    badge: 'Seasonal',
    stock: 7,
    occasion: ['christmas', 'diwali'],
    recipient: ['Parents', 'Friends', 'Team'],
    theme: 'golden-hour',
    short: 'Mince pies, spiced nuts, chutneys and a mulled-wine kit in a festive basket.',
    description:
      'Everything for a cosy seasonal table. Ready-to-serve treats plus a mulled-wine spice kit and a candle-lit dinner playlist card.',
    whatInside: [
      '6 mince pies (baked)',
      'Spiced roasted nuts',
      'Cranberry & port chutney',
      'Mulled-wine spice kit',
      'Truffle chocolate bar',
    ],
    images: placeholderImages('Festive Feast'),
  },
  {
    id: 'gb-005',
    slug: 'diwali-lights-box',
    name: 'Diwali Lights Box',
    category: 'gift-boxes',
    price: 59,
    compareAt: 70,
    rating: 4.9,
    reviewCount: 132,
    badge: 'Diwali Edit',
    stock: 15,
    occasion: ['diwali'],
    recipient: ['Parents', 'Her', 'Anyone'],
    theme: 'golden-hour',
    short: 'Diyas, ladoos, marigold ribbon and a hand-painted gift box for the festival of lights.',
    description:
      'Celebrate Diwali with hand-painted diyas, premium ladoos, a spice-blend sampler and marigold-toned ribbon on a keepsake box.',
    whatInside: [
      '2 hand-painted terracotta diyas',
      'Premium besan ladoos (4 pcs)',
      'Festive spice blend sampler',
      'Marigold ribbon & greeting card',
      'Keep-treasure storage box',
    ],
    images: placeholderImages('Diwali Lights'),
  },
  {
    id: 'gb-006',
    slug: 'cozy-nights-box',
    name: 'Cozy Nights Box',
    category: 'gift-boxes',
    price: 45,
    compareAt: null,
    rating: 4.6,
    reviewCount: 109,
    badge: 'Winter',
    stock: 22,
    occasion: ['christmas', 'self-care'],
    recipient: ['Her', 'Him', 'Friends'],
    theme: 'midnight-velvet',
    short: 'Fleece socks, cocoa kit, a mini puzzle and a dreamy candle for cold evenings.',
    description:
      'Hibernation essentials. Chunky fleece socks, a gourmet cocoa kit, a 500-piece puzzle and a vanilla-cedar candle in a deep maroon box.',
    whatInside: [
      'Chunky fleece socks (pair)',
      'Gourmet cocoa kit (3 sachets)',
      '500-piece illustrated puzzle',
      'Vanilla & cedar candle',
    ],
    images: placeholderImages('Cozy Nights'),
  },
  {
    id: 'ham-004',
    slug: 'coffee-lovers-hamper',
    name: 'Coffee Lovers Hamper',
    category: 'hampers',
    price: 64,
    compareAt: 75,
    rating: 4.8,
    reviewCount: 97,
    badge: 'For Him',
    stock: 16,
    occasion: ['birthday', 'thank-you', 'corporate'],
    recipient: ['Him', 'Team'],
    theme: 'golden-hour',
    short: 'Single-origin beans, a pour-over kit and spiced shortbread in a rustic crate.',
    description:
      'For the morning ritual. Two bags of single-origin beans, a ceramic pour-over dripper, spiced shortbread and a branded carry crate.',
    whatInside: [
      '2 × 250g single-origin beans',
      'Ceramic pour-over dripper',
      'Spiced shortbread tin',
      'Reusable wooden crate',
    ],
    images: placeholderImages('Coffee Lovers'),
  },
  {
    id: 'gb-007',
    slug: 'thank-you-tin',
    name: 'The Thank-You Tin',
    category: 'gift-boxes',
    price: 29,
    compareAt: null,
    rating: 4.8,
    reviewCount: 201,
    badge: 'Under $30',
    stock: 60,
    occasion: ['thank-you', 'birthday'],
    recipient: ['Anyone', 'Team', 'Friends'],
    theme: 'blush-bliss',
    short: 'A keepsake tin of biscuits, tea and a thank-you card — the perfect small gesture.',
    description:
      'Big thanks, small box. A reusable tin filled with shortbread, breakfast tea and a beautiful thank-you card ready for your message.',
    whatInside: [
      'Reusable keepsake tin',
      '6 buttery shortbread fingers',
      '20 breakfast-tea pyramids',
      'Blank thank-you card + envelope',
    ],
    images: placeholderImages('Thank-You Tin'),
  },
]

// --- Hamper builder catalogue -----------------------------------------------
export const hamperItems = [
  { id: 'h-choc', name: 'Cocoa Truffles', emoji: '🍫', price: 12, type: 'Sweet', description: '6 handmade truffles.' },
  { id: 'h-candle', name: 'Soy Candle', emoji: '🕯️', price: 15, type: 'Ambience', description: '8h soy candle, warm vanilla.' },
  { id: 'h-mag', name: 'Magazine', emoji: '📚', price: 10, type: 'Read', description: 'A curated indie print magazine.' },
  { id: 'h-mask', name: 'Silk Sleep Mask', emoji: '🛌', price: 14, type: 'Luxury', description: 'Blush silk, adjustable strap.' },
  { id: 'h-tea', name: 'Loose-Leaf Tea', emoji: '🍵', price: 9, type: 'Treat', description: 'Rose & chamomile tin.' },
  { id: 'h-soap', name: 'Botanical Soap', emoji: '🧼', price: 8, type: 'Care', description: 'Cold-pressed flower soap.' },
  { id: 'h-bisc', name: 'Shortbread Tin', emoji: '🍪', price: 11, type: 'Sweet', description: '6 buttery shortbread fingers.' },
  { id: 'h-note', name: 'Keepsake Card', emoji: '💌', price: 5, type: 'Finishing', description: 'Frameable, hand-embossed card.' },
  { id: 'h-puzzle', name: 'Mini Puzzle', emoji: '🧩', price: 13, type: 'Play', description: '250-piece illustrated mini.' },
  { id: 'h-bath', name: 'Bath Salts', emoji: '🛁', price: 12, type: 'Care', description: 'Botanical soak, 300g.' },
  { id: 'h-plush', name: 'Plush Teddy', emoji: '🧸', price: 18, type: 'Play', description: '8" huggable soft bear.' },
  { id: 'h-photo', name: 'Polaroid Frame', emoji: '🖼️', price: 16, type: 'Luxury', description: 'Brass-toned frame, 2 photos.' },
]

export const hamperBaskets = [
  { id: 'basket-wicker', name: 'Wicker Basket', emoji: '🧺', price: 15 },
  { id: 'basket-box', name: 'Keepsake Box', emoji: '📦', price: 12 },
  { id: 'basket-crate', name: 'Wooden Crate', emoji: '🪵', price: 14 },
]

export function getProduct(slug) {
  return products.find((p) => p.slug === slug)
}

export function getCategory(slug) {
  return categories.find((c) => c.slug === slug)
}

export function getOccasion(slug) {
  return occasions.find((o) => o.slug === slug)
}

export function getTheme(slug) {
  return themes.find((t) => t.slug === slug)
}

export function getBestsellers(limit = 8) {
  return bestsellersFrom(products, limit)
}

// Same logic as getBestsellers, but takes an explicit list (e.g. the live
// Supabase catalogue from useProducts store).
export function bestsellersFrom(list, limit = 8) {
  const sorted = [...list].sort(
    (a, b) => b.reviewCount * b.rating - a.reviewCount * a.rating
  )
  return sorted.slice(0, limit)
}

export function relatedProducts(product, limit = 4) {
  return relatedFrom(products, product, limit)
}

export function relatedFrom(list, product, limit = 4) {
  return list
    .filter((p) => p.id !== product.id)
    .map((p) => {
      const score =
        (p.category === product.category ? 2 : 0) +
        (p.occasion.some((o) => product.occasion.includes(o)) ? 1.5 : 0) +
        (p.theme === product.theme ? 1 : 0)
      return { p, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => p)
}
