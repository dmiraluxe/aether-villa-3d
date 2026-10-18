import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { collisionBoxes, mainEntrance, officeRooms } from '../config/officeLayout'

type Position = { x: number; z: number }

interface CameraRigProps {
  active: boolean
  destination: [number, number] | null
  joystick: { forward: number; strafe: number }
  onExit: () => void
  onPositionChange: (position: Position) => void
  onRoomChange: (room: string | null) => void
}

const PLAYER_RADIUS = 0.28
const NAV_GRID_STEP = 0.4

function blocked(x: number, z: number) {
  if (x < -13.4 || x > 13.3 || z < -8 || z > 8.25) return true
  return collisionBoxes.some(
    ({ minX, maxX, minZ, maxZ }) =>
      x + PLAYER_RADIUS > minX &&
      x - PLAYER_RADIUS < maxX &&
      z + PLAYER_RADIUS > minZ &&
      z - PLAYER_RADIUS < maxZ
  )
}

function findNavigationPath(start: THREE.Vector3, destination: THREE.Vector3): THREE.Vector3[] | null {
  const minX = -13.2
  const minZ = -7.8
  const width = Math.floor(26.4 / NAV_GRID_STEP) + 1
  const height = Math.floor(15.6 / NAV_GRID_STEP) + 1
  const toWorld = (index: number) => ({
    x: minX + (index % width) * NAV_GRID_STEP,
    z: minZ + Math.floor(index / width) * NAV_GRID_STEP
  })
  const isOpen = (x: number, z: number) =>
    x >= 0 && x < width && z >= 0 && z < height &&
    !blocked(minX + x * NAV_GRID_STEP, minZ + z * NAV_GRID_STEP)
  const nearestOpen = (point: THREE.Vector3) => {
    const originX = THREE.MathUtils.clamp(Math.round((point.x - minX) / NAV_GRID_STEP), 0, width - 1)
    const originZ = THREE.MathUtils.clamp(Math.round((point.z - minZ) / NAV_GRID_STEP), 0, height - 1)
    for (let radius = 0; radius <= 10; radius += 1) {
      let nearest = -1
      let nearestDistance = Infinity
      for (let z = originZ - radius; z <= originZ + radius; z += 1) {
        for (let x = originX - radius; x <= originX + radius; x += 1) {
          if (Math.max(Math.abs(x - originX), Math.abs(z - originZ)) !== radius || !isOpen(x, z)) continue
          const distance = (x * NAV_GRID_STEP + minX - point.x) ** 2 +
            (z * NAV_GRID_STEP + minZ - point.z) ** 2
          if (distance < nearestDistance) {
            nearest = z * width + x
            nearestDistance = distance
          }
        }
      }
      if (nearest !== -1) return nearest
    }
    return -1
  }

  const startIndex = nearestOpen(start)
  const goalIndex = nearestOpen(destination)
  if (startIndex < 0 || goalIndex < 0) return null

  const count = width * height
  const parents = new Int32Array(count).fill(-1)
  const visited = new Uint8Array(count)
  const queue = [startIndex]
  visited[startIndex] = 1
  const offsets = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1]
  ] as const
  let queueIndex = 0
  while (queueIndex < queue.length && !visited[goalIndex]) {
    const current = queue[queueIndex]
    queueIndex += 1
    const currentX = current % width
    const currentZ = Math.floor(current / width)
    for (const [offsetX, offsetZ] of offsets) {
      const nextX = currentX + offsetX
      const nextZ = currentZ + offsetZ
      if (!isOpen(nextX, nextZ)) continue
      if (offsetX !== 0 && offsetZ !== 0 &&
        (!isOpen(currentX + offsetX, currentZ) || !isOpen(currentX, currentZ + offsetZ))) continue
      const next = nextZ * width + nextX
      if (visited[next]) continue
      visited[next] = 1
      parents[next] = current
      queue.push(next)
    }
  }
  if (!visited[goalIndex]) return null

  const gridPath: number[] = []
  for (let current = goalIndex; current !== -1; current = parents[current]) {
    gridPath.push(current)
    if (current === startIndex) break
  }
  gridPath.reverse()
  const clearLine = (from: number, to: number) => {
    const startPoint = toWorld(from)
    const endPoint = toWorld(to)
    const distance = Math.hypot(endPoint.x - startPoint.x, endPoint.z - startPoint.z)
    const samples = Math.ceil(distance / 0.14)
    for (let step = 1; step < samples; step += 1) {
      const ratio = step / samples
      if (blocked(
        THREE.MathUtils.lerp(startPoint.x, endPoint.x, ratio),
        THREE.MathUtils.lerp(startPoint.z, endPoint.z, ratio)
      )) return false
    }
    return true
  }
  const waypoints: THREE.Vector3[] = []
  let anchor = 0
  while (anchor < gridPath.length - 1) {
    let furthest = anchor + 1
    for (let candidate = gridPath.length - 1; candidate > anchor + 1; candidate -= 1) {
      if (clearLine(gridPath[anchor], gridPath[candidate])) {
        furthest = candidate
        break
      }
    }
    const point = toWorld(gridPath[furthest])
    waypoints.push(new THREE.Vector3(point.x, start.y, point.z))
    anchor = furthest
  }
  return waypoints
}

