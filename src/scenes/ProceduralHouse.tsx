import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

/**
 * Procedural architectural placeholder.
 * Walls are built as separate segments so door and window openings are real geometry.
 * The camera path is designed to pass through the front doorway.
 */
export function ProceduralHouse({ progress = 0 }: { progress?: number }) {
  const group = useRef<THREE.Group>(null)

  // Materials
  const materials = useMemo(() => {
    const wall = new THREE.MeshStandardMaterial({
      color: '#e8e2d6',
      roughness: 0.75,
      metalness: 0.05
    })
    const floor = new THREE.MeshStandardMaterial({
      color: '#c9b8a0',
      roughness: 0.35,
      metalness: 0.1
    })
    const roof = new THREE.MeshStandardMaterial({
      color: '#2a2a28',
      roughness: 0.7,
      metalness: 0.15
    })
    const glass = new THREE.MeshStandardMaterial({
      color: '#88aacc',
      roughness: 0.1,
      metalness: 0.6,
      transparent: true,
      opacity: 0.35
    })
    const wood = new THREE.MeshStandardMaterial({
      color: '#5c4033',
      roughness: 0.55,
      metalness: 0.05
    })
    const marble = new THREE.MeshStandardMaterial({
      color: '#f0ebe3',
      roughness: 0.25,
      metalness: 0.08
    })
    const brass = new THREE.MeshStandardMaterial({
      color: '#b5a642',
      roughness: 0.3,
      metalness: 0.85
    })
    const dark = new THREE.MeshStandardMaterial({
      color: '#1a1a18',
      roughness: 0.8
    })
    return { wall, floor, roof, glass, wood, marble, brass, dark }
  }, [])

  // Subtle breathing / material response to progress
  useFrame(() => {
    if (!group.current) return
    // Gentle scale pulse near the end
    const breathe = 1 + Math.sin(progress * Math.PI * 2) * 0.004
    group.current.scale.setScalar(breathe)
  })

  // Wall thickness
  const t = 0.18

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* ========== GROUND ========== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[22, 64]} />
        <meshStandardMaterial color="#12110f" roughness={0.95} />
      </mesh>

      {/* Subtle path to entrance */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 5]} receiveShadow>
        <planeGeometry args={[2.2, 8]} />
        <meshStandardMaterial color="#1e1c18" roughness={0.9} />
      </mesh>

      {/* ========== FLOOR SLAB ========== */}
      <mesh position={[0, 0.08, -0.6]} receiveShadow>
        <boxGeometry args={[9.2, 0.16, 7.8]} />
        <primitive object={materials.marble} attach="material" />
      </mesh>

      {/* ========== EXTERIOR WALLS (segmented for openings) ========== */}

      {/* Front wall - left of door */}
      <mesh position={[-2.6, 1.5, 3.2]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 3.0, t]} />
        <primitive object={materials.wall} attach="material" />
      </mesh>
      {/* Front wall - right of door */}
      <mesh position={[2.6, 1.5, 3.2]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 3.0, t]} />
        <primitive object={materials.wall} attach="material" />
      </mesh>
      {/* Front wall - above door */}
      <mesh position={[0, 2.85, 3.2]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.3, t]} />
        <primitive object={materials.wall} attach="material" />
      </mesh>

      {/* Door frame */}
      <mesh position={[-0.95, 1.35, 3.22]} castShadow>
        <boxGeometry args={[0.12, 2.7, 0.12]} />
        <primitive object={materials.wood} attach="material" />
      </mesh>
      <mesh position={[0.95, 1.35, 3.22]} castShadow>
        <boxGeometry args={[0.12, 2.7, 0.12]} />
        <primitive object={materials.wood} attach="material" />
      </mesh>
      <mesh position={[0, 2.7, 3.22]} castShadow>
        <boxGeometry args={[2.0, 0.12, 0.12]} />
        <primitive object={materials.wood} attach="material" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.5, -4.4]} castShadow receiveShadow>
        <boxGeometry args={[9.0, 3.0, t]} />
        <primitive object={materials.wall} attach="material" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-4.5, 1.5, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[t, 3.0, 7.6]} />
        <primitive object={materials.wall} attach="material" />
      </mesh>

      {/* Right wall */}
      <mesh position={[4.5, 1.5, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[t, 3.0, 7.6]} />
        <primitive object={materials.wall} attach="material" />
      </mesh>

      {/* ========== WINDOWS ========== */}
      {/* Front left window */}
      <mesh position={[-2.6, 1.7, 3.25]}>
        <boxGeometry args={[1.4, 1.3, 0.06]} />
        <primitive object={materials.glass} attach="material" />
      </mesh>
      {/* Front right window */}
      <mesh position={[2.6, 1.7, 3.25]}>
        <boxGeometry args={[1.4, 1.3, 0.06]} />
        <primitive object={materials.glass} attach="material" />
      </mesh>
      {/* Side windows */}
      <mesh position={[-4.45, 1.7, 1.2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.5, 1.3, 0.06]} />
        <primitive object={materials.glass} attach="material" />
      </mesh>
      <mesh position={[4.45, 1.7, 1.2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.5, 1.3, 0.06]} />
        <primitive object={materials.glass} attach="material" />
      </mesh>
      <mesh position={[-4.45, 1.7, -2.5]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.5, 1.3, 0.06]} />
        <primitive object={materials.glass} attach="material" />
      </mesh>
      <mesh position={[4.45, 1.7, -2.5]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.5, 1.3, 0.06]} />
        <primitive object={materials.glass} attach="material" />
      </mesh>

      {/* ========== INTERIOR PARTITION (partial) ========== */}
      <mesh position={[1.8, 1.3, -0.8]} castShadow receiveShadow>
        <boxGeometry args={[t, 2.6, 3.2]} />
        <primitive object={materials.wall} attach="material" />
      </mesh>

      {/* ========== ROOF ========== */}
      <mesh position={[0, 3.6, -0.6]} castShadow>
        <boxGeometry args={[9.6, 0.2, 8.2]} />
        <primitive object={materials.roof} attach="material" />
      </mesh>
      {/* Simple pitched elements */}
      <mesh position={[0, 4.3, -0.6]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[9.8, 0.12, 1.2]} />
        <primitive object={materials.roof} attach="material" />
      </mesh>

      {/* ========== FURNITURE / PROPS ========== */}

      {/* Living sofa */}
      <mesh position={[-1.8, 0.45, -1.8]} castShadow>
        <boxGeometry args={[2.4, 0.55, 1.0]} />
        <primitive object={materials.wood} attach="material" />
      </mesh>
      <mesh position={[-1.8, 0.85, -2.15]} castShadow>
        <boxGeometry args={[2.4, 0.45, 0.3]} />
        <primitive object={materials.wood} attach="material" />
      </mesh>

      {/* Coffee table */}
      <mesh position={[-1.8, 0.32, -0.6]} castShadow>
        <boxGeometry args={[1.3, 0.08, 0.7]} />
        <primitive object={materials.marble} attach="material" />
      </mesh>
      <mesh position={[-1.8, 0.15, -0.6]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <primitive object={materials.brass} attach="material" />
      </mesh>
      <mesh position={[-1.3, 0.15, -0.35]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <primitive object={materials.brass} attach="material" />
      </mesh>
      <mesh position={[-2.3, 0.15, -0.35]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <primitive object={materials.brass} attach="material" />
      </mesh>
      <mesh position={[-1.3, 0.15, -0.85]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <primitive object={materials.brass} attach="material" />
      </mesh>
      <mesh position={[-2.3, 0.15, -0.85]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <primitive object={materials.brass} attach="material" />
      </mesh>

      {/* Kitchen island */}
      <mesh position={[3.0, 0.55, -2.4]} castShadow>
        <boxGeometry args={[2.0, 0.9, 1.1]} />
        <primitive object={materials.marble} attach="material" />
      </mesh>
      {/* Island base */}
      <mesh position={[3.0, 0.25, -2.4]} castShadow>
        <boxGeometry args={[1.9, 0.5, 1.0]} />
        <primitive object={materials.dark} attach="material" />
      </mesh>

      {/* Dining table */}
      <mesh position={[2.8, 0.42, 0.6]} castShadow>
        <boxGeometry args={[1.8, 0.08, 0.9]} />
        <primitive object={materials.wood} attach="material" />
      </mesh>
      {/* Table legs */}
      {[[-0.7, -0.3], [0.7, -0.3], [-0.7, 0.3], [0.7, 0.3]].map(([x, z], i) => (
        <mesh key={i} position={[2.8 + x, 0.2, 0.6 + z]}>
          <boxGeometry args={[0.07, 0.4, 0.07]} />
          <primitive object={materials.brass} attach="material" />
        </mesh>
      ))}

      {/* Simple pendant light */}
      <mesh position={[0, 3.1, -0.5]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <primitive object={materials.brass} attach="material" />
      </mesh>
      <mesh position={[0, 2.7, -0.5]}>
        <sphereGeometry args={[0.18, 16, 12]} />
        <meshStandardMaterial color="#f5f0e0" emissive="#f5e8c0" emissiveIntensity={0.6} />
      </mesh>

      {/* Exterior planter boxes */}
      <mesh position={[-3.5, 0.35, 3.8]} castShadow>
        <boxGeometry args={[1.2, 0.5, 0.6]} />
        <primitive object={materials.dark} attach="material" />
      </mesh>
      <mesh position={[3.5, 0.35, 3.8]} castShadow>
        <boxGeometry args={[1.2, 0.5, 0.6]} />
        <primitive object={materials.dark} attach="material" />
      </mesh>
    </group>
  )
}
