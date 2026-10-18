import { useEffect, useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { imagePointToWorld } from '../config/officeLayout'

function point(x: number, y: number, height = 0): [number, number, number] {
  const [worldX, worldZ] = imagePointToWorld([x, y])
  return [worldX, height, worldZ]
}

function createSurfaceMaterials() {
  const canvasTexture = (draw: (context: CanvasRenderingContext2D, size: number) => void, repeat: [number, number]) => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1024
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Unable to create architectural material texture.')
    draw(context, canvas.width)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(...repeat)
    texture.anisotropy = 8
    return texture
  }

  const marble = canvasTexture((context, size) => {
    context.fillStyle = '#e6dfd3'
    context.fillRect(0, 0, size, size)
    let seed = 16
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }
    for (let index = 0; index < 22000; index += 1) {
      const shade = 190 + Math.floor(random() * 53)
      context.fillStyle = `rgba(${shade},${shade - 3},${shade - 11},${random() * 0.12})`
      context.fillRect(random() * size, random() * size, 1 + random() * 2, 1 + random() * 2)
    }
    for (let vein = 0; vein < 22; vein += 1) {
      const startX = random() * size
      const startY = random() * size
      const drift = (random() - 0.5) * 360
      context.beginPath()
      context.moveTo(startX, startY)
      context.bezierCurveTo(startX + drift, startY + 210, startX - drift * 0.4, startY + 480, startX + drift * 0.65, startY + size)
      context.strokeStyle = vein % 4 === 0 ? 'rgba(153,137,116,0.19)' : 'rgba(255,252,244,0.42)'
      context.lineWidth = vein % 4 === 0 ? 2.2 : 1.2
      context.stroke()
    }
  }, [2, 2])
  const walnut = canvasTexture((context, size) => {
    context.fillStyle = '#493326'
    context.fillRect(0, 0, size, size)
    let seed = 71
    const random = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed / 2147483648
    }
    for (let index = 0; index < 1200; index += 1) {
      const x = random() * size
      const width = 1 + random() * 5
      context.beginPath()
      context.moveTo(x, 0)
      context.bezierCurveTo(x + random() * 28 - 14, size * 0.32, x + random() * 34 - 17, size * 0.7, x + random() * 22 - 11, size)
      context.strokeStyle = `rgba(${random() > 0.55 ? '181,132,83' : '21,13,9'},${0.04 + random() * 0.16})`
      context.lineWidth = width
      context.stroke()
    }
  }, [2, 1])
  const upholstery = canvasTexture((context, size) => {
    context.fillStyle = '#958a79'
    context.fillRect(0, 0, size, size)
    for (let y = 0; y < size; y += 4) {
      context.fillStyle = 'rgba(245,238,223,0.09)'
      context.fillRect(0, y, size, 1)
    }
    for (let x = 0; x < size; x += 4) {
      context.fillStyle = 'rgba(35,30,25,0.1)'
      context.fillRect(x, 0, 1, size)
    }
  }, [2, 2])
  const plaster = canvasTexture((context, size) => {
    context.fillStyle = '#d1c7b6'
    context.fillRect(0, 0, size, size)
    let seed = 39
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }
    for (let index = 0; index < 36000; index += 1) {
      const tone = random() > 0.52 ? '255,249,237' : '91,77,60'
      context.fillStyle = `rgba(${tone},${0.015 + random() * 0.055})`
      context.beginPath()
      context.ellipse(random() * size, random() * size, 2 + random() * 9, 1 + random() * 3, random() * Math.PI, 0, Math.PI * 2)
      context.fill()
    }
  }, [3, 1])

  return {
    floor: new THREE.MeshPhysicalMaterial({
      map: marble,
      bumpMap: marble,
      bumpScale: 0.008,
      color: '#f8f4ec',
      roughness: 0.34,
      metalness: 0.015,
      clearcoat: 0.1,
      clearcoatRoughness: 0.48
    }),
    marble: new THREE.MeshPhysicalMaterial({
      map: marble,
      bumpMap: marble,
      bumpScale: 0.024,
      color: '#fffaf1',
      roughness: 0.3,
      metalness: 0.02,
      clearcoat: 0.14,
      clearcoatRoughness: 0.4
    }),
    wood: new THREE.MeshStandardMaterial({ map: walnut, bumpMap: walnut, bumpScale: 0.025, color: '#d0b092', roughness: 0.52 }),
    upholstery: new THREE.MeshStandardMaterial({ map: upholstery, bumpMap: upholstery, bumpScale: 0.012, color: '#d8cdbb', roughness: 0.88 }),
    plaster: new THREE.MeshStandardMaterial({ map: plaster, bumpMap: plaster, bumpScale: 0.022, color: '#eee1cd', roughness: 0.88 })
  }
}

let sharedSurfaceMaterials: ReturnType<typeof createSurfaceMaterials> | null = null

function getSurfaceMaterials() {
  sharedSurfaceMaterials ??= createSurfaceMaterials()
  return sharedSurfaceMaterials
}

function Block({
  position,
  size,
  color,
  metalness = 0,
  roughness = 0.66,
  opacity = 1,
  emissive = '#000000',
  emissiveIntensity = 0,
  map,
  castShadow = true,
  receiveShadow = true
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  metalness?: number
  roughness?: number
  opacity?: number
  emissive?: string
  emissiveIntensity?: number
  map?: THREE.Texture | null
  castShadow?: boolean
  receiveShadow?: boolean
}) {
  return (
    <mesh position={position} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        transparent={opacity < 1}
        opacity={opacity}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        map={map}
      />
    </mesh>
  )
}

function WallRun({
  from,
  to,
  height = 3.55,
  thickness = 0.2,
  color = '#c4b8a6',
  wood = false
}: {
  from: [number, number]
  to: [number, number]
  height?: number
  thickness?: number
  color?: string
  wood?: boolean
}) {
  const horizontal = Math.abs(from[1] - to[1]) < 0.001
  const length = Math.hypot(to[0] - from[0], to[1] - from[1])
  const centerX = (from[0] + to[0]) / 2
  const centerZ = (from[1] + to[1]) / 2
  return (
    <group>
      <Block
        position={[centerX, height / 2, centerZ]}
        size={horizontal ? [length, height, thickness] : [thickness, height, length]}
        color={color}
        roughness={wood ? 0.68 : 0.86}
        metalness={wood ? 0.03 : 0.01}
        map={wood ? getSurfaceMaterials().wood.map : getSurfaceMaterials().plaster.map}
      />
      {wood && Array.from({ length: Math.floor(length / 0.32) }, (_, index) => {
        const offset = (index - Math.floor(length / 0.32) / 2) * 0.32
        return (
          <Block
            key={index}
            position={horizontal ? [centerX + offset, height / 2, centerZ + thickness / 2 + 0.012] : [centerX + thickness / 2 + 0.012, height / 2, centerZ + offset]}
            size={horizontal ? [0.025, height - 0.12, 0.03] : [0.03, height - 0.12, 0.025]}
            color="#a97c54"
            roughness={0.6}
            map={getSurfaceMaterials().wood.map}
          />
        )
      })}
    </group>
  )
}

