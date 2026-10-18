import * as THREE from 'three'

export interface CameraWaypoint {
  progress: number
  position: [number, number, number]
  target: [number, number, number]
  fov: number
  /** Optional ease for this segment */
  ease?: string
}

/**
 * Camera path for the procedural villa.
 * Positions are carefully chosen so the camera stays outside walls
 * and can pass through the front doorway opening.
 */
export const cameraPath: CameraWaypoint[] = [
  // 0 — Establishing exterior three-quarter
  {
    progress: 0.0,
    position: [9.5, 4.2, 11.5],
    target: [0, 1.6, 0],
    fov: 42
  },
  // 1 — Closer exterior
  {
    progress: 0.12,
    position: [6.8, 3.4, 8.2],
    target: [0.2, 1.5, 0.3],
    fov: 40
  },
  // 2 — Approach front door
  {
    progress: 0.22,
    position: [0.0, 1.7, 7.5],
    target: [0, 1.55, 1.5],
    fov: 45
  },
  // 3 — Just outside door
  {
    progress: 0.30,
    position: [0.0, 1.65, 4.8],
    target: [0, 1.55, 0.5],
    fov: 48
  },
  // 4 — Through doorway into foyer
  {
    progress: 0.38,
    position: [0.0, 1.6, 1.8],
    target: [0, 1.5, -1.5],
    fov: 50
  },
  // 5 — Living area
  {
    progress: 0.50,
    position: [-1.2, 1.7, -0.8],
    target: [1.5, 1.3, -2.5],
    fov: 48
  },
  // 6 — Kitchen view
  {
    progress: 0.62,
    position: [2.2, 1.75, -1.0],
    target: [3.8, 1.2, -3.2],
    fov: 46
  },
  // 7 — Elevated reveal
  {
    progress: 0.78,
    position: [0.5, 5.8, 4.5],
    target: [0, 1.2, -1.0],
    fov: 50
  },
  // 8 — Final polished composition
  {
    progress: 1.0,
    position: [7.5, 3.8, 9.0],
    target: [0, 1.8, 0],
    fov: 40
  }
]

/** Linear interpolation between waypoints based on global progress 0-1 */
export function sampleCameraPath(progress: number): {
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
} {
  const p = Math.max(0, Math.min(1, progress))
  const path = cameraPath

  // Find surrounding waypoints
  let i = 0
  while (i < path.length - 1 && path[i + 1].progress <= p) i++

  const a = path[i]
  const b = path[Math.min(i + 1, path.length - 1)]

  const range = b.progress - a.progress || 1
  const t = (p - a.progress) / range
  // Smoothstep for less robotic motion
  const st = t * t * (3 - 2 * t)

  const position = new THREE.Vector3(
    a.position[0] + (b.position[0] - a.position[0]) * st,
    a.position[1] + (b.position[1] - a.position[1]) * st,
    a.position[2] + (b.position[2] - a.position[2]) * st
  )
  const target = new THREE.Vector3(
    a.target[0] + (b.target[0] - a.target[0]) * st,
    a.target[1] + (b.target[1] - a.target[1]) * st,
    a.target[2] + (b.target[2] - a.target[2]) * st
  )
  const fov = a.fov + (b.fov - a.fov) * st

  return { position, target, fov }
}
