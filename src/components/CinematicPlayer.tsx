import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { mainEntrance } from '../config/officeLayout'

interface TourStop {
  position: [number, number, number]
  target: [number, number, number]
  room: string | null
  fov: number
}

interface CinematicPlayerProps {
  playing: boolean
  loop: boolean
  restartToken: number
  onComplete: () => void
  onPositionChange: (position: { x: number; z: number }) => void
  onRoomChange: (room: string | null) => void
}

const tourStops: TourStop[] = [
  {
    position: [mainEntrance[0], 1.65, mainEntrance[1]],
    target: [3.1, 1.35, 0.7],
    room: null,
    fov: 63
  },
  { position: [3.25, 1.65, 4.2], target: [3.4, 1.35, 0.5], room: null, fov: 60 },
  { position: [3.9, 1.65, 0.55], target: [1.8, 1.1, -0.1], room: 'RECEPTION', fov: 58 },
  { position: [4.7, 1.65, -2.7], target: [3.2, 1.2, -3.2], room: null, fov: 62 },
  { position: [-3.5, 1.65, -2.7], target: [-3.5, 1.1, -1.3], room: null, fov: 62 },
  { position: [-3.5, 1.65, -0.8], target: [-3.6, 1.05, -1.5], room: 'CENTRAL LOUNGE', fov: 60 },
  { position: [4.5, 1.65, -0.75], target: [6.6, 1.2, -1.3], room: null, fov: 62 },
  { position: [7.3, 1.65, -0.75], target: [7.5, 1.05, -1.3], room: 'COLLABORATION', fov: 60 },
  { position: [7.3, 1.65, -3.8], target: [5.8, 1.3, -4.2], room: null, fov: 62 },
  { position: [0.2, 1.65, -3.85], target: [0.45, 1.15, -5.1], room: 'MEETING ROOM', fov: 58 },
  { position: [6.7, 1.65, -3.8], target: [7.7, 1.2, -5.4], room: 'BOARDROOM', fov: 56 },
  { position: [-6.65, 1.65, -3.85], target: [-7.4, 1.3, -4.4], room: null, fov: 62 },
  { position: [-8.15, 1.65, -5.45], target: [-8.4, 1.1, -6.2], room: 'EXECUTIVE OFFICE', fov: 58 },
  { position: [10.05, 1.65, 0.05], target: [11.1, 1.05, -1.1], room: 'SIDE LOUNGE', fov: 60 },
  { position: [3.2, 1.65, 4.2], target: [3.4, 1.35, 0.5], room: null, fov: 60 }
]

const positionPath = new THREE.CatmullRomCurve3(
  tourStops.map(({ position }) => new THREE.Vector3(...position)),
  true,
  'centripetal'
)
const lookPath = new THREE.CatmullRomCurve3(
  tourStops.map(({ target }) => new THREE.Vector3(...target)),
  true,
  'centripetal'
)
const SEGMENT_DURATION = 4.8

export function CinematicPlayer({
  playing,
  loop,
  restartToken,
  onComplete,
  onPositionChange,
  onRoomChange
}: CinematicPlayerProps) {
  const { camera } = useThree()
  const elapsed = useRef(0)
  const reportedRoom = useRef<string | null>(null)
  const lastPosition = useRef(new THREE.Vector2(mainEntrance[0], mainEntrance[1]))
  const lastPositionUpdate = useRef(0)
  const completionSent = useRef(false)
  const target = useRef(new THREE.Vector3())
  const currentRestartToken = useRef(restartToken)

  if (currentRestartToken.current !== restartToken) {
    currentRestartToken.current = restartToken
    elapsed.current = 0
    reportedRoom.current = null
    completionSent.current = false
  }

  useFrame((_, delta) => {
    if (!playing) return

    const segmentCount = tourStops.length
    const totalDuration = SEGMENT_DURATION * segmentCount
    elapsed.current += Math.min(delta, 0.05)
    if (elapsed.current >= totalDuration) {
      if (loop) {
        elapsed.current %= totalDuration
        completionSent.current = false
        reportedRoom.current = null
      } else {
        elapsed.current = totalDuration
        if (!completionSent.current) {
          completionSent.current = true
          onComplete()
        }
      }
    }

    const segment = Math.min(Math.floor(elapsed.current / SEGMENT_DURATION), segmentCount - 1)
    const start = tourStops[segment]
    const end = tourStops[(segment + 1) % segmentCount]
    const rawProgress = THREE.MathUtils.clamp(
      (elapsed.current - segment * SEGMENT_DURATION) / SEGMENT_DURATION,
      0,
      1
    )
    const pathProgress = (segment + rawProgress) / segmentCount
    const eased = rawProgress * rawProgress * (3 - 2 * rawProgress)

    camera.position.copy(positionPath.getPoint(pathProgress))
    target.current.copy(lookPath.getPoint(pathProgress))
    camera.lookAt(target.current)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(start.fov, end.fov, eased)
      camera.updateProjectionMatrix()
    }

    const activeStop = rawProgress >= 0.72 ? end : start
    if (activeStop.room !== reportedRoom.current) {
      reportedRoom.current = activeStop.room
      onRoomChange(activeStop.room)
    }
    lastPositionUpdate.current += delta
    if (lastPositionUpdate.current >= 0.22) {
      lastPositionUpdate.current = 0
      const positionDeltaX = camera.position.x - lastPosition.current.x
      const positionDeltaZ = camera.position.z - lastPosition.current.y
      if (positionDeltaX * positionDeltaX + positionDeltaZ * positionDeltaZ > 0.006) {
        lastPosition.current.set(camera.position.x, camera.position.z)
        onPositionChange({ x: camera.position.x, z: camera.position.z })
      }
    }
  })

  return null
}
