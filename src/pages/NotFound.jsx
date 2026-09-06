import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="py-24 container-px text-center">
      <p className="text-7xl mb-4 animate-float">🎀</p>
      <span className="script-accent text-3xl block">Oops — this ribbon came loose</span>
      <h1 className="mt-1 font-serif text-5xl sm:text-6xl text-maroon-800">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md text-ink/70">
        This page has been wrapped and shipped somewhere else. Let’s get you back to the good stuff.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">Back to home</Link>
        <Link to="/shop" className="btn-outline">Shop gifts</Link>
      </div>
    </section>
  )
}
