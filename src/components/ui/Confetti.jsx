import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Lightweight DOM confetti burst — fired on "Add to Cart" / checkout success.
// No WebGL needed, safe on all devices.
const COLORS = ['#D9AC5C', '#F6CED3', '#C04558', '#E8C57E', '#FAF0DE', '#641F2C']

function Piece({ color, delay, onDone }) {
  const [x] = useState(() => (Math.random() - 0.5) * 280)
  const [endY] = useState(() => 200 + Math.random() * 260)
  const [rotate] = useState(() => (Math.random() - 0.5) * 720)
  return (
    <motion.span
      className="pointer-events-none absolute top-1/2 left-1/2 block h-2.5 w-1.5 rounded-[2px]"
      style={{ backgroundColor: color }}
      initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
      animate={{ x, y: endY, rotate, opacity: 0 }}
      transition={{ duration: 1.1 + Math.random() * 0.5, ease: 'easeOut' }}
      onAnimationComplete={onDone}
    />
  )
}

export default function ConfettiBurst({ trigger, count = 40 }) {
  const [burstId, setBurstId] = useState(null)
  const [done, setDone] = useState(false)

  // Re-fire whenever trigger flips to true
  const [prev, setPrev] = useState(trigger)
  if (trigger && trigger !== prev) {
    setPrev(trigger)
    setDone(false)
    setBurstId(Date.now())
  }

  return (
    <AnimatePresence>
      {!done && burstId !== null && (
        <div key={burstId} className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
          {Array.from({ length: count }).map((_, i) => (
            <Piece
              key={i}
              color={COLORS[i % COLORS.length]}
              delay={0}
              onDone={() => {}}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