function GlassWall({
  from,
  to,
  height = 3.35,
  frame = '#292b2a'
}: {
  from: [number, number]
  to: [number, number]
  height?: number
  frame?: string
}) {
  const horizontal = Math.abs(from[1] - to[1]) < 0.001
  const length = Math.hypot(to[0] - from[0], to[1] - from[1])
  const centerX = (from[0] + to[0]) / 2
  const centerZ = (from[1] + to[1]) / 2
  const segments = Math.max(2, Math.floor(length / 1.35))
  return (
    <group>
      <mesh position={[centerX, height / 2, centerZ]} renderOrder={1}>
        <boxGeometry args={horizontal ? [length, height, 0.055] : [0.055, height, length]} />
        <meshPhysicalMaterial
          color="#d2dfda"
          transparent
          opacity={0.16}
          roughness={0.22}
          metalness={0}
          transmission={0.12}
          thickness={0.035}
          ior={1.46}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Block
        position={[centerX, 0.05, centerZ]}
        size={horizontal ? [length, 0.1, 0.11] : [0.11, 0.1, length]}
        color={frame}
        metalness={0.48}
        roughness={0.38}
      />
      <Block
        position={[centerX, height - 0.04, centerZ]}
        size={horizontal ? [length, 0.08, 0.12] : [0.12, 0.08, length]}
        color={frame}
        metalness={0.48}
        roughness={0.38}
      />
      {Array.from({ length: segments + 1 }, (_, index) => {
        const offset = (index / segments - 0.5) * length
        return (
          <Block
            key={index}
            position={horizontal ? [centerX + offset, height / 2, centerZ] : [centerX, height / 2, centerZ + offset]}
            size={horizontal ? [0.045, height, 0.13] : [0.13, height, 0.045]}
            color={frame}
            metalness={0.62}
            roughness={0.3}
          />
        )
      })}
      {Array.from({ length: Math.max(1, Math.floor(length / 2.6)) }, (_, index) => {
        const offset = (index + 0.5) * (length / Math.max(1, Math.floor(length / 2.6))) - length / 2
        return (
          <Block
            key={`glass-mark-${index}`}
            position={horizontal ? [centerX + offset, 1.48, centerZ + 0.035] : [centerX + 0.035, 1.48, centerZ + offset]}
            size={horizontal ? [0.42, 0.012, 0.012] : [0.012, 0.42, 0.012]}
            color="#e4d7bd"
            emissive="#e4d7bd"
            emissiveIntensity={0.12}
            castShadow={false}
          />
        )
      })}
    </group>
  )
}

function DoorLeaf({ imagePosition, vertical = false }: { imagePosition: [number, number]; vertical?: boolean }) {
  const [x, z] = imagePointToWorld(imagePosition)
  return (
    <group position={[x, 0, z]} rotation={[0, vertical ? Math.PI / 2 : -0.48, 0]}>
      <Block position={[0.58, 1.38, 0]} size={[1.16, 2.76, 0.075]} color="#503827" roughness={0.46} />
      <Block position={[0.96, 1.37, -0.052]} size={[0.022, 2.48, 0.018]} color="#c2a16e" metalness={0.78} roughness={0.24} />
      <mesh position={[1.04, 1.31, -0.09]}>
        <sphereGeometry args={[0.055, 10, 8]} />
        <meshStandardMaterial color="#d4b17a" metalness={0.84} roughness={0.2} />
      </mesh>
    </group>
  )
}

function FloorSurface({ floorMaterial }: { floorMaterial: THREE.MeshPhysicalMaterial }) {
  const floors = [
    { x: 0.3, z: -3.55, width: 23.7, depth: 9.15 },
    { x: -6.35, z: 4.5, width: 5.2, depth: 7.15 },
    { x: -0.3, z: 4.5, width: 7.0, depth: 7.15 },
    { x: 8, z: 4.5, width: 7.3, depth: 7.15 },
    { x: -10.95, z: 2.4, width: 4.4, depth: 7.25 }
  ]
  return (
    <>
      {floors.map(({ x, z, width, depth }, index) => (
        <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.045, z]}>
          <planeGeometry args={[width, depth]} />
          <primitive object={floorMaterial} attach="material" />
        </mesh>
      ))}
      <Block position={[0, -0.23, -3.55]} size={[24.5, 0.34, 9.75]} color="#343431" roughness={0.5} />
      <Block position={[-6.35, -0.23, 4.5]} size={[5.6, 0.34, 7.55]} color="#343431" roughness={0.5} />
      <Block position={[-0.3, -0.23, 4.5]} size={[7.4, 0.34, 7.55]} color="#343431" roughness={0.5} />
      <Block position={[8, -0.23, 4.5]} size={[7.7, 0.34, 7.55]} color="#343431" roughness={0.5} />
      <Block position={[-10.95, -0.23, 2.4]} size={[4.8, 0.34, 7.65]} color="#343431" roughness={0.5} />
    </>
  )
}

