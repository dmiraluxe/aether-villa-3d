interface PremiumUIProps {
  entered: boolean
  playing: boolean
  complete: boolean
  loop: boolean
  activeRoom: string | null
  onEnter: () => void
  onToggleTour: () => void
  onToggleLoop: () => void
  onOpenMap: () => void
}

export function PremiumUI({
  entered,
  playing,
  complete,
  loop,
  activeRoom,
  onEnter,
  onToggleTour,
  onToggleLoop,
  onOpenMap
}: PremiumUIProps) {
  if (!entered) {
    return (
      <div className="premium-intro">
        <a className="premium-brand" href="#experience" aria-label="DMIRALUXE Estates — The Office">
          DMIRALUXE
          <span>ESTATES</span>
        </a>
        <div className="premium-intro-copy">
          <span className="premium-eyebrow">A NEW PERSPECTIVE ON WORK</span>
          <h1>Where Architecture<br /><em>Meets Ambition.</em></h1>
          <p>A considered workplace, brought to life in an interactive architectural tour.</p>
        </div>
        <div className="premium-intro-footer">
          <span>DMIRALUXE ESTATES — PRIVATE OFFICE</span>
          <button className="premium-enter" onClick={onEnter}>
            ENTER THE EXPERIENCE <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="premium-header">
        <a className="premium-brand" href="#experience" aria-label="DMIRALUXE Estates — The Office">
          DMIRALUXE
          <span>ESTATES</span>
        </a>
        <div className="premium-live"><i /> LIVE WALKTHROUGH</div>
      </header>
      <div className="premium-tour-state" aria-live="polite">
        <span>{playing ? 'CINEMATIC TOUR' : 'WALKTHROUGH'}</span>
        {activeRoom && <strong>{activeRoom}</strong>}
      </div>
      <div className="premium-controls">
        <div className="premium-control-hint">
          <span>W A S D <small>MOVE</small></span>
          <span>MOUSE <small>LOOK</small></span>
          <span>SHIFT <small>RUN</small></span>
        </div>
        <div className="premium-actions">
          <button className={`premium-loop${loop ? ' is-active' : ''}`} onClick={onToggleLoop} aria-pressed={loop}>
            <span aria-hidden="true">↻</span> LOOP
          </button>
          <button className="premium-tour-toggle" onClick={onToggleTour}>
            {playing ? 'PAUSE TOUR' : complete ? 'REPLAY TOUR' : 'START TOUR'}
            <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
          </button>
          <button className="premium-map-button" onClick={onOpenMap}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 5.5 9 3l6 2 5.5-2.5v16L15 21l-6-2-5.5 2.5z" />
              <path d="M9 3v16m6-14v16" />
            </svg>
            FLOOR MAP
          </button>
        </div>
      </div>
    </>
  )
}
