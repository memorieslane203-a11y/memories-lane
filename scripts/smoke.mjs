// Runtime smoke test: renders every page in "3D fallback" (low-end device)
// mode using jsdom, catching runtime errors a build can't.
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})

globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
  writable: true,
})
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.SVGElement = dom.window.SVGElement
globalThis.Node = dom.window.Node
globalThis.Element = dom.window.Element
globalThis.Document = dom.window.Document
globalThis.Event = dom.window.Event
globalThis.MouseEvent = dom.window.MouseEvent
globalThis.CustomEvent = dom.window.CustomEvent
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window)
globalThis.scrollTo = () => {}
dom.window.scrollTo = () => {}
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
globalThis.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
globalThis.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}
globalThis.AbortController = dom.window.AbortController
globalThis.AbortSignal = dom.window.AbortSignal

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })

const cases = [
  ['/src/pages/Home.jsx', 'Home'],
  ['/src/pages/Shop.jsx', 'Shop'],
  ['/src/pages/Shop.jsx', 'Shop (gift-boxes)', ['/shop/gift-boxes']],
  ['/src/pages/ProductDetail.jsx', 'ProductDetail', ['/product/blush-bliss-box']],
  ['/src/pages/ProductDetail.jsx', 'ProductDetail (magazine)', ['/product/kinfolk-edition']],
  ['/src/pages/BuildHamper.jsx', 'BuildHamper'],
  ['/src/pages/Occasions.jsx', 'Occasions', ['/occasions/birthday']],
  ['/src/pages/Cart.jsx', 'Cart'],
  ['/src/pages/Checkout.jsx', 'Checkout'],
  ['/src/pages/Account.jsx', 'Account (wishlist)', ['/account?tab=wishlist']],
  ['/src/pages/About.jsx', 'About'],
  ['/src/pages/Contact.jsx', 'Contact'],
  ['/src/pages/Faq.jsx', 'Faq'],
  ['/src/pages/TrackOrder.jsx', 'TrackOrder'],
  ['/src/pages/NotFound.jsx', 'NotFound'],
  ['/src/pages/Admin.jsx', 'Admin (no supabase keys)'],
]

let failures = 0
for (const [modPath, name, entries = ['/']] of cases) {
  try {
    const mod = await vite.ssrLoadModule(modPath)
    const Page = mod.default
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(
        React.createElement(MemoryRouter, { initialEntries: entries },
          React.createElement(Page)
        )
      )
      await new Promise((r) => setTimeout(r, 120))
    })
    if (!container.innerHTML || container.innerHTML.trim() === '') {
      throw new Error('nothing rendered')
    }
    await act(async () => root.unmount())
    document.body.removeChild(container)
    console.log(`PASS  ${name}`)
  } catch (e) {
    failures += 1
    console.log(`FAIL  ${name}  →  ${(e.stack || e.message).split('\n').slice(0, 2).join(' | ')}`)
  }
}

await vite.close()
console.log(failures === 0 ? '\nALL PASSED' : `\n${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
