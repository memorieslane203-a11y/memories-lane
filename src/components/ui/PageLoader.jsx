import { motion } from 'framer-motion'

export default function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <motion.div
          className="mx-auto mb-4 text-5xl"
          animate={{ rotate: [0, 10, -10, 0], y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          🎁
        </motion.div>
        <p className="font-script text-2xl text-gold-600">Wrapping something lovely…</p>
      </div>
    </div>
  )
}
