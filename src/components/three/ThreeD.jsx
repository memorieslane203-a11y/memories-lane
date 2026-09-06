import { useEffect, useState } from 'react'

// ============================================================================
// Detects whether the device is capable of (and should) run WebGL scenes.
// On low-end / touch / reduced-motion devices we fall back to static or
// lightweight CSS-animated visuals — see <ThreeD>.
// ============================================================================

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    )
  } catch {
    return false
  }
}

function getLowEnd() {
  if (typeof navigator === 'undefined') return true
  const memory = navigator.deviceMemory || 8
  const cores = navigator.hardwareConcurrency || 8
  // Coarse pointer + low specs + small screen → low-end mobile
  const coarse = window.matchMedia?.('(pointer: coarse)').matches
  const small = window.matchMedia?.('(max-width: 767px)').matches
  return memory <= 2 && cores <= 4 && coarse && small
}

export function use3DCapable() {
  const [capable, setCapable] = useState(false)
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    setCapable(supportsWebGL() && !reduced && !getLowEnd())
  }, [])
  return capable
}

// Wrapper: renders WebGL children when capable, otherwise the fallback.
export default function ThreeD({ children, fallback }) {
  const capable = use3DCapable()
  return capable ? children : (fallback ?? null)
}
