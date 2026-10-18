import { useEffect, useRef, useState, type AnimationEvent, type PointerEvent } from 'react'

export interface ShowcaseSpace {
  id: string
  index: string
  name: string
  caption: string
  tone: string
  subtitle: string
  description: string
  capacity: string
  detail: string
}

export const showcaseSpaces: ShowcaseSpace[] = [
  {
    id: 'reception',
    index: '01',
    name: 'Reception',
    caption: 'THE FIRST IMPRESSION',
    tone: 'reception',
    subtitle: 'An arrival, composed.',
    description: 'A sculptural welcome anchors the entrance, setting a measured first impression in warm timber and champagne light.',
    capacity: '2 at the welcome desk',
    detail: 'Front desk & waiting lounge'
  },
  {
    id: 'central-lounge',
    index: '02',
    name: 'Central Lounge',
    caption: 'A PLACE TO CONNECT',
    tone: 'lounge',
    subtitle: 'A pause in the rhythm.',
    description: 'A generous conversational setting at the heart of the plan, where soft upholstery and a low table invite an unhurried exchange.',
    capacity: '4–6 guests',
    detail: 'Round rug & curved sofa'
  },
  {
    id: 'boardroom',
    index: '03',
    name: 'Conference Room / Boardroom',
    caption: 'STRATEGY & LEADERSHIP',
    tone: 'boardroom',
    subtitle: 'A table for what comes next.',
    description: 'A formal gathering room with a generous conference table and a composed material palette for high-level decisions.',
    capacity: '10 around the table',
    detail: 'Executive presentation suite'
  },
  {
    id: 'executive',
    index: '04',
    name: 'Executive Office',
    caption: 'PRIVATE SUITE',
    tone: 'executive',
    subtitle: 'Privacy, without excess.',
    description: 'A private office balances a considered working position with a quieter setting for one-to-one conversation.',
    capacity: 'Private office + guests',
    detail: 'Warm walnut joinery'
  },
  {
    id: 'collaboration',
    index: '05',
    name: 'Open Workstations',
    caption: 'IDEAS IN MOTION',
    tone: 'work',
    subtitle: 'Room for ideas to meet.',
    description: 'Aligned desks form an open working neighborhood on the right side of the office, with clear sightlines through the wider plan.',
    capacity: 'Shared workstations',
    detail: 'Aligned team desks'
  }
]

