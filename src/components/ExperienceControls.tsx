interface ExperienceControlsProps {
  onToggleXray: () => void
  xrayActive: boolean
  onBook: () => void
}

export function ExperienceControls({ onToggleXray, xrayActive, onBook }: ExperienceControlsProps) {
  return (
    <div className="experience-controls">
      <button
        className={`ctrl-btn ${xrayActive ? 'active' : ''}`}
        onClick={onToggleXray}
        title="Toggle X-ray view"
      >
        X-ray
      </button>
      <button className="ctrl-btn primary" onClick={onBook}>
        Book a visit
      </button>
    </div>
  )
}
