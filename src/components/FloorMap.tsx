interface FloorMapProps {
  position: { x: number; z: number }
  onClose: () => void
}

export function FloorMapButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="floor-map-button" onClick={onClick} aria-label="Open the office floor map">
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M3.25 4.25 7.8 2.5l4.4 1.6 4.55-1.7v13.35L12.2 17.5 7.8 16l-4.55 1.7V4.25Z" />
        <path d="M7.8 2.5V16m4.4-11.9v13.4" />
      </svg>
      FLOOR MAP
    </button>
  )
}

export function FloorMapOverlay({ position, onClose }: FloorMapProps) {
  const markerX = Math.min(99, Math.max(1, (position.x * 56 + 768) / 15.36))
  const markerY = Math.min(99, Math.max(1, (position.z * 56 + 482) / 10.24))
  return (
    <div className="floor-map-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="floor-map-panel" role="dialog" aria-modal="true" aria-labelledby="floor-map-heading">
        <div className="floor-map-heading">
          <div>
            <span>DMIRALUXE · LEVEL 01</span>
            <h2 id="floor-map-heading">Your position</h2>
          </div>
          <button className="floor-map-close" onClick={onClose} aria-label="Close floor map">×</button>
        </div>
        <div className="floor-map-image-wrap">
          <img src="/images/office-reference.jpg" alt="Office floor layout reference" />
          <span className="floor-map-position" style={{ left: `${markerX}%`, top: `${markerY}%` }} aria-label="Your current position" />
        </div>
        <p className="floor-map-caption"><i /> YOUR POSITION <span>Approximate spatial reference</span></p>
      </section>
    </div>
  )
}
