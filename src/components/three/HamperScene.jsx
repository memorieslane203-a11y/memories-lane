import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useHamper } from '../../store/hamperStore'

// Map each hamper catalogue item to a distinct 3D token colour so the basket
// visually "fills up" as items are added.
const ITEM_TOKENS = {
  'h-choc': { color: '#7A5230' },
  'h-candle': { color: '#F2D9A4' },
  'h-mag': { color: '#C04558' },
  'h-mask': { color: '#F6CED3' },
  'h-tea': { color: '#BFD8B8' },
  'h-soap': { color: '#E8C57E' },
  'h-bisc': { color: '#D98E48' },
  'h-note': { color: '#FAF0DE' },
  'h-puzzle': { color: '#BFD3E8' },
  'h-bath': { color: '#9FB8D9' },
  'h-plush': { color: '#D96072' },
  'h-photo': { color: '#C09041' },
}

function Basket() {
  const fillRef = useRef()
  const { items } = useHamper()
  const totalQty = items.reduce((s, i) => s + i.qty, 0)
  const maxVisible = 12
  const fill = Math.min(1, totalQty / maxVisible)

  useFrame(() => {
    const m = fillRef.current
    if (!m) return
    const target = 0.16 + fill * 0.6
    m.position.y = THREE.MathUtils.lerp(m.position.y, target, 0.09)
    m.scale.y = THREE.MathUtils.lerp(m.scale.y, 0.08 + fill * 0.95, 0.09)
  })

  return (
    <group>
      {/* Rim */}
      <mesh position={[0, 0.85, 0]}>
        <torusGeometry args={[0.95, 0.07, 16, 48]} />
        <meshStandardMaterial color="#C09041" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Woven basket body */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.92, 0.62, 0.85, 40, 1, true]} />
        <meshStandardMaterial color="#8B5A2B" roughness={0.8} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* Weave bands */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 0.16 + i * 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8 - i * 0.04, 0.018, 8, 40]} />
          <meshStandardMaterial color="#C09041" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      {/* Fill glow rising inside the basket */}
      <mesh ref={fillRef} position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.78, 0.78, 1, 32, 1, true]} />
        <meshStandardMaterial
          color="#F2D9A4"
          roughness={0.5}
          metalness={0.1}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 1.25, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.55, 0.035, 12, 48, Math.PI]} />
        <meshStandardMaterial color="#C09041" roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  )
}

// Coloured tokens representing the chosen items, arranged in layered rows
// inside the basket. Includes a "drop-in" settle animation.
function TokenMeshes() {
  const { items } = useHamper()
  const tokens = []
  let row = 0
  let col = 0
  items.forEach((item) => {
    const cfg = ITEM_TOKENS[item.id] ?? { color: '#E8C57E' }
    for (let k = 0; k < item.qty; k++) {
      const spacing = 0.42
      const x = (col % 3) * spacing - 0.42
      const z = Math.floor(col / 3) * spacing - 0.42
      tokens.push({
        id: `${item.id}-${k}`,
        color: cfg.color,
        x: x + (Math.random() - 0.5) * 0.05,
        y: 0.18 + row * 0.3 + (Math.random() - 0.5) * 0.04,
        z: z + (Math.random() - 0.5) * 0.05,
        rotY: k * 1.2 + Math.random(),
      })
      col += 1
      if (col >= 6) {
        col = 0
        row += 1
      }
    }
  })

  return (
    <group>
      {tokens.map((t) => (
        <group key={t.id} position={[t.x, t.y, t.z]} rotation={[0, t.rotY, 0]}>
          <mesh>
            <boxGeometry args={[0.2, 0.14, 0.16]} />
            <meshStandardMaterial color={t.color} roughness={0.45} metalness={0.15} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default function HamperScene({ className }) {
  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas dpr={[1, 1.6]} camera={{ position: [0, 1.9, 4.4], fov: 42 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 3]} intensity={1.2} castShadow />
        <pointLight position={[-3, 2, -3]} intensity={0.4} color="#E8C57E" />
        <Basket />
        <TokenMeshes />
        <Sparkles count={14} scale={[2.2, 1.4, 2.2]} position={[0, 0.8, 0]} size={2.5} speed={0.35} color="#E8C57E" />
        <ContactShadows position={[0, -0.02, 0]} opacity={0.4} scale={5} blur={2.2} far={3} color="#7A2736" />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={1.6}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none select-none">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-2 text-xs font-bold text-maroon-700 shadow-soft">
          🧺 Drag to inspect · Add items to watch it fill
        </span>
      </div>
    </div>
  )
}
