export default function SectionHeading({ eyebrow, title, sub, center = true, dark = false }) {
  return (
    <div className={`mb-10 ${center ? 'text-center' : 'text-left'}`}>
      {eyebrow && <span className="script-accent block mb-1">{eyebrow}</span>}
      <h2 className={`text-balance ${dark ? 'font-serif text-3xl sm:text-4xl lg:text-5xl text-cream-100 mb-3 festive-dark-text' : 'section-title'}`}>{title}</h2>
      {sub && <p className={dark ? 'text-cream-100/85 max-w-2xl mx-auto text-lg festive-dark-text' : 'section-sub'}>{sub}</p>}
    </div>
  )
}
