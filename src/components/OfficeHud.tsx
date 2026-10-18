import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { officeRooms } from '../config/officeLayout'

interface Movement {
  forward: number
  strafe: number
}

interface OfficeHudProps {
  activeRoom: string | null
  onMoveStick: (movement: Movement) => void
}

function MovementJoystick({ onMove }: { onMove: (movement: Movement) => void }) {
  const baseRef = useRef<HTMLDivElement>(null)
  const pointerId = useRef<number | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const update = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = baseRef.current?.getBoundingClientRect()
    if (!bounds) return
    const radius = bounds.width * 0.32
    const dx = event.clientX - (bounds.left + bounds.width / 2)
    const dy = event.clientY - (bounds.top + bounds.height / 2)
    const length = Math.hypot(dx, dy)
    const scale = length > radius ? radius / length : 1
    const x = dx * scale
    const y = dy * scale
    setOffset({ x, y })
    onMove({ strafe: x / radius, forward: -y / radius })
  }

  const reset = () => {
    pointerId.current = null
    setOffset({ x: 0, y: 0 })
    onMove({ forward: 0, strafe: 0 })
  }

  return (
    <div
      ref={baseRef}
      className="movement-joystick"
      aria-label="Virtual movement joystick"
      onPointerDown={(event) => {
        pointerId.current = event.pointerId
        event.currentTarget.setPointerCapture(event.pointerId)
        update(event)
      }}
      onPointerMove={(event) => {
        if (event.pointerId === pointerId.current) update(event)
      }}
      onPointerUp={(event) => {
        if (event.pointerId === pointerId.current) reset()
      }}
      onPointerCancel={reset}
    >
      <span className="joystick-ring" />
      <span className="joystick-knob" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} />
    </div>
  )
}

export function OfficeHud({ activeRoom, onMoveStick }: OfficeHudProps) {
  const room = officeRooms.find((item) => item.name === activeRoom)
  return (
    <>
      {room && (
        <aside className="room-arrival" key={room.id} aria-live="polite">
          <span className="arrival-rule" />
          <div><h2>{room.name}</h2><p>{room.subtitle}</p></div>
        </aside>
      )}
      <div className="walkthrough-controls">
        <span className="key-cluster"><b>W</b><span><b>A</b><b>S</b><b>D</b></span></span>
        <span>MOVE</span><i />
        <span>MOUSE</span><span>LOOK</span><i />
        <span><b>SHIFT</b>&nbsp; RUN</span>
      </div>
      <MovementJoystick onMove={onMoveStick} />
    </>
  )
}

export function MobileJoystick({ onMoveStick }: Pick<OfficeHudProps, 'onMoveStick'>) {
  return <MovementJoystick onMove={onMoveStick} />
}