function Plant({ imagePosition, scale = 1 }: { imagePosition: [number, number]; scale?: number }) {
  const [x, z] = imagePointToWorld(imagePosition)
  const leafGeometry = useMemo(() => {
    const vertices: number[] = []
    const uvs: number[] = []
    const indices: number[] = []
    const rows = 12
    for (let row = 0; row <= rows; row += 1) {
      const t = row / rows
      const halfWidth = Math.pow(Math.sin(Math.PI * t), 0.78) * 0.19
      for (let side = 0; side < 3; side += 1) {
        const across = side - 1
        vertices.push(across * halfWidth, t * 0.86, Math.sin(t * Math.PI) * (1 - across * across) * 0.055)
        uvs.push(side / 2, t)
      }
    }
    for (let row = 0; row < rows; row += 1) {
      for (let side = 0; side < 2; side += 1) {
        const a = row * 3 + side
        const b = a + 3
        indices.push(a, b, a + 1, a + 1, b, b + 1)
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    return geometry
  }, [])
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.32, 0.6, 32, 1]} />
        <meshPhysicalMaterial color="#302b26" roughness={0.27} clearcoat={0.28} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.245, 0.245, 0.045, 32]} />
        <meshStandardMaterial color="#211e19" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.77, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.09, 0.3, 10]} />
        <meshStandardMaterial color="#5b4532" roughness={0.76} />
      </mesh>
      {Array.from({ length: 11 }, (_, index) => {
        const angle = index * (Math.PI * 2 / 11)
        const height = 1.03 + (index % 4) * 0.16
        const lean = 0.19 + (index % 3) * 0.08
        return (
          <group key={index} rotation={[0, angle, 0]}>
            <mesh position={[0, 0.87, 0]} rotation={[0, 0, -0.1]} castShadow>
              <cylinderGeometry args={[0.012, 0.022, height * 0.47, 8]} />
              <meshStandardMaterial color="#42513a" roughness={0.72} />
            </mesh>
            <mesh
              geometry={leafGeometry}
              position={[lean, height * 0.53, 0]}
              rotation={[0.2, 0, -0.3]}
              scale={[0.8 + (index % 3) * 0.17, 0.78 + (index % 4) * 0.09, 1]}
              castShadow
              receiveShadow
            >
              <meshPhysicalMaterial
                color={index % 3 === 0 ? '#294332' : '#405b43'}
                roughness={0.54}
                clearcoat={0.1}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Sofa({
  imagePosition,
  width = 2.1,
  rotation = 0,
  color = '#928878'
}: {
  imagePosition: [number, number]
  width?: number
  rotation?: number
  color?: string
}) {
  const [x, z] = imagePointToWorld(imagePosition)
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <RoundedBox args={[width * 0.96, 0.12, 0.76]} radius={0.06} smoothness={5} position={[0, 0.27, 0]} castShadow>
        <meshStandardMaterial map={getSurfaceMaterials().wood.map} color="#493524" roughness={0.52} metalness={0.04} />
      </RoundedBox>
      <RoundedBox args={[width * 0.9, 0.18, 0.66]} radius={0.1} smoothness={7} position={[0, 0.43, 0.02]} castShadow receiveShadow>
        <meshPhysicalMaterial map={getSurfaceMaterials().upholstery.map} color={color} roughness={0.76} sheen={0.28} sheenColor="#d8c8ae" sheenRoughness={0.82} />
      </RoundedBox>
      {[-width * 0.29, 0, width * 0.29].map((xPosition) => (
        <RoundedBox key={xPosition} args={[width * 0.275, 0.3, 0.57]} radius={0.13} smoothness={8} position={[xPosition, 0.56, -0.04]} castShadow receiveShadow>
          <meshPhysicalMaterial map={getSurfaceMaterials().upholstery.map} color={color} roughness={0.78} sheen={0.3} sheenColor="#dfd2bc" sheenRoughness={0.84} />
        </RoundedBox>
      ))}
      <RoundedBox args={[width * 0.88, 0.56, 0.22]} radius={0.11} smoothness={7} position={[0, 0.76, -0.27]} castShadow receiveShadow>
        <meshPhysicalMaterial map={getSurfaceMaterials().upholstery.map} color={color} roughness={0.78} sheen={0.28} sheenColor="#dfd2bc" sheenRoughness={0.84} />
      </RoundedBox>
      {[-width / 2 + 0.13, width / 2 - 0.13].map((xPosition) => (
        <RoundedBox key={xPosition} args={[0.24, 0.48, 0.75]} radius={0.1} smoothness={7} position={[xPosition, 0.64, 0]} castShadow>
          <meshPhysicalMaterial map={getSurfaceMaterials().upholstery.map} color={color} roughness={0.78} sheen={0.28} sheenColor="#dfd2bc" sheenRoughness={0.84} />
        </RoundedBox>
      ))}
      {[-1, 1].flatMap((side) =>
        [-1, 1].map((frontBack) => (
          <group key={`foot-${side}-${frontBack}`} position={[side * (width * 0.39), 0.12, frontBack * 0.27]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.022, 0.035, 0.24, 8]} />
              <meshStandardMaterial color="#b99a69" metalness={0.62} roughness={0.34} />
            </mesh>
            <mesh position={[0, 0.11, 0]}>
              <cylinderGeometry args={[0.036, 0.036, 0.018, 12]} />
              <meshStandardMaterial color="#d2b578" metalness={0.64} roughness={0.32} />
            </mesh>
          </group>
        ))
      )}
    </group>
  )
}

function ExecutiveChair({ imagePosition, rotation = 0 }: { imagePosition: [number, number]; rotation?: number }) {
  const [x, z] = imagePointToWorld(imagePosition)
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.66, 0.12, 0.62]} radius={0.075} smoothness={6} position={[0, 0.49, 0.025]} castShadow receiveShadow>
        <meshPhysicalMaterial map={getSurfaceMaterials().upholstery.map} color="#594635" roughness={0.48} sheen={0.16} sheenColor="#b9a184" sheenRoughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[0.63, 0.56, 0.15]} radius={0.09} smoothness={7} position={[0, 0.81, -0.22]} rotation={[-0.08, 0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial map={getSurfaceMaterials().upholstery.map} color="#64503b" roughness={0.5} sheen={0.18} sheenColor="#c5ad8a" sheenRoughness={0.76} />
      </RoundedBox>
      <Block position={[0, 0.405, 0.02]} size={[0.72, 0.035, 0.68]} color="#392b20" roughness={0.54} />
      {[-0.25, 0.25].map((side) => (
        <group key={side}>
          <Block position={[side, 0.66, 0.03]} size={[0.035, 0.3, 0.035]} color="#b89a68" metalness={0.68} roughness={0.34} />
          <RoundedBox args={[0.13, 0.07, 0.55]} radius={0.03} smoothness={4} position={[side, 0.79, -0.015]} castShadow>
            <meshStandardMaterial map={getSurfaceMaterials().wood.map} color="#60472f" roughness={0.48} metalness={0.04} />
          </RoundedBox>
        </group>
      ))}
      {[-0.24, 0.24].flatMap((side) =>
        [-0.22, 0.25].map((frontBack) => (
          <Block
            key={`leg-${side}-${frontBack}`}
            position={[side, 0.2, frontBack]}
            size={[0.035, 0.4, 0.035]}
            color="#b99a69"
            metalness={0.64}
            roughness={0.36}
          />
        ))
      )}
      <Block position={[0, 0.4, 0.345]} size={[0.5, 0.014, 0.012]} color="#c5a875" metalness={0.62} roughness={0.38} />
    </group>
  )
}

