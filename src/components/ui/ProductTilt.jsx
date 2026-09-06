import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

// Subtle 3D tilt-on-hover card wrapper with soft shadow depth.
// Pure CSS 3D (perspective + rotateX/rotateY) — works on all devices,
// no WebGL required.
export default function ProductTilt({ children, className = '', max = 10 }) {
  const ref = useRef(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 200, damping: 20 })

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }

  const reset = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 900 }}
      whileHover={{ boxShadow: '0 28px 60px -20px rgba(122, 39, 54, 0.4)' }}
    >
      {children}
    </motion.div>
  )
}