export function CameraRig({
  active,
  destination,
  joystick,
  onExit,
  onPositionChange,
  onRoomChange
}: CameraRigProps) {
  const { camera, gl } = useThree()
  const position = useRef(new THREE.Vector3(mainEntrance[0], 1.65, mainEntrance[1]))
  const yaw = useRef(-0.02)
  const pitch = useRef(-0.04)
  const keys = useRef(new Set<string>())
  const dragging = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  const activeRoom = useRef<string | null>(null)
  const lastReportedPosition = useRef(new THREE.Vector3())
  const navigation = useRef<{
    waypoints: THREE.Vector3[]
    waypointIndex: number
    yaw: number
    active: boolean
  } | null>(null)

  useEffect(() => {
    if (active) {
      navigation.current = null
      position.current.copy(camera.position)
      yaw.current = camera.rotation.y
      pitch.current = camera.rotation.x
      lastReportedPosition.current.copy(camera.position)
    }
  }, [active, camera])

  useEffect(() => {
    if (destination) {
      const destinationPosition = new THREE.Vector3(destination[0], 1.65, destination[1])
      const room = officeRooms.find(({ entry }) => entry[0] === destination[0] && entry[1] === destination[1])
      const path = findNavigationPath(position.current, destinationPosition)
      if (!path) {
        navigation.current = null
        console.warn(
          `No clear route found to ${room?.name ?? 'the selected destination'}: ` +
          `(${position.current.x.toFixed(2)}, ${position.current.z.toFixed(2)}) to ` +
          `(${destination[0].toFixed(2)}, ${destination[1].toFixed(2)}).`
        )
        return
      }
      navigation.current = { waypoints: path, waypointIndex: 0, yaw: yaw.current, active: true }
      if (room) {
        navigation.current.yaw = Math.atan2(
          -(room.center[0] - destination[0]),
          -(room.center[1] - destination[1])
        )
        pitch.current = -0.04
      }
    }
  }, [destination])

  useEffect(() => {
    const element = gl.domElement
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onExit()
        return
      }
      const key = event.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'shift'].includes(key)) {
        navigation.current = null
        keys.current.add(key)
        event.preventDefault()
      }
    }
    const keyUp = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase())
    const pointerDown = (event: PointerEvent) => {
      if (!active || (event.target instanceof Element && event.target.closest('button'))) return
      dragging.current = true
      lastPointer.current = { x: event.clientX, y: event.clientY }
      if (event.pointerType === 'mouse' && document.pointerLockElement !== element) {
        try {
          element.requestPointerLock?.()
        } catch (error) {
          console.warn('Pointer lock is unavailable; drag to look around instead.', error)
        }
      }
    }
    const pointerUp = () => {
      dragging.current = false
    }
    const pointerMove = (event: PointerEvent) => {
      if (!active || (!dragging.current && document.pointerLockElement !== element)) return
      const locked = document.pointerLockElement === element
      const dx = locked ? event.movementX : event.clientX - lastPointer.current.x
      const dy = locked ? event.movementY : event.clientY - lastPointer.current.y
      lastPointer.current = { x: event.clientX, y: event.clientY }
      navigation.current = null
      yaw.current -= dx * 0.0024
      pitch.current = THREE.MathUtils.clamp(pitch.current - dy * 0.002, -1.12, 1.12)
    }
    const pointerLockChange = () => {
      if (document.pointerLockElement !== element) dragging.current = false
    }
    const wheel = (event: WheelEvent) => {
      if (!active || document.pointerLockElement !== element) return
      event.preventDefault()
      document.exitPointerLock()
      window.scrollBy({ top: event.deltaY, behavior: 'auto' })
    }

    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    window.addEventListener('pointerup', pointerUp)
    window.addEventListener('pointermove', pointerMove)
    element.addEventListener('pointerdown', pointerDown)
    document.addEventListener('pointerlockchange', pointerLockChange)
    window.addEventListener('wheel', wheel, { passive: false })
    return () => {
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('pointerup', pointerUp)
      window.removeEventListener('pointermove', pointerMove)
      element.removeEventListener('pointerdown', pointerDown)
      document.removeEventListener('pointerlockchange', pointerLockChange)
      window.removeEventListener('wheel', wheel)
      if (document.pointerLockElement === element) document.exitPointerLock()
    }
  }, [active, gl, onExit])

  useFrame((_, rawDelta) => {
    if (!active) return
    const delta = Math.min(rawDelta, 0.05)
    const held = keys.current
    const forward = THREE.MathUtils.clamp(Number(held.has('w')) - Number(held.has('s')) + joystick.forward, -1, 1)
    const strafe = THREE.MathUtils.clamp(Number(held.has('d')) - Number(held.has('a')) + joystick.strafe, -1, 1)
    const route = navigation.current
    if (route && (forward || strafe)) navigation.current = null
    if (route?.active && !forward && !strafe) {
      const waypoint = route.waypoints[route.waypointIndex]
      if (waypoint) {
        const distance = position.current.distanceTo(waypoint)
        if (distance < 0.1) {
          position.current.copy(waypoint)
          route.waypointIndex += 1
          if (route.waypointIndex >= route.waypoints.length) route.active = false
        } else {
          const nextX = THREE.MathUtils.damp(position.current.x, waypoint.x, 4.2, delta)
          const nextZ = THREE.MathUtils.damp(position.current.z, waypoint.z, 4.2, delta)
          if (!blocked(nextX, position.current.z)) position.current.x = nextX
          if (!blocked(position.current.x, nextZ)) position.current.z = nextZ
        }
      } else {
        route.active = false
      }
    } else if (forward || strafe) {
      const length = Math.hypot(forward, strafe) || 1
      const speed = held.has('shift') ? 5.3 : 3
      const f = (forward / length) * speed * delta
      const s = (strafe / length) * speed * delta
      const dx = -Math.sin(yaw.current) * f + Math.cos(yaw.current) * s
      const dz = -Math.cos(yaw.current) * f - Math.sin(yaw.current) * s
      if (!blocked(position.current.x + dx, position.current.z)) position.current.x += dx
      if (!blocked(position.current.x, position.current.z + dz)) position.current.z += dz
    }

    if (navigation.current && !forward && !strafe) {
      const yawDelta = Math.atan2(
        Math.sin(navigation.current.yaw - yaw.current),
        Math.cos(navigation.current.yaw - yaw.current)
      )
      yaw.current += yawDelta * (1 - Math.exp(-4.2 * delta))
    }
    camera.position.copy(position.current)
    camera.rotation.order = 'YXZ'
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ')

    const room = officeRooms.find(({ center: [x, z], radius }) => {
      const dx = position.current.x - x
      const dz = position.current.z - z
      return Math.hypot(dx, dz) <= radius
    })?.name ?? null
    if (room !== activeRoom.current) {
      activeRoom.current = room
      onRoomChange(room)
    }
    if (position.current.distanceToSquared(lastReportedPosition.current) > 0.04) {
      lastReportedPosition.current.copy(position.current)
      onPositionChange({ x: position.current.x, z: position.current.z })
    }
  })

  return null
}
