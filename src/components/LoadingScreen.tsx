interface LoadingScreenProps {
  loading: boolean
  onEnter: () => void
}

export function LoadingScreen({ loading, onEnter }: LoadingScreenProps) {
  return (
    <section className={`intro-screen ${loading ? 'is-loading' : ''}`} aria-live="polite">
      <div className="intro-grain" />
      <div className="intro-topline">
        <span>DMIRALUXE</span>
        <span>OFFICE · PRIVATE VIEWING</span>
      </div>

      <div className="intro-content">
        {loading ? (
          <div className="loading-copy">
            <span className="loading-mark" />
            <p>Preparing your arrival</p>
            <span className="loading-caption">LIGHTING · MATERIALS · SPACES</span>
          </div>
        ) : (
          <>
            <p className="intro-overline">A NEW PERSPECTIVE ON WORK</p>
            <h1 className="intro-title">DMIRALUXE<span>THE OFFICE</span></h1>
            <p className="intro-tagline">Where Architecture Meets Ambition.</p>
            <button className="enter-button" onClick={onEnter}>
              ENTER THE EXPERIENCE <span aria-hidden="true">↗</span>
            </button>
            <p className="intro-hint">An interactive architectural walkthrough</p>
          </>
        )}
      </div>

      <div className="intro-footer">
        <span>AN OFFICE, REIMAGINED</span>
        {!loading && <span className="intro-index">01 — 08</span>}
      </div>
    </section>
  )
}
