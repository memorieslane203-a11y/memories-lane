import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, RoundedBox, Sparkles, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

const GOLD = '#D9AC5C'
const MAROON = '#641F2C'
const BLUSH = '#F6CED3'
const CONFETTI_COLORS = ['#D9AC5C', '#F6CED3', '#C04558', '#E8C57E', '#FAF0DE', '#6E2D3A']

// ---------------------------------------------------------------------------
// Confetti burst — instanced boxes that explode upward from the box lip.
// ---------------------------------------------------------------------------
function Confetti({ burstKey, count = 110 }) {
  const ref = useRef()
  const data = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const speed = 2.4 + Math.random() * 3.2
      return {
        pos: new THREE.Vector3(
          Math.cos(angle) * (Math.random() - 0.5) * 0.4,
          0.55 + Math.random() * 0.25,
          Math.sin(angle) * (Math.random() - 0.5) * 0.4
        ),
        vel: new THREE.Vector3(
          Math.cos(angle) * speed * (0.4 + Math.random() * 0.8),
          3.2 + Math.random() * 3.6,
          Math.sin(angle) * speed * (0.4 + Math.random() * 0.8)
        ),
        rot: new THREE.Vector3(Math.random() * 3, Math.random() * 3, Math.random() * 3),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12
        ),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        life: 0,
      }
    })
  }, [count])

  const [bursting, setBursting] = useState(false)
  useEffect(() => {
    if (burstKey > 0) {
      setBursting(true)
      const t = setTimeout(() => setBursting(false), 6000)
      return () => clearTimeout(t)
    }
  }, [burstKey])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh) return
    const dt = Math.min(delta, 0.05)
    data.forEach((p, i) => {
      if (bursting) {
        p.life += dt
        p.vel.y -= 6.5 * dt
        p.pos.addScaledVector(p.vel, dt)
        if (p.pos.y < -0.4) {
          p.pos.set(0, 0.6, 0)
          p.vel.set((Math.random() - 0.5) * 3, 4 + Math.random() * 3, (Math.random() - 0.5) * 3)
          p.life = 0
        }
        p.rot.addScaledVector(p.rotVel, dt)
      } else {
        p.pos.set(0, -2, 0) // hide when idle
      }
      dummy.position.copy(p.pos)
      dummy.rotation.set(p.rot.x, p.rot.y, p.rot.z)
      dummy.scale.setScalar(p.life > 0 ? 1 : 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, new THREE.Color(p.color))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[0.06, 0.09, 0.02]} />
      <meshStandardMaterial roughness={0.6} metalness={0.1} />
    </instancedMesh>
  )
}

// ---------------------------------------------------------------------------
// The gift box: base + cross ribbon + lid that pops open on click.
// ---------------------------------------------------------------------------
function GiftBox({ open, onToggle }) {
  const lidRef = useRef()
  const ribbonRef = useRef()
  const [hasOpened, setHasOpened] = useState(false)

  useEffect(() => {
    if (open) setHasOpened(true)
  }, [open])

  useFrame((state) => {
    // Lid pop: quick spring-ish rise + slight rotation
    const t = state.clock.elapsedTime
    const lid = lidRef.current
    if (lid) {
      const targetY = open ? 1.05 : 0.92
      const current = lid.position.y
      lid.position.y = THREE.MathUtils.lerp(current, targetY, 0.12)
      if (open) {
        lid.position.x = Math.sin(t * 3) * 0.03
        lid.rotation.z = Math.sin(t * 2.4) * 0.06
      } else {
        lid.rotation.z = THREE.MathUtils.lerp(lid.rotation.z, 0, 0.1)
      }
    }
    // Gold ribbon streams that "untie" when open
    const rib = ribbonRef.current
    if (rib) {
      const target = open ? 1.15 : 0.01
      rib.position.y = THREE.MathUtils.lerp(rib.position.y, target, 0.1)
      rib.rotation.z += 0.02
    }
  })

  return (
    <group onClick={(e) => { e.stopPropagation(); onToggle() }}>
      {/* Base */}
      <RoundedBox args={[1.4, 0.85, 1.4]} radius={0.07} smoothness={4} position={[0, 0.42, 0]}>
        <meshStandardMaterial color={MAROON} roughness={0.35} metalness={0.15} />
      </RoundedBox>
      {/* Ribbon cross on base */}
      <RoundedBox args={[0.22, 0.86, 1.42]} radius={0.04} position={[0, 0.43, 0]}>
        <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.4} />
      </RoundedBox>
      <RoundedBox args={[1.42, 0.86, 0.22]} radius={0.04} position={[0, 0.43, 0]}>
        <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.4} />
      </RoundedBox>

      {/* Untying ribbon streamers */}
      <group ref={ribbonRef} position={[0, 0.01, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0.72, 0.05, 0]} rotation={[0, (Math.PI / 2) * i, 0]}>
            <boxGeometry args={[0.09, 0.6, 0.02]} />
            <meshStandardMaterial color={GOLD} roughness={0.35} metalness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Lid */}
      <group ref={lidRef} position={[0, 0.92, 0]}>
        <RoundedBox args={[1.52, 0.26, 1.52]} radius={0.06} smoothness={4}>
          <meshStandardMaterial color={BLUSH} roughness={0.5} metalness={0.1} />
        </RoundedBox>
        <RoundedBox args={[0.2, 0.28, 1.54]} radius={0.04}>
          <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.4} />
        </RoundedBox>
        <RoundedBox args={[1.54, 0.28, 0.2]} radius={0.04}>
          <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.4} />
        </RoundedBox>
        {/* Bow */}
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.5} />
        </mesh>
        {[0, 1].map((i) => (
          <mesh key={i} position={[i === 0 ? -0.22 : 0.22, 0.16, 0]} rotation={[0, 0, i === 0 ? -0.5 : 0.5]}>
            <boxGeometry args={[0.3, 0.1, 0.06]} />
            <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Content peeking out when lid lifts */}
      <mesh position={[0, 0.62, 0]} visible={hasOpened}>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshStandardMaterial color="#F2D9A4" roughness={0.4} metalness={0.2} />
      </mesh>

      <Sparkles count={18} scale={[1.6, 1.2, 1.6]} position={[0, 0.5, 0]} size={2.5} speed={0.4} color="#E8C57E" />
    </group>
  )
}

// ---------------------------------------------------------------------------
// Full hero scene
// ---------------------------------------------------------------------------
export default function GiftBox3D({ className }) {
  const [open, setOpen] = useState(false)
  const [burstKey, setBurstKey] = useState(0)

  const handleToggle = () => {
    setOpen((o) => {
      if (!o) setBurstKey((k) => k + 1)
      return !o
    })
  }

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 1.6, 4.6], fov: 45 }} shadows>
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 3]} intensity={1.4} castShadow />
        <pointLight position={[-3, 2, -3]} intensity={0.5} color="#E8C57E" />
        <group>
          <GiftBox open={open} onToggle={handleToggle} />
        </group>
        <Confetti burstKey={burstKey} />
        <ContactShadows position={[0, -0.02, 0]} opacity={0.4} scale={6} blur={2.4} far={3} color="#7A2736" />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={!open}
          autoRotateSpeed={2.2}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 1.9}
        />
      </Canvas>
      {/* Hint pill */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none select-none">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-2 text-xs font-bold text-maroon-700 shadow-soft">
          {open ? '🎉 Surprise!' : '🖱️ Drag to rotate · Click the box to open'}
        </span>
      </div>
    </div>
  )
}