function LoungeChair({ imagePosition, rotation = 0 }: { imagePosition: [number, number]; rotation?: number }) {
  const [x, z] = imagePointToWorld(imagePosition)
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.78, 0.18, 0.72]} radius={0.08} position={[0, 0.47, 0]} castShadow>
        <meshStandardMaterial map={getSurfaceMaterials().wood.map} color="#58412f" roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[0.72, 0.28, 0.59]} radius={0.12} smoothness={6} position={[0, 0.59, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial map={getSurfaceMaterials().upholstery.map} color="#d2c5b2" roughness={0.78} sheen={0.3} sheenColor="#e3d5bf" sheenRoughness={0.84} />
      </RoundedBox>
      <RoundedBox args={[0.68, 0.58, 0.16]} radius={0.1} smoothness={6} position={[0, 0.84, -0.25]} rotation={[-0.13, 0, 0]} castShadow>
        <meshPhysicalMaterial map={getSurfaceMaterials().upholstery.map} color="#c8baa4" roughness={0.78} sheen={0.3} sheenColor="#e3d5bf" sheenRoughness={0.84} />
      </RoundedBox>
      {[-0.37, 0.37].map((xPosition) => (
        <RoundedBox key={xPosition} args={[0.13, 0.4, 0.63]} radius={0.06} smoothness={4} position={[xPosition, 0.69, -0.01]} castShadow>
          <meshStandardMaterial map={getSurfaceMaterials().upholstery.map} color="#b8a991" roughness={0.8} />
        </RoundedBox>
      ))}
      {[-0.29, 0.29].map((xPosition) =>
        [-0.25, 0.25].map((zPosition) => (
          <Block key={`${xPosition}-${zPosition}`} position={[xPosition, 0.19, zPosition]} size={[0.038, 0.36, 0.038]} color="#6a5039" roughness={0.48} />
        ))
      )}
    </group>
  )
}

