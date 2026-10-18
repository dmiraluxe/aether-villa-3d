import { chapters, getChapterAtProgress } from '../config/chapters'

interface ChapterOverlayProps {
  progress: number
}

export function ChapterOverlay({ progress }: ChapterOverlayProps) {
  const chapter = getChapterAtProgress(progress)
  const localT = Math.min(
    1,
    Math.max(0, (progress - chapter.progress) / (chapter.endProgress - chapter.progress || 0.01))
  )

  // Fade in early, fade out late within chapter
  const opacity = localT < 0.15 ? localT / 0.15 : localT > 0.85 ? (1 - localT) / 0.15 : 1

  return (
    <div className="chapter-overlay" style={{ opacity }}>
      <div className="chapter-label">{chapter.label}</div>
      <h2 className="chapter-title">{chapter.title}</h2>
      {chapter.subtitle && <p className="chapter-subtitle">{chapter.subtitle}</p>}
      <p className="chapter-desc">{chapter.description}</p>
    </div>
  )
}
