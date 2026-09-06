import { useMemo } from 'react'
import { useTheme, selectPreset } from '../../store/themeStore'

// Gentle falling-emoji shower while a festive theme is active.
// Pure CSS animation, pointer-events off, hidden for reduced-motion users.
export default function FestiveFall({ count = 18 }) {
  const settings = useTheme((s) => s.settings)
  const preset = selectPreset(settings)

  const pieces = useMemo(() => {
    if (!preset.fall) return []
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      emoji: preset.fall[i % preset.fall.length],
      left: `${(i * 97) % 100}%`,
      size: `${16 + ((i * 13) % 18)}px`,
      duration: `${7 + ((i * 37) % 60) / 10}s`,
      delay: `${-((i * 53) % 80) / 10}s`,
      sway: `${(i * 29) % 40 - 20}px`,
    }))
  }, [preset, count])

  if (!preset.fall) return null

  return (
    <div aria-hidden className="festive-fall pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="festive-flake absolute -top-8"
          style={{
            left: p.left,
            fontSize: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
            '--sway': p.sway,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}