function Table({
  imagePosition,
  width,
  depth,
  height = 0.8,
  color = '#76543d',
  marble = false,
  rotation = 0
}: {
  imagePosition: [number, number]
  width: number
  depth: number
  height?: number
  color?: string
  marble?: boolean
  rotation?: number
}) {
  const [x, z] = imagePointToWorld(imagePosition)
  const surfaces = getSurfaceMaterials()
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <RoundedBox args={[width, 0.13, depth]} radius={0.045} smoothness={3} position={[0, height, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          map={marble ? surfaces.marble.map : surfaces.wood.map}
          bumpMap={marble ? surfaces.marble.bumpMap : surfaces.wood.bumpMap}
          bumpScale={marble ? 0.024 : 0.035}
          color={marble ? '#f5f0e7' : color}
          roughness={marble ? 0.24 : 0.42}
          metalness={marble ? 0.02 : 0.06}
          clearcoat={marble ? 0.2 : 0.12}
          clearcoatRoughness={0.32}
        />
      </RoundedBox>
      <Block position={[0, height - 0.16, 0]} size={[width - 0.2, 0.1, depth - 0.18]} color="#35291f" roughness={0.58} />
      {[-width * 0.31, width * 0.31].map((xPosition) => (
        <RoundedBox key={xPosition} args={[0.12, height - 0.24, depth * 0.62]} radius={0.035} smoothness={4} position={[xPosition, (height - 0.12) / 2, 0]} castShadow>
          <meshStandardMaterial map={surfaces.wood.map} color="#b79470" roughness={0.43} metalness={0.06} />
        </RoundedBox>
      ))}
      <Block position={[0, height + 0.072, 0]} size={[width * 0.78, 0.012, 0.014]} color="#c8a873" metalness={0.66} roughness={0.31} />
    </group>
  )
}

function DiningChair({ imagePosition, rotation = 0 }: { imagePosition: [number, number]; rotation?: number }) {
  const [x, z] = imagePointToWorld(imagePosition)
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <Block position={[0, 0.18, 0]} size={[0.09, 0.34, 0.09]} color="#b5a98e" metalness={0.68} roughness={0.3} />
      <RoundedBox args={[0.62, 0.12, 0.58]} radius={0.06} smoothness={5} position={[0, 0.43, 0.02]} castShadow>
        <meshStandardMaterial map={getSurfaceMaterials().upholstery.map} color="#655444" metalness={0.03} roughness={0.41} />
      </RoundedBox>
      <RoundedBox args={[0.57, 0.54, 0.14]} radius={0.075} smoothness={6} position={[0, 0.76, -0.2]} rotation={[-0.08, 0, 0]} castShadow>
        <meshStandardMaterial map={getSurfaceMaterials().upholstery.map} color="#735d49" roughness={0.47} />
      </RoundedBox>
      <RoundedBox args={[0.38, 0.17, 0.08]} radius={0.035} smoothness={4} position={[0, 0.77, -0.115]} castShadow>
        <meshStandardMaterial map={getSurfaceMaterials().upholstery.map} color="#8a7056" roughness={0.48} />
      </RoundedBox>
      {[-0.29, 0.29].map((xPosition) => (
        <group key={xPosition}>
          <Block position={[xPosition, 0.62, -0.03]} size={[0.045, 0.25, 0.045]} color="#9e947e" metalness={0.62} roughness={0.31} />
          <Block position={[xPosition, 0.74, 0.03]} size={[0.045, 0.045, 0.38]} color="#9e947e" metalness={0.62} roughness={0.31} />
        </group>
      ))}
      {Array.from({ length: 5 }, (_, index) => {
        const angle = index * Math.PI * 2 / 5
        return (
          <group key={index} rotation={[0, angle, 0]}>
            <Block position={[0.22, 0.08, 0]} size={[0.34, 0.035, 0.045]} color="#888371" metalness={0.7} roughness={0.3} />
            <mesh position={[0.39, 0.055, 0]} castShadow>
              <sphereGeometry args={[0.055, 12, 8]} />
              <meshStandardMaterial color="#393833" roughness={0.45} metalness={0.16} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function ReceptionDesk() {
  const [x, z] = imagePointToWorld([867, 477])
  const shape = useMemo(() => {
    const outline = new THREE.Shape()
    outline.moveTo(-1.55, 0.5)
    outline.lineTo(1.55, 0.5)
    outline.lineTo(1.55, -0.28)
    outline.quadraticCurveTo(0, -0.69, -1.55, -0.28)
    outline.quadraticCurveTo(-1.62, 0.08, -1.55, 0.5)
    outline.closePath()
    return outline
  }, [])
  const frontPoint = point(867, 477, 0.57)
  return (
    <group>
      <mesh position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <extrudeGeometry
          args={[shape, { depth: 1.1, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 4, curveSegments: 20 }]}
        />
        <meshStandardMaterial
          map={getSurfaceMaterials().wood.map}
          bumpMap={getSurfaceMaterials().wood.bumpMap}
          bumpScale={0.035}
          color="#bd9b78"
          roughness={0.48}
        />
      </mesh>
      <RoundedBox args={[3.45, 0.16, 1.23]} radius={0.08} smoothness={6} position={point(867, 477, 1.18)} castShadow receiveShadow>
        <meshPhysicalMaterial
          map={getSurfaceMaterials().marble.map}
          bumpMap={getSurfaceMaterials().marble.bumpMap}
          bumpScale={0.024}
          color="#faf5eb"
          roughness={0.23}
          clearcoat={0.18}
          clearcoatRoughness={0.32}
        />
      </RoundedBox>
      <Block
        position={[frontPoint[0], 0.14, frontPoint[2] + 0.62]}
        size={[2.95, 0.035, 0.025]}
        color="#ffd9a2"
        emissive="#ffca82"
        emissiveIntensity={0.72}
        roughness={0.32}
        castShadow={false}
      />
    </group>
  )
}

function drawReceptionWordmark(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas
  context.clearRect(0, 0, width, height)
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '500 178px "Playfair Display", Georgia, "Times New Roman", serif'
  context.fontKerning = 'normal'
  context.letterSpacing = '0.22em'
  context.shadowColor = 'rgba(231, 190, 112, 0.28)'
  context.shadowBlur = 9
  context.fillStyle = '#684719'
  context.fillText('DMIRALUXE', width / 2 + 3, 226, 1900)
  const gold = context.createLinearGradient(0, 130, 0, 320)
  gold.addColorStop(0, '#fff3c8')
  gold.addColorStop(0.24, '#d6b16b')
  gold.addColorStop(0.52, '#f5dfa5')
  gold.addColorStop(0.76, '#a97531')
  gold.addColorStop(1, '#e6ca88')
  context.shadowBlur = 5
  context.shadowColor = 'rgba(255, 220, 154, 0.3)'
  context.fillStyle = gold
  context.fillText('DMIRALUXE', width / 2, 220, 1900)

  context.shadowBlur = 0
  context.letterSpacing = '0.34em'
  context.font = '500 43px Inter, "Helvetica Neue", sans-serif'
  context.fillStyle = '#d8c29a'
  context.fillText('THE OFFICE', width / 2, 394, 1000)
}

function ReceptionSign() {
  const { canvas, lettering } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 560
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Unable to create the reception wordmark.')
    drawReceptionWordmark(context)

    const lettering = new THREE.CanvasTexture(canvas)
    lettering.colorSpace = THREE.SRGBColorSpace
    lettering.anisotropy = 8
    return { canvas, lettering }
  }, [])

  useEffect(() => {
    let disposed = false
    void Promise.all([
      document.fonts.load('500 178px "Playfair Display"'),
      document.fonts.load('500 43px Inter')
    ]).then(() => {
      if (disposed) return
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Unable to refresh the reception wordmark.')
      drawReceptionWordmark(context)
      lettering.needsUpdate = true
    }).catch((error: unknown) => {
      if (!disposed) console.warn('The reception sign is using its serif fallback because a display font could not be loaded.', error)
    })
    return () => {
      disposed = true
      lettering.dispose()
    }
  }, [canvas, lettering])

  return (
    <group position={point(867, 340, 2.12)}>
      <RoundedBox args={[4.35, 1.42, 0.18]} radius={0.045} smoothness={5} castShadow receiveShadow>
        <meshStandardMaterial
          map={getSurfaceMaterials().wood.map}
          color="#493321"
          roughness={0.48}
          metalness={0.08}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.096]}>
        <planeGeometry args={[4.08, 1.18]} />
        <meshStandardMaterial color="#211a14" roughness={0.48} metalness={0.16} />
      </mesh>
      <mesh position={[0, 0, 0.103]}>
        <planeGeometry args={[3.96, 1.08]} />
        <meshStandardMaterial
          map={lettering}
          transparent
          depthWrite={false}
          metalness={0.58}
          roughness={0.32}
          emissive="#6e4a1d"
          emissiveIntensity={0.16}
        />
      </mesh>
      <mesh position={[0, 0.63, 0.1]}>
        <boxGeometry args={[3.96, 0.018, 0.025]} />
        <meshStandardMaterial color="#d0ae70" metalness={0.68} roughness={0.34} />
      </mesh>
      <mesh position={[0, -0.63, 0.1]}>
        <boxGeometry args={[3.96, 0.018, 0.025]} />
        <meshStandardMaterial color="#d0ae70" metalness={0.68} roughness={0.34} />
      </mesh>
    </group>
  )
}

function Staircase({
  imageStart,
  imageEnd,
  steps = 9,
  width,
  risingEast = true
}: {
  imageStart: [number, number]
  imageEnd: [number, number]
  steps?: number
  width: number
  risingEast?: boolean
}) {
  const [startX, startZ] = imagePointToWorld(imageStart)
  const [endX, endZ] = imagePointToWorld(imageEnd)
  const alongX = Math.abs(endX - startX) > Math.abs(endZ - startZ)
  const length = Math.hypot(endX - startX, endZ - startZ)
  const stepLength = length / steps
  return (
    <group>
      {Array.from({ length: steps }, (_, index) => {
        const progression = index / steps
        const climb = (index + 1) * 0.17
        const move = (index + 0.5) * stepLength
        const direction = risingEast ? 1 : -1
        const x = alongX ? startX + (endX >= startX ? 1 : -1) * move : (startX + endX) / 2
        const z = alongX ? (startZ + endZ) / 2 : startZ + (endZ >= startZ ? 1 : -1) * move
        return (
          <Block
            key={index}
            position={[x, climb / 2 - 0.08, z]}
            size={alongX ? [stepLength + 0.035, climb, width] : [width, climb, stepLength + 0.035]}
            color={index % 2 ? '#9c8c72' : '#c7baa1'}
            roughness={0.45}
            metalness={0.08}
          />
        )
      })}
      <Block position={[startX, 0.035, startZ]} size={[alongX ? 0.9 : width + 0.25, 0.07, alongX ? width + 0.25 : 0.9]} color="#c5b9a2" roughness={0.43} />
    </group>
  )
}

function Ceiling({
  imageCenter,
  width,
  depth,
  color = '#e2dacc'
}: {
  imageCenter: [number, number]
  width: number
  depth: number
  color?: string
}) {
  return <Block position={point(imageCenter[0], imageCenter[1], 3.82)} size={[width, 0.18, depth]} color={color} roughness={0.7} />
}

function ArchitecturalLighting() {
  const fixtures: { imagePosition: [number, number] }[] = [
    { imagePosition: [294, 145] },
    { imagePosition: [543, 145] },
    { imagePosition: [800, 147] },
    { imagePosition: [1204, 148] },
    { imagePosition: [229, 404] },
    { imagePosition: [556, 414] },
    { imagePosition: [864, 409] },
    { imagePosition: [1180, 405] },
    { imagePosition: [1380, 413] },
    { imagePosition: [760, 640] }
  ]
  return (
    <group name="architectural-lighting">
      {fixtures.map(({ imagePosition }, index) => {
        const [x, z] = imagePointToWorld(imagePosition)
        return (
          <group key={index} position={[x, 3.5, z]}>
            <mesh position={[0, 0.12, 0]}>
              <boxGeometry args={[index === 3 ? 1.55 : 1.1, 0.035, 0.09]} />
              <meshStandardMaterial
                color="#fff1d4"
                emissive="#ffd59b"
                emissiveIntensity={0.45}
                roughness={0.34}
              />
            </mesh>
          </group>
        )
      })}
      {[[1160, 101], [1204, 101], [1248, 101]].map(([x, y]) => (
        <Block key={x} position={point(x, y, 3.56)} size={[0.025, 0.035, 2.05]} color="#f7dfb8" emissive="#ffd79f" emissiveIntensity={0.68} roughness={0.35} castShadow={false} />
      ))}
      <Block position={point(867, 355, 3.58)} size={[2.65, 0.026, 0.035]} color="#f9e7c9" emissive="#ffe0ad" emissiveIntensity={0.75} roughness={0.3} castShadow={false} />
      <Block position={point(867, 355, 3.58)} size={[0.026, 0.026, 1.1]} color="#f9e7c9" emissive="#ffe0ad" emissiveIntensity={0.75} roughness={0.3} castShadow={false} />
    </group>
  )
}

function Pendant({ imagePosition, color = '#f3d7a8' }: { imagePosition: [number, number]; color?: string }) {
  const [x, z] = imagePointToWorld(imagePosition)
  return (
    <group position={[x, 3.45, z]}>
      <mesh>
        <cylinderGeometry args={[0.012, 0.012, 0.5, 8]} />
        <meshStandardMaterial color="#b39a74" metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.1, 0.34, 0.16, 48, 1, true]} />
        <meshPhysicalMaterial color="#8f7756" metalness={0.72} roughness={0.29} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.365, 0]}>
        <cylinderGeometry args={[0.08, 0.29, 0.012, 40]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.15} roughness={0.28} />
      </mesh>
    </group>
  )
}

