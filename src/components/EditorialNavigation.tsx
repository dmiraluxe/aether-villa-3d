import { useEffect, useRef, useState } from 'react'

const chapters = [
  { id: 'the-office', number: '01', label: 'The Office' },
  { id: 'architecture', number: '02', label: 'Architecture' },
  { id: 'spaces', number: '03', label: 'The Spaces' },
  { id: 'amenities', number: '04', label: 'Amenities' },
  { id: 'experience-story', number: '05', label: 'Experience' },
  { id: 'private-viewing', number: '06', label: 'Private Viewing' }
]

export function EditorialNavigation() {
  const [activeChapter, setActiveChapter] = useState(0)
  const pageProgressRef = useRef<HTMLSpanElement>(null)
  const chapterProgressRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const targets = chapters
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    if (targets.length !== chapters.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          const nextIndex = targets.indexOf(visible.target as HTMLElement)
          setActiveChapter(nextIndex)
          chapterProgressRef.current?.style.setProperty('--chapter-progress', `${(nextIndex + 1) / chapters.length}`)
        }
      },
      { rootMargin: '-38% 0px -48% 0px', threshold: [0, 0.1, 0.3, 0.6] }
    )

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0
      pageProgressRef.current?.style.setProperty('--page-progress', `${progress}`)
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    updateProgress()
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <>
      <div className="page-progress" aria-hidden="true">
        <span ref={pageProgressRef} />
      </div>
      <nav className="chapter-nav" aria-label="Explore the website">
        <span className="chapter-nav-progress" ref={chapterProgressRef} aria-hidden="true" />
        <ol>
          {chapters.map((chapter, index) => (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className={index === activeChapter ? 'is-active' : ''}
                aria-label={`${chapter.number} — ${chapter.label}`}
                aria-current={index === activeChapter ? 'location' : undefined}
              >
                <span>{chapter.number}</span>
                <i>{chapter.label}</i>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