function SpaceArtwork({ space, snapshot }: { space: ShowcaseSpace; snapshot?: string }) {
  const prefix = `room-${space.id}`

  return (
    snapshot
      ? <img className="space-artwork" src={snapshot} alt="" />
      :
    <svg className="space-artwork" viewBox="0 0 960 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${prefix}-wall`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#51483b" />
          <stop offset=".52" stopColor="#92836a" />
          <stop offset="1" stopColor="#393a35" />
        </linearGradient>
        <linearGradient id={`${prefix}-floor`} x1="0" x2=".35" y1="0" y2="1">
          <stop stopColor="#b5a88d" />
          <stop offset=".48" stopColor="#827864" />
          <stop offset="1" stopColor="#383a36" />
        </linearGradient>
        <linearGradient id={`${prefix}-glass`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#ddcfad" stopOpacity=".7" />
          <stop offset=".45" stopColor="#d8ddcf" stopOpacity=".13" />
          <stop offset="1" stopColor="#f1e5c9" stopOpacity=".36" />
        </linearGradient>
        <linearGradient id={`${prefix}-wood`} x1="0" x2="1">
          <stop stopColor="#271d17" />
          <stop offset=".52" stopColor="#68482f" />
          <stop offset="1" stopColor="#30241a" />
        </linearGradient>
        <linearGradient id={`${prefix}-seat`} x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#d1c3a9" />
          <stop offset="1" stopColor="#897c69" />
        </linearGradient>
        <linearGradient id={`${prefix}-metal`} x1="0" x2="1">
          <stop stopColor="#7b5c35" />
          <stop offset=".45" stopColor="#ead3a0" />
          <stop offset="1" stopColor="#80613c" />
        </linearGradient>
        <radialGradient id={`${prefix}-glow`} cx=".54" cy=".35" r=".63">
          <stop stopColor="#f7e5bd" stopOpacity=".5" />
          <stop offset="1" stopColor="#f7e5bd" stopOpacity="0" />
        </radialGradient>
        <filter id={`${prefix}-shadow`} x="-.3" y="-.3" width="1.6" height="1.7">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <rect width="960" height="640" fill={`url(#${prefix}-wall)`} />
      <rect width="960" height="390" fill={`url(#${prefix}-glow)`} />
      <path d="M0 0h960v55H0z" fill="#211f1b" fillOpacity=".38" />
      <path d="M0 320 960 280v360H0z" fill={`url(#${prefix}-floor)`} />
      <path d="m0 322 960-42" stroke="#e4d2ae" strokeOpacity=".45" strokeWidth="3" />
      <g fill="none" stroke="#e8d9bc" strokeOpacity=".16">
        <path d="m0 425 960-52M0 515l960-35M0 603l960-20" />
        <path d="m150 320 115 320M375 310l30 330M620 300l-35 340M825 290l-125 350" />
      </g>
      <g>
        <path d="M75 74h276v221H75z" fill={`url(#${prefix}-glass)`} stroke="#e4d6b8" strokeOpacity=".52" strokeWidth="3" />
        <path d="M213 75v218M76 183h274" stroke="#e3d9c6" strokeOpacity=".45" strokeWidth="5" />
        <path d="M82 80h128v97H82z" fill="#cdd0c2" fillOpacity=".12" />
        <path d="M217 80h128v97H217z" fill="#eed8ac" fillOpacity=".11" />
      </g>
      <g fill={`url(#${prefix}-wood)`}>
        <path d="M392 0h37v306h-37zM441 0h15v304h-15zM469 0h48v300h-48z" />
        <path d="M876 0h28v281h-28zM917 0h43v279h-43z" />
      </g>
      <g stroke="#d2ae76" strokeOpacity=".43" strokeWidth="2">
        <path d="M433 8v294M462 8v290M525 8v286M911 8v269" />
      </g>
      <path d="M519 0h3v293h-3z" fill={`url(#${prefix}-metal)`} />
      <g fill="none" stroke="#f0ddb6" strokeOpacity=".53">
        <path d="M560 0v45M710 0v45M857 0v45" />
      </g>
      <g fill="#ead4a7" fillOpacity=".76">
        <ellipse cx="560" cy="49" rx="19" ry="3" />
        <ellipse cx="710" cy="49" rx="15" ry="2.5" />
        <ellipse cx="857" cy="49" rx="19" ry="3" />
      </g>
      <ellipse cx="508" cy="511" rx="320" ry="51" fill="#181916" fillOpacity=".47" filter={`url(#${prefix}-shadow)`} />
      {space.id === 'reception' && <ReceptionFurniture prefix={prefix} />}
      {space.id === 'central-lounge' && <LoungeFurniture prefix={prefix} />}
      {space.id === 'collaboration' && <WorkFurniture prefix={prefix} />}
      {space.id === 'boardroom' && <MeetingFurniture prefix={prefix} formal />}
      {space.id === 'executive' && <ExecutiveFurniture prefix={prefix} />}
      <rect width="960" height="640" fill="#151613" fillOpacity=".08" />
    </svg>
  )
}

function ReceptionFurniture({ prefix }: { prefix: string }) {
  return (
    <g>
      <path d="m72 478 102-29 120 24-99 34z" fill="#211c17" fillOpacity=".55" />
      <path d="m81 439 91-25 118 22-92 31z" fill={`url(#${prefix}-seat)`} />
      <path d="m81 439 91-25v31l-91 27zM172 414l118 22v29l-118-20z" fill="#9c8e78" />
      <path d="m226 431 334-25 197 50-335 38z" fill="#211c17" fillOpacity=".63" />
      <path d="m253 361 285-26 171 39-288 34z" fill="#e3d8c4" />
      <path d="m253 361 285-26v91l-288 33z" fill={`url(#${prefix}-wood)`} />
      <path d="m538 335 171 39v90l-171-38z" fill="#29231d" />
      <path d="m266 362 272-24v5l-272 25z" fill={`url(#${prefix}-metal)`} />
      <path d="M426 382h91v3h-91z" fill="#d5bd91" fillOpacity=".76" />
    </g>
  )
}

function LoungeFurniture({ prefix }: { prefix: string }) {
  return (
    <g>
      <ellipse cx="502" cy="462" rx="296" ry="77" fill="#bfb295" fillOpacity=".49" stroke={`url(#${prefix}-metal)`} strokeOpacity=".65" strokeWidth="3" />
      <path d="m252 441 100-31 333 22 75 47-103 49-334-27z" fill="#25221e" fillOpacity=".7" />
      <path d="m276 386 92-30 124 14 70 36-77 42-152-12-66-24z" fill={`url(#${prefix}-seat)`} />
      <path d="m276 386 92-30v57l-92 22zM492 370l70 36v45l-70-29z" fill="#a89a81" />
      <path d="m570 406 73-29 105 16 69 38-79 40-111-10-57-26z" fill="#b7aa91" />
      <path d="m570 406 73-29v52l-73 31zM748 393l69 38v40l-69-36z" fill="#938570" />
      <path d="m389 470 165-14 114 26-169 24z" fill="#3a2f25" />
      <path d="m405 464 148-12 95 21-150 16z" fill={`url(#${prefix}-wood)`} stroke={`url(#${prefix}-metal)`} strokeWidth="3" />
    </g>
  )
}

function WorkFurniture({ prefix }: { prefix: string }) {
  return (
    <g>
      <path d="m163 408 300-20 172 27-297 29zM433 458l297-17 154 30-299 23z" fill="#211e19" fillOpacity=".58" />
      <path d="m171 368 292-20 170 28-295 26zM439 420l289-18 148 26-291 23z" fill="#d2c5aa" />
      <path d="m171 368 292-20v16l-292 23zM439 420l289-18v16l-289 22z" fill={`url(#${prefix}-wood)`} />
      <g fill="#413831">
        <path d="m258 411 9 0-8 55h-8zM398 401h8l4 52h-8zM530 389h8l8 56h-8z" />
        <path d="m531 464 9 0-8 48h-8zM674 451h8l4 50h-8zM801 442h8l5 52h-8z" />
      </g>
      <g fill={`url(#${prefix}-seat)`}>
        <path d="m300 337 38-4 10 34-41 5zM557 352l39-3 9 32-42 5z" />
        <path d="m610 399 37-3 10 31-41 4zM767 389l38-3 10 29-42 4z" />
      </g>
    </g>
  )
}

function MeetingFurniture({ prefix, formal }: { prefix: string; formal: boolean }) {
  return (
    <g>
      <path d="m185 418 291-69 354 61-292 99z" fill="#1d1c18" fillOpacity=".62" />
      <path d="m202 365 277-63 325 57-281 76z" fill={formal ? `url(#${prefix}-wood)` : '#b7aa90'} stroke={`url(#${prefix}-metal)`} strokeWidth="3" />
      <path d="m478 435 18 0-5 58-17 4zM765 360h17l11 67-18-4z" fill="#45372a" />
      <g fill="#494037">
        <path d="m269 334 37-10 13 39-40 11zM382 307l38-9 13 37-41 10zM535 304l39 7 8 40-40-8zM675 328l39 7 11 39-42-7z" />
        <path d="m311 422 39 5 4 42-43-5zM439 448l41 7 1 40-43-4zM604 437l41-7 13 38-45 8zM712 406l42-8 14 38-44 8z" />
      </g>
      <g fill={`url(#${prefix}-seat)`}>
        <path d="m269 315 38-10 12 37-40 10zM382 288l39-9 12 36-42 10zM535 285l40 7 8 38-42-7zM675 309l41 7 11 37-43-7z" />
      </g>
      {!formal && <path d="m743 70 104-1 1 213-105 7z" fill={`url(#${prefix}-glass)`} stroke="#e7decc" strokeOpacity=".55" strokeWidth="3" />}
      {formal && <path d="M705 107h92v4h-92zM718 91h66v3h-66z" fill="#d1b27d" fillOpacity=".56" />}
    </g>
  )
}

function ExecutiveFurniture({ prefix }: { prefix: string }) {
  return (
    <g>
      <path d="m285 424 282-49 192 37-285 65z" fill="#201c18" fillOpacity=".62" />
      <path d="m302 368 265-49 177 33-268 59z" fill={`url(#${prefix}-wood)`} stroke={`url(#${prefix}-metal)`} strokeWidth="3" />
      <path d="m452 411 18 2-7 66-18-2zM705 360h17l13 63-17-3z" fill="#403329" />
      <path d="m520 328 54-9 10 28-58 11z" fill="#d9d0bf" />
      <path d="m430 385 63-10 2 5-63 12z" fill={`url(#${prefix}-metal)`} />
      <path d="m653 430 56-14 30 16-58 18z" fill="#b3a48b" />
      <path d="m657 430 52-13 26 14-55 16z" fill="#d1c5ae" />
      <path d="m681 446 13-1 2 26-13 1z" fill="#4a3a2c" />
      <path d="m734 118 96-2 1 181-98 4z" fill={`url(#${prefix}-glass)`} stroke="#e7decc" strokeOpacity=".56" strokeWidth="3" />
    </g>
  )
}

export function SpaceShowcase({
  onSelect,
  snapshots = {}
}: {
  onSelect: (space: ShowcaseSpace) => void
  snapshots?: Record<string, string>
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const [revealed, setRevealed] = useState(false)
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false })

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  const moveCursor = (event: PointerEvent<HTMLElement>) => {
    const bounds = sectionRef.current?.getBoundingClientRect()
    if (!bounds) return
    const overCard = event.target instanceof Element && event.target.closest('.space-card') !== null
    setCursor({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      visible: overCard && event.pointerType === 'mouse'
    })
  }

  return (
    <section
      className={`spaces-section${revealed ? ' spaces-revealed' : ''}`}
      id="spaces"
      ref={sectionRef}
      onPointerMove={moveCursor}
      onPointerLeave={() => setCursor((current) => ({ ...current, visible: false }))}
    >
      <div className="section-index">03 <span>—</span> SPACES</div>
      <div className="spaces-header">
        <div className="spaces-title-reveal">
          <h2>Made for every<br /><em>kind of conversation.</em></h2>
        </div>
        <p>From a considered arrival to the room where the next big decision takes shape.</p>
      </div>
      <div className="spaces-grid">
        {showcaseSpaces.map((space) => (
          <button
            key={space.id}
            type="button"
            className={`space-card ${space.tone}`}
            onClick={() => onSelect(space)}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') moveCursor(event)
            }}
            aria-label={`View ${space.name}: ${space.caption.toLowerCase()}`}
          >
            <div className="space-art">
              <SpaceArtwork space={space} snapshot={snapshots[space.id]} />
              <span className="space-art-index">{space.index}<i> — {space.name.toUpperCase()}</i></span>
              <span className="space-art-caption">DMIRALUXE <i>—</i> THE OFFICE</span>
            </div>
            <span className="space-card-frame" aria-hidden="true" />
            <div className="space-card-copy">
              <span>{space.caption}</span>
              <h3>{space.name}</h3>
              <i aria-hidden="true">↗</i>
            </div>
            <div className="space-card-stats" aria-hidden="true">
              <span><small>CAPACITY</small>{space.capacity}</span>
              <span><small>SIGNATURE DETAIL</small>{space.detail}</span>
            </div>
          </button>
        ))}
      </div>
      <div
        className={`space-cursor${cursor.visible ? ' is-visible' : ''}`}
        style={{ left: cursor.x, top: cursor.y }}
        aria-hidden="true"
      >
        VIEW SPACE <span>→</span>
      </div>
    </section>
  )
}