function OfficeArchitecture() {
  const walls: [number, number, number, number, boolean?][] = [
    [-11.3, -8.1, 12.15, -8.1],
    [-11.3, -8.1, -11.3, -4.35],
    [-11.3, -4.35, -11.3, -3.03],
    [12.15, -8.1, 12.15, -4.35],
    [12.15, -4.35, 12.95, -4.35],
    [-5.8, -8.1, -5.8, -4.35],
    [-2.63, -8.1, -2.63, -4.35],
    [3.7, -8.1, 3.7, -4.35],
    [-13.2, -1.35, -13.2, 0.95],
    [-13.2, -1.35, -12, -1.35],
    [-12, -3.03, -12, -1.35],
    [-12, -1.35, -12, 0.95],
    [-12, 0.95, -8.9, 0.95],
    [-8.9, 0.95, -8.9, 5.85],
    [-8.9, 5.85, -8.9, 8.05],
    [-8.9, 8.05, -3.8, 8.05],
    [-3.8, 0.95, -3.8, 1.7],
    [-3.8, 2.9, -3.8, 8.05],
    [-3.8, 8.05, -1.2, 8.05],
    [3.2, 0.95, 3.2, 1.7],
    [3.2, 2.9, 3.2, 8.05],
    [4.4, 0.95, 4.4, 1.9],
    [4.4, 3.2, 4.4, 8.05],
    [4.4, 8.05, 11.6, 8.05],
    [11.6, 0.95, 11.6, 8.05],
    [12.95, -4.35, 12.95, 0.95],
    [-12, 0.95, -12, 5.85],
    [-12, 5.85, -8.9, 5.85],
    [-8.9, 0.95, -6.8, 0.95],
    [-5.2, 0.95, -3.8, 0.95],
    [3.2, 0.95, 4.4, 0.95],
    [4.4, 0.95, 5.2, 0.95],
    [6.6, 0.95, 8.5, 0.95],
    [10.4, 0.95, 11.6, 0.95]
  ]
  const glazings: [number, number, number, number][] = [
    [-11.2, -4.35, -7.45, -4.35],
    [-6.05, -4.35, -5.8, -4.35],
    [-5.4, -4.35, -4.72, -4.35],
    [-3.28, -4.35, -2.63, -4.35],
    [-2.63, -4.35, -0.55, -4.35],
    [1.1, -4.35, 3.7, -4.35],
    [3.7, -4.35, 5.95, -4.35],
    [7.55, -4.35, 12.15, -4.35],
    [-11.2, -3.03, -6.9, -3.03],
    [-4.9, -3.03, -0.7, -3.03],
    [0.9, -3.03, 4.4, -3.03],
    [5.8, -3.03, 11.6, -3.03]
  ]
  return (
    <group name="office-architecture">
      {walls.map(([x1, z1, x2, z2], index) => (
        <WallRun key={index} from={[x1, z1]} to={[x2, z2]} />
      ))}
      {glazings.map(([x1, z1, x2, z2], index) => (
        <GlassWall key={index} from={[x1, z1]} to={[x2, z2]} />
      ))}

      {/* Walnut slat screen, boardroom feature wall and reception portal. */}
      <WallRun from={[-10.95, -7.6]} to={[-9.6, -7.6]} height={3.35} wood />
      <WallRun from={[-2.5, -7.65]} to={[-1.15, -7.65]} height={3.35} wood />
      <WallRun from={[4.35, -7.66]} to={[11.7, -7.66]} height={3.25} wood />
      <WallRun from={[-2.65, -0.2]} to={[-2.65, 0.8]} height={3.2} wood />
      <WallRun from={[-0.25, -2.66]} to={[3.4, -2.66]} height={3.25} wood />

      {/* Lift enclosure, two lift door openings and discreet metal reveals. */}
      <WallRun from={[-3.15, 3.85]} to={[-3.15, 6.55]} height={3.25} />
      <WallRun from={[-3.15, 6.55]} to={[1.48, 6.55]} height={3.25} />
      <WallRun from={[1.48, 3.85]} to={[1.48, 6.55]} height={3.25} />
      <Block position={[-2.13, 1.55, 3.84]} size={[1.48, 2.92, 0.12]} color="#aa9470" metalness={0.35} roughness={0.32} />
      <Block position={[-0.35, 1.55, 3.84]} size={[1.48, 2.92, 0.12]} color="#aa9470" metalness={0.35} roughness={0.32} />
      <Block position={[-2.13, 1.55, 3.765]} size={[0.025, 2.72, 0.025]} color="#60594c" metalness={0.56} />
      <Block position={[-0.35, 1.55, 3.765]} size={[0.025, 2.72, 0.025]} color="#60594c" metalness={0.56} />
      <Block position={[-2.92, 1.56, 3.72]} size={[0.055, 0.2, 0.08]} color="#d5b478" emissive="#d5b478" emissiveIntensity={0.12} metalness={0.8} />
      <Block position={[0.43, 1.56, 3.72]} size={[0.055, 0.2, 0.08]} color="#d5b478" emissive="#d5b478" emissiveIntensity={0.12} metalness={0.8} />

      {/* Interior glazed office doors are shown open at their corridor thresholds. */}
      <DoorLeaf imagePosition={[386, 249]} />
      <DoorLeaf imagePosition={[554, 249]} />
      <DoorLeaf imagePosition={[781, 249]} />
      <DoorLeaf imagePosition={[1143, 249]} />
      <DoorLeaf imagePosition={[555, 611]} vertical />
      <DoorLeaf imagePosition={[947, 611]} vertical />
      <DoorLeaf imagePosition={[726, 935]} />
      <DoorLeaf imagePosition={[790, 935]} />

      {/* Recessed ceiling coffers, dropped light trays, and wood-rimmed portals. */}
      <Ceiling imageCenter={[292, 139]} width={5.3} depth={3.7} color="#d7c8b2" />
      <Ceiling imageCenter={[542, 140]} width={2.75} depth={3.75} color="#d4ccbd" />
      <Ceiling imageCenter={[797, 141]} width={6.0} depth={3.8} color="#ddd4c4" />
      <Ceiling imageCenter={[1209, 141]} width={8.1} depth={3.8} color="#352d27" />
      <Ceiling imageCenter={[548, 423]} width={6.0} depth={3.4} color="#ded5c6" />
      <Ceiling imageCenter={[875, 418]} width={4.8} depth={3.45} color="#40382f" />
      <Ceiling imageCenter={[1180, 419]} width={5.2} depth={3.5} color="#d8cebd" />
      <Ceiling imageCenter={[412, 646]} width={4.65} depth={3.8} color="#d1c7b6" />
      <Ceiling imageCenter={[750, 604]} width={6.7} depth={2.5} color="#ddd5c7" />
      <Ceiling imageCenter={[1190, 605]} width={7.1} depth={2.05} color="#d1c7b6" />
      <Ceiling imageCenter={[1218, 816]} width={6.4} depth={3.7} color="#d1c7b6" />
      <Ceiling imageCenter={[165, 650]} width={3.2} depth={4.2} color="#dbd4c7" />

      {/* Low wood details and lift-lobby ceiling are intentionally distinct. */}
      <Block position={point(867, 345, 3.52)} size={[4.45, 0.1, 0.17]} color="#c7a675" metalness={0.55} roughness={0.3} />
      <Block position={point(867, 351, 3.52)} size={[4.3, 0.028, 0.035]} color="#d7bb89" emissive="#ba8c51" emissiveIntensity={0.45} metalness={0.5} />
    </group>
  )
}

