import { officeRooms } from '../config/officeLayout'

interface CabinNavigatorProps {
  active: boolean
  activeRoom: string | null
  onSelect: (roomId: string, destination: [number, number]) => void
}

const navigationItems = [
  { roomId: 'reception', label: 'Reception', note: 'Arrival' },
  { roomId: 'meeting', label: 'Conference room', note: 'Focused exchange' },
  { roomId: 'boardroom', label: 'Boardroom', note: 'Leadership' },
  { roomId: 'executive', label: 'Executive office', note: 'Private suite' },
  { roomId: 'collaboration', label: 'Open workstations', note: 'Ideas in motion' },
  { roomId: 'central-lounge', label: 'Lounge area', note: 'Pause & connect' }
]

export function CabinNavigator({ active, activeRoom, onSelect }: CabinNavigatorProps) {
  return (
    <nav className="cabin-navigator" aria-label="Explore office spaces">
      <div className="cabin-navigator-heading">
        <span>THE OFFICE</span>
        <span>EXPLORE SPACES</span>
      </div>
      <div className="cabin-navigator-list">
        {navigationItems.map((item, index) => {
          const room = officeRooms.find(({ id }) => id === item.roomId)
          const selected = active && room?.name === activeRoom
          return (
            <button
              key={item.roomId}
              className={`cabin-navigator-item${selected ? ' is-active' : ''}`}
              onClick={() => room && onSelect(item.roomId, [...room.entry])}
            >
              <span className="cabin-navigator-index">0{index + 1}</span>
              <span className="cabin-navigator-label">
                <strong>{item.label}</strong>
                <small>{item.note}</small>
              </span>
              <span className="cabin-navigator-arrow" aria-hidden="true">↗</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