export function SpaceDetailCurtain({
  space,
  snapshot,
  onClose,
  onExplore
}: {
  space: ShowcaseSpace
  snapshot?: string
  onClose: () => void
  onExplore: () => void
}) {
  const [closing, setClosing] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const nextAction = useRef<(() => void) | null>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setClosing(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const finishClosing = (event: AnimationEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget || !closing || event.animationName !== 'space-curtain-exit') return
    onClose()
    nextAction.current?.()
  }

  return (
    <div
      className="space-curtain-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) setClosing(true)
      }}
    >
      <section
        className={`space-curtain${closing ? ' is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="space-detail-title"
        onClick={(event) => event.stopPropagation()}
        onAnimationEnd={finishClosing}
      >
        <div className="space-curtain-visual">
          <SpaceArtwork space={space} snapshot={snapshot} />
          <span>{space.index} <i>—</i> {space.name.toUpperCase()}</span>
        </div>
        <div className="space-curtain-content">
          <div className="space-curtain-topline">DMIRALUXE <span>THE OFFICE</span></div>
          <p className="space-curtain-index">{space.index} / FIVE SPACES</p>
          <h2 id="space-detail-title">{space.name}<br /><em>{space.subtitle}</em></h2>
          <p className="space-curtain-description">{space.description}</p>
          <div className="space-detail-stats">
            <div><span>CAPACITY</span><strong>{space.capacity}</strong></div>
            <div><span>SIGNATURE DETAIL</span><strong>{space.detail}</strong></div>
          </div>
          <button
            type="button"
            className="space-explore-button"
            onClick={() => {
              nextAction.current = onExplore
              setClosing(true)
            }}
          >
            EXPLORE THIS SPACE <span aria-hidden="true">↗</span>
          </button>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          className="space-curtain-close"
          aria-label="Close space details"
          onClick={() => setClosing(true)}
        >
          <span aria-hidden="true">×</span> CLOSE
        </button>
      </section>
    </div>
  )
}
