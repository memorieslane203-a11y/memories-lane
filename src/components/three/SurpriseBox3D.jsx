import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

// "Surprise Me" box — spins on demand then settles, lid flips open to reveal a
// glow. The revealed bundle suggestion is rendered in DOM above the canvas.
function SurpriseBox({ spinKey, open }) {
  const boxRef = useRef()
  const lidRef = useRef()
  const spinTarget = useRef(0)
  const spinSpeed = useRef(0)

  useEffect(() => {
    if (spinKey) {
      spinTarget.current = spinTarget.current + Math.PI * 3 + Math.random() * Math.PI * 2
      spinSpeed.current = 14
    }
  }, [spinKey])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    if (spinSpeed.current > 0) {
      boxRef.current.rotation.y += spinSpeed.current * dt
      boxRef.current.rotation.x += spinSpeed.current * 0.15 * dt
      spinSpeed.current *= 0.94
      if (spinSpeed.current < 0.08) {
        spinSpeed.current = 0
        boxRef.current.rotation.y = spinTarget.current % (Math.PI * 2)
        boxRef.current.rotation.x = 0
      }
    }
    // Lid flip after spin completes
    const lid = lidRef.current
    if (lid) {
      const target = open ? -Math.PI / 2.6 : 0
      lid.rotation.x = THREE.MathUtils.lerp(lid.rotation.x, target, 0.08)
    }
    // gentle idle bob when still
    if (spinSpeed.current === 0 && !open) {
      boxRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.06
    }
  })

  return (
    <group ref={boxRef}>
      <RoundedBox args={[1.5, 1.0, 1.5]} radius={0.08} smoothness={4} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#641F2C" roughness={0.35} metalness={0.15} />
      </RoundedBox>
      <RoundedBox args={[0.24, 1.02, 1.52]} radius={0.04} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#D9AC5C" roughness={0.3} metalness={0.4} />
      </RoundedBox>
      <RoundedBox args={[1.52, 1.02, 0.24]} radius={0.04} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#D9AC5C" roughness={0.3} metalness={0.4} />
      </RoundedBox>
      <group ref={lidRef} position={[0, 1.05, 0]}>
        <RoundedBox args={[1.62, 0.26, 1.62]} radius={0.06} smoothness={4}>
          <meshStandardMaterial color="#F6CED3" roughness={0.5} metalness={0.1} />
        </RoundedBox>
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#D9AC5C" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>
      <pointLight position={[0, 1.8, 0]} intensity={open ? 2.2 : 0.4} color="#E8C57E" />
      <Sparkles count={open ? 40 : 12} scale={[2, 2, 2]} position={[0, 0.6, 0]} size={2.6} speed={0.5} color="#E8C57E" />
    </group>
  )
}

export default function SurpriseBox3D({ spinKey, open, className }) {
  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas dpr={[1, 1.6]} camera={{ position: [0, 1.4, 4.2], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 6, 3]} intensity={1.3} />
        <pointLight position={[-3, 2, -3]} intensity={0.5} color="#E8C57E" />
        <SurpriseBox spinKey={spinKey} open={open} />
      </Canvas>
    </div>
  )
}
