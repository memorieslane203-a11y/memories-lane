import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from '../../store/uiStore'

const tones = {
  success: { ring: 'border-gold-400', bg: 'bg-maroon-700', icon: '✅' },
  info: { ring: 'border-blush-300', bg: 'bg-maroon-800', icon: '💬' },
  error: { ring: 'border-red-400', bg: 'bg-red-700', icon: '⚠️' },
}

export default function Toasts() {
  const toasts = useUI((s) => s.toasts)
  const dismiss = useUI((s) => s.dismissToast)
  return (
    <div className="pointer-events-none fixed top-4 left-1/2 -translate-x-1/2 z-[95] flex w-full max-w-sm flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const tone = tones[t.tone] ?? tones.success
          return (
            <motion.button
              key={t.id}
              onClick={() => dismiss(t.id)}
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-3 rounded-full border ${tone.ring} ${tone.bg} text-cream-100 px-5 py-3 text-sm font-bold shadow-lift`}
            >
              <span>{tone.icon}</span>
              <span>{t.message}</span>
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
