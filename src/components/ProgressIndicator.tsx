interface ProgressIndicatorProps {
  progress: number
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const pct = Math.round(progress * 100)
  return (
    <div className="progress-indicator">
      <span className="progress-pct">{String(pct).padStart(2, '0')}</span>
      <span className="progress-symbol">%</span>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