export function OfficeEnvironment() {
  const floorMaterial = useMemo(() => getSurfaceMaterials().floor, [])
  return (
    <group name="dmiraluxe-office-environment">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]} receiveShadow>
        <planeGeometry args={[44, 34]} />
        <meshStandardMaterial color="#222320" roughness={0.94} />
      </mesh>
      <FloorSurface floorMaterial={floorMaterial} />
      <OfficeArchitecture />
      <ArchitecturalLighting />

      {/* Private office furniture and bespoke writing desk. */}
      <Table imagePosition={[301, 172]} width={2.8} depth={0.88} height={0.83} color="#64462f" />
      <LoungeChair imagePosition={[302, 128]} rotation={Math.PI} />
      <ExecutiveChair imagePosition={[257, 213]} />
      <ExecutiveChair imagePosition={[326, 213]} />
      <Sofa imagePosition={[311, 87]} width={1.9} color="#333431" rotation={Math.PI} />
      <Plant imagePosition={[184, 126]} scale={1.12} />
      <Plant imagePosition={[423, 148]} scale={0.86} />

      {/* An intimate lounge meeting suite alongside the executive office. */}
      <Sofa imagePosition={[544, 111]} width={1.18} />
      <Table imagePosition={[546, 181]} width={1.02} depth={0.88} height={0.46} marble />
      <LoungeChair imagePosition={[505, 148]} rotation={0.35} />
      <LoungeChair imagePosition={[584, 149]} rotation={-0.35} />
      <Plant imagePosition={[495, 78]} scale={0.86} />
      <Plant imagePosition={[600, 80]} scale={0.8} />

      {/* Formal meeting suite with six leather executive chairs. */}
      <Block position={point(815, 94, 2.45)} size={[1.38, 0.82, 0.075]} color="#31393a" roughness={0.2} metalness={0.3} />
      <Block position={point(815, 94, 2.48)} size={[1.14, 0.63, 0.018]} color="#617879" emissive="#263a3c" emissiveIntensity={0.11} roughness={0.24} />
      <Table imagePosition={[822, 171]} width={2.42} depth={0.82} height={0.83} color="#8a6547" />
      <ExecutiveChair imagePosition={[790, 140]} />
      <ExecutiveChair imagePosition={[852, 140]} />
      <ExecutiveChair imagePosition={[790, 205]} rotation={Math.PI} />
      <ExecutiveChair imagePosition={[852, 205]} rotation={Math.PI} />
      <ExecutiveChair imagePosition={[742, 172]} rotation={Math.PI / 2} />
      <ExecutiveChair imagePosition={[901, 172]} rotation={-Math.PI / 2} />
      <Plant imagePosition={[666, 72]} scale={0.88} />
      <Plant imagePosition={[946, 98]} scale={0.72} />

      {/* Grand boardroom table, concealed services and ten tailored seats. */}
      <Table imagePosition={[1205, 175]} width={4.48} depth={0.94} height={0.84} color="#684832" />
      {[[1121, 133], [1180, 133], [1240, 133], [1300, 133]].map(([x, y]) => (
        <ExecutiveChair key={`north-${x}`} imagePosition={[x, y]} />
      ))}
      {[[1121, 216], [1180, 216], [1240, 216], [1300, 216]].map(([x, y]) => (
        <ExecutiveChair key={`south-${x}`} imagePosition={[x, y]} rotation={Math.PI} />
      ))}
      <ExecutiveChair imagePosition={[1059, 175]} rotation={Math.PI / 2} />
      <ExecutiveChair imagePosition={[1350, 175]} rotation={-Math.PI / 2} />
      <Plant imagePosition={[1028, 77]} scale={1.15} />
      <Plant imagePosition={[1394, 77]} scale={1.14} />
      <Plant imagePosition={[1033, 220]} scale={0.9} />
      <Plant imagePosition={[1403, 220]} scale={0.92} />

      {/* Shared corridor joinery and a side-facing arrival desk. */}
      <Block position={point(289, 296, 0.66)} size={[5.02, 1.25, 0.84]} color="#503b2c" roughness={0.55} />
      <Block position={point(289, 296, 1.31)} size={[5.12, 0.09, 0.91]} color="#d9d1c3" roughness={0.24} />
      <Plant imagePosition={[160, 294]} scale={0.72} />
      <Plant imagePosition={[418, 293]} scale={0.72} />

      {/* West lounge, central salon, and low champagne-trimmed coffee tables. */}
      <Table imagePosition={[237, 404]} width={1.6} depth={0.82} height={0.7} color="#7c6247" />
      <LoungeChair imagePosition={[183, 387]} rotation={-0.3} />
      <LoungeChair imagePosition={[215, 453]} rotation={Math.PI + 0.1} />
      <LoungeChair imagePosition={[269, 450]} rotation={Math.PI - 0.1} />
      <Sofa imagePosition={[563, 411]} width={2.86} rotation={-0.06} color="#a49a87" />
      <Table imagePosition={[563, 467]} width={1.36} depth={0.85} height={0.4} marble />
      <LoungeChair imagePosition={[506, 496]} rotation={0.55} />
      <LoungeChair imagePosition={[627, 496]} rotation={-0.55} />
      <Plant imagePosition={[653, 354]} scale={1.08} />
      <Plant imagePosition={[653, 516]} scale={0.98} />

      {/* Reception counter with a sculptural fluted timber face. */}
      <Block position={point(867, 477, 0.14)} size={[3.38, 0.13, 1.08]} color="#29231e" roughness={0.4} />
      {Array.from({ length: 18 }, (_, index) => (
        <Block
          key={index}
          position={[point(733 + index * 15.5, 477)[0], 0.57, point(733 + index * 15.5, 477)[1] + 0.12]}
          size={[0.018, 0.82, 1.1]}
          color="#bd9b72"
          metalness={0.04}
          roughness={0.55}
          map={getSurfaceMaterials().wood.map}
        />
      ))}
      <ReceptionDesk />
      <ReceptionSign />
      <Plant imagePosition={[780, 445]} scale={0.95} />
      <Plant imagePosition={[967, 509]} scale={0.95} />

      {/* Workstation banks with premium task chairs and integrated screens. */}
      {[[1125, 376], [1125, 432], [1125, 487], [1213, 376], [1213, 432], [1213, 487]].map(([x, y], index) => (
        <group key={index}>
          <Table imagePosition={[x, y]} width={0.96} depth={0.64} height={0.77} color="#7b5a3d" rotation={Math.PI / 2} />
          <Block position={point(x, y, 0.86)} size={[0.32, 0.3, 0.025]} color="#343a3b" roughness={0.28} metalness={0.15} />
          <DiningChair imagePosition={[x + 27, y]} rotation={Math.PI / 2} />
        </group>
      ))}
      {[[1084, 392], [1084, 449], [1084, 498], [1261, 392], [1261, 449], [1261, 498]].map(([x, y], index) => (
        <DiningChair key={index} imagePosition={[x, y]} rotation={-Math.PI / 2} />
      ))}

      {/* Intimate east-side lounge with a rounded pair of armchairs. */}
      <Sofa imagePosition={[1393, 389]} width={1.4} rotation={Math.PI / 2} color="#646c55" />
      <Table imagePosition={[1395, 446]} width={0.78} depth={0.66} height={0.44} marble />
      <Sofa imagePosition={[1393, 488]} width={1.42} rotation={Math.PI / 2} color="#646c55" />

      {/* The source plan shows a western service stair and broad eastern stair. */}
      <Staircase imageStart={[303, 575]} imageEnd={[524, 575]} width={3.3} steps={9} />
      <Staircase imageStart={[315, 804]} imageEnd={[531, 804]} width={2.2} steps={7} />
      <Staircase imageStart={[1040, 719]} imageEnd={[1391, 719]} width={3.1} steps={12} />
      <Block position={point(1194, 681, 1.2)} size={[5.55, 0.18, 0.12]} color="#746951" metalness={0.55} roughness={0.3} />
      <Block position={point(1194, 900, 1.2)} size={[5.55, 0.18, 0.12]} color="#746951" metalness={0.55} roughness={0.3} />
      <Sofa imagePosition={[1352, 583]} width={1.5} rotation={Math.PI / 2} color="#68705a" />
      <Table imagePosition={[1367, 629]} width={0.8} depth={0.7} height={0.45} marble />
      <Plant imagePosition={[1229, 572]} scale={0.84} />

      {/* The lower lobby's stone lift portal and sculptural planter group. */}
      <Sofa imagePosition={[633, 613]} width={1.75} color="#978b78" />
      <Plant imagePosition={[823, 594]} scale={0.96} />
      <Plant imagePosition={[592, 883]} scale={0.92} />

      {/* Tall potted trees soften each glass threshold and arrival point. */}
      <Plant imagePosition={[152, 160]} scale={1.2} />
      <Plant imagePosition={[951, 268]} scale={0.92} />
      <Plant imagePosition={[1434, 287]} scale={0.96} />

      {/* Layered ceiling lights make the room sequence readable at eye level. */}
      <Pendant imagePosition={[289, 107]} />
      <Pendant imagePosition={[543, 100]} color="#ffe0b8" />
      <Pendant imagePosition={[792, 99]} />
      <Pendant imagePosition={[1204, 105]} color="#ffe0b8" />
      <Pendant imagePosition={[232, 377]} color="#ffe3b8" />
      <Pendant imagePosition={[550, 358]} />
      <Pendant imagePosition={[863, 355]} color="#ffddb0" />
      <Pendant imagePosition={[1180, 354]} />
      <Pendant imagePosition={[1380, 353]} />

      {/* Entry threshold: stone portal, brass reveal and wide paired doors. */}
      <Block position={point(773, 905, 1.6)} size={[0.11, 3.2, 0.17]} color="#c4a16e" metalness={0.58} roughness={0.3} />
      <Block position={point(940, 905, 1.6)} size={[0.11, 3.2, 0.17]} color="#c4a16e" metalness={0.58} roughness={0.3} />
      <Block position={point(856.5, 905, 3.2)} size={[3.02, 0.11, 0.17]} color="#c4a16e" metalness={0.58} roughness={0.3} />

    </group>
  )
}
