import { Suspense, lazy, useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { mainEntrance, officeRooms } from './config/officeLayout'
import { CabinNavigator } from './components/CabinNavigator'
import { FloorMapOverlay } from './components/FloorMap'
import { MobileJoystick } from './components/OfficeHud'
import { PremiumUI } from './components/PremiumUI'
import { SpaceDetailCurtain, SpaceShowcase, type ShowcaseSpace } from './components/SpaceShowcase'
import { EditorialNavigation } from './components/EditorialNavigation'
import './styles/global.css'
import './styles/experience.css'

const ExperienceCanvas = lazy(() =>
  import('./components/ExperienceCanvas').then(({ ExperienceCanvas: canvas }) => ({ default: canvas }))
)

type Position = { x: number; z: number }

export default function App() {
  const siteRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const [entered, setEntered] = useState(false)
  const [tourPlaying, setTourPlaying] = useState(false)
  const [tourComplete, setTourComplete] = useState(false)
  const [tourLoop, setTourLoop] = useState(true)
  const [tourRestartToken, setTourRestartToken] = useState(0)
  const [experienceVisible, setExperienceVisible] = useState(true)
  const [position, setPosition] = useState<Position>({ x: mainEntrance[0], z: mainEntrance[1] })
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [destination, setDestination] = useState<[number, number] | null>(null)
  const [joystick, setJoystick] = useState({ forward: 0, strafe: 0 })
  const [mapOpen, setMapOpen] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<ShowcaseSpace | null>(null)
  const [spaceSnapshots, setSpaceSnapshots] = useState<Record<string, string>>({})
  const [inquiryStatus, setInquiryStatus] = useState('')

  const submitViewingInquiry = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const company = String(formData.get('company') ?? '').trim()
    const timing = String(formData.get('timing') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()
    const subject = `Private viewing request — ${name}`
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      company && `Company: ${company}`,
      timing && `Preferred timing: ${timing}`,
      '',
      message && `Message: ${message}`
    ].filter(Boolean).join('\n')

    setInquiryStatus('Your email app should open with the inquiry prepared. Send the email to complete your request.')
    window.location.href = `mailto:CEO.DIVEXA@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [])

  const enterWalkthrough = useCallback(() => {
    setEntered(true)
    setTourComplete(false)
    setTourPlaying(true)
  }, [])
  const toggleTour = useCallback(() => {
    if (tourPlaying) {
      setTourPlaying(false)
      return
    }
    if (tourComplete) {
      setTourRestartToken((token) => token + 1)
      setTourComplete(false)
    }
    setTourPlaying(true)
  }, [tourComplete, tourPlaying])
  const navigateToRoom = useCallback((roomId: string, roomPosition: [number, number]) => {
    setTourPlaying(false)
    setTourComplete(false)
    setTourRestartToken((token) => token + 1)
    setDestination(roomPosition)
    const room = officeRooms.find(({ id }) => id === roomId)
    if (room) setActiveRoom(room.name)
  }, [])
  const scrollToOffice = useCallback(() => {
    document.getElementById('the-office')?.scrollIntoView({ behavior: 'smooth' })
  }, [])
  const exploreSpace = useCallback((space: ShowcaseSpace) => {
    navigateToRoom(space.id, officeRoomsPosition(space.id))
    setEntered(true)
    document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [navigateToRoom])
  const selectSpace = useCallback((space: ShowcaseSpace) => {
    setSelectedSpace(space)
    setEntered(true)
    navigateToRoom(space.id, officeRoomsPosition(space.id))
  }, [navigateToRoom])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const observer = new IntersectionObserver(
      ([entry]) => setExperienceVisible(entry.isIntersecting && entry.intersectionRatio >= 0.3),
      { threshold: [0, 0.3, 0.6] }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const site = siteRef.current
    if (!site || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = site.querySelectorAll<HTMLElement>([
      '.editorial-section .section-index',
      '.editorial-section h2',
      '.editorial-copy',
      '.office-stats > *',
      '.architecture-section .section-index',
      '.architecture-heading',
      '.material-card',
      '.amenities-section .section-index',
      '.amenities-layout > div:first-child',
      '.amenities-list article',
      '.experience-story-section .section-index',
      '.experience-story-copy',
      '.private-viewing-section .section-index',
      '.private-viewing-content > span',
      '.private-viewing-content h2',
      '.private-viewing-content > p',
      '.viewing-form',
      '.site-footer > *'
    ].join(','))
    const siblingIndex = new Map<HTMLElement, number>()
    const sections = site.querySelectorAll<HTMLElement>(
      '.editorial-section, .architecture-section, .amenities-section, .experience-story-section, .private-viewing-section'
    )

    targets.forEach((target) => {
      const section = target.closest<HTMLElement>('section')
      const index = section ? siblingIndex.get(section) ?? 0 : 0
      if (section) siblingIndex.set(section, index + 1)
      target.dataset.editorialReveal = ''
      target.style.setProperty('--reveal-delay', `${Math.min(index * 85, 340)}ms`)
    })

    site.classList.add('motion-ready')
    const revealedSections = new Set<HTMLElement>()
    const revealInView = () => {
      sections.forEach((section) => {
        if (revealedSections.has(section)) return
        const bounds = section.getBoundingClientRect()
        if (bounds.top > window.innerHeight * 0.88 || bounds.bottom < 0) return
        section.querySelectorAll<HTMLElement>('[data-editorial-reveal]')
          .forEach((target) => target.classList.add('is-editorial-visible'))
        revealedSections.add(section)
      })
    }

    window.addEventListener('scroll', revealInView, { passive: true })
    window.addEventListener('resize', revealInView)
    revealInView()
    return () => {
      window.removeEventListener('scroll', revealInView)
      window.removeEventListener('resize', revealInView)
      site.classList.remove('motion-ready')
    }
  }, [])

  return (
    <main className="site-shell" ref={siteRef}>
      <EditorialNavigation />
      <section className="experience-section" id="experience" ref={heroRef}>
        <div className="experience-canvas">
          {entered && (
            <Suspense fallback={
              <div className="experience-loading" role="status">
                <span>DMIRALUXE</span>
                <p>PREPARING THE EXPERIENCE</p>
                <i />
              </div>
            }>
              <ExperienceCanvas
                active={experienceVisible || selectedSpace !== null}
                visible={experienceVisible || selectedSpace !== null}
                tourPlaying={tourPlaying}
                tourLoop={tourLoop}
                tourRestartToken={tourRestartToken}
                destination={destination}
                joystick={joystick}
                onExit={() => setEntered(false)}
                onPositionChange={setPosition}
                onRoomChange={setActiveRoom}
                onTourComplete={() => {
                  setTourPlaying(false)
                  setTourComplete(true)
                }}
                onSpaceSnapshotsReady={setSpaceSnapshots}
              />
            </Suspense>
          )}
          <div className="experience-vignette" />
        </div>

        <PremiumUI
          entered={entered}
          playing={tourPlaying}
          complete={tourComplete}
          loop={tourLoop}
          activeRoom={activeRoom}
          onEnter={enterWalkthrough}
          onToggleTour={toggleTour}
          onToggleLoop={() => setTourLoop((value) => !value)}
          onOpenMap={() => setMapOpen(true)}
        />

        {entered && <CabinNavigator active={experienceVisible} activeRoom={activeRoom} onSelect={navigateToRoom} />}
        {entered && <MobileJoystick onMoveStick={setJoystick} />}

        {entered && (
          <button className="scroll-cue premium-scroll-cue" onClick={scrollToOffice}>
            DISCOVER THE OFFICE <span aria-hidden="true">↓</span>
          </button>
        )}

        {mapOpen && (
          <FloorMapOverlay
            position={position}
            onClose={() => setMapOpen(false)}
          />
        )}
      </section>

      <section className="editorial-section office-section" id="the-office">
        <div className="section-index">01 <span>—</span> THE OFFICE</div>
        <div className="editorial-split">
          <h2>A considered space<br />for what comes next.</h2>
          <div className="editorial-copy">
            <p>
              A workplace shaped around the way people meet, think and move.
              DMIRALUXE brings arrival, collaboration and considered privacy
              together in one composed architectural experience.
            </p>
            <a href="#architecture" className="text-link">DISCOVER THE ARCHITECTURE <span>↗</span></a>
          </div>
        </div>
        <div className="office-stats">
          <div><span>01</span><small>CONNECTED<br />ENVIRONMENT</small></div>
          <div><span>09</span><small>PLACES TO<br />MEET & THINK</small></div>
          <div><span>01</span><small>SEAMLESS<br />ARRIVAL</small></div>
          <p>Quietly distinctive.<br /><em>Intentionally connected.</em></p>
        </div>
      </section>

      <section className="architecture-section" id="architecture">
        <div className="section-index">02 <span>—</span> ARCHITECTURE</div>
        <div className="architecture-heading">
          <h2>Warmth in every detail.</h2>
          <p>A restrained palette, layered with light, texture and lasting materials.</p>
        </div>
        <div className="material-grid">
          <article className="material-card marble">
            <div className="material-sample"><span>01</span></div>
            <p>01 / GROUND</p><h3>Ivory marble</h3>
            <span>Quiet movement underfoot. A reflective foundation for the day.</span>
          </article>
          <article className="material-card walnut">
            <div className="material-sample"><span>02</span></div>
            <p>02 / DETAIL</p><h3>Dark walnut</h3>
            <span>Deep, tactile joinery that brings warmth to the composed interior.</span>
          </article>
          <article className="material-card champagne">
            <div className="material-sample"><span>03</span></div>
            <p>03 / ACCENT</p><h3>Soft champagne</h3>
            <span>A measured line of metal. A considered glint in warm light.</span>
          </article>
          <article className="material-card glass">
            <div className="material-sample"><span>04</span></div>
            <p>04 / DIVISION</p><h3>Architectural glass</h3>
            <span>Privacy without separation; daylight that travels through the plan.</span>
          </article>
        </div>
      </section>

      <SpaceShowcase onSelect={selectSpace} snapshots={spaceSnapshots} />

      <section className="amenities-section" id="amenities">
        <div className="section-index">04 <span>—</span> AMENITIES</div>
        <div className="amenities-layout">
          <div>
            <h2>Everything<br />in its right place.</h2>
            <p>Thoughtful support for the everyday rhythm of work.</p>
          </div>
          <div className="amenities-list">
            <article><span>01</span><h3>Seamless arrival</h3><p>A clear route from the entrance to the reception threshold.</p></article>
            <article><span>02</span><h3>Room to gather</h3><p>A boardroom, meeting suite and informal spaces for every scale of exchange.</p></article>
            <article><span>03</span><h3>Connected movement</h3><p>Lift lobbies, stair connections and corridors that make the office easy to read.</p></article>
            <article><span>04</span><h3>Work, your way</h3><p>Open collaboration desks, quieter lounges and places to reset between meetings.</p></article>
          </div>
        </div>
      </section>

      <section className="experience-story-section" id="experience-story">
        <div className="section-index">05 <span>—</span> EXPERIENCE</div>
        <div className="experience-story-copy">
          <span>STEP INSIDE</span>
          <h2>Architecture is<br /><em>best experienced.</em></h2>
          <p>Return to the entrance. Explore at your own pace and find your way through the spaces.</p>
          <button className="return-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            RETURN TO THE WALKTHROUGH <span>↗</span>
          </button>
        </div>
        <div className="experience-story-number">D<span>.</span></div>
      </section>

      <section className="private-viewing-section" id="private-viewing">
        <div className="section-index">06 <span>—</span> PRIVATE VIEWING</div>
        <div className="private-viewing-content">
          <span>THE NEXT STEP</span>
          <h2>See what’s<br /><em>possible.</em></h2>
          <p>Tell us a little about your visit. We’ll open a prepared inquiry in your email app.</p>
          <form className="viewing-form" onSubmit={submitViewingInquiry}>
            <div className="viewing-form-fields">
              <label>
                <span>YOUR NAME</span>
                <input autoComplete="name" name="name" placeholder="Full name" required />
              </label>
              <label>
                <span>EMAIL ADDRESS</span>
                <input autoComplete="email" name="email" placeholder="you@company.com" required type="email" />
              </label>
              <label>
                <span>COMPANY <small>OPTIONAL</small></span>
                <input autoComplete="organization" name="company" placeholder="Company name" />
              </label>
              <label>
                <span>PREFERRED TIMING</span>
                <select defaultValue="" name="timing">
                  <option value="">Select an option</option>
                  <option>As soon as possible</option>
                  <option>Within the next month</option>
                  <option>Just exploring</option>
                </select>
              </label>
              <label className="viewing-message">
                <span>ANYTHING WE SHOULD KNOW? <small>OPTIONAL</small></span>
                <textarea name="message" placeholder="Share a little about your visit." rows={3} />
              </label>
            </div>
            <button className="viewing-button" type="submit">REQUEST A PRIVATE VIEWING <span>↗</span></button>
            <p className="viewing-form-note" role="status" aria-live="polite">
              {inquiryStatus || <>Submitting opens a prepared email to <a href="mailto:CEO.DIVEXA@gmail.com">CEO.DIVEXA@gmail.com</a>.</>}
            </p>
          </form>
        </div>
        <footer className="site-footer">
          <span>DMIRALUXE</span>
          <span>WHERE ARCHITECTURE MEETS AMBITION.</span>
          <a href="#experience">BACK TO TOP ↑</a>
        </footer>
      </section>
      {selectedSpace && (
        <SpaceDetailCurtain
          key={selectedSpace.id}
          space={selectedSpace}
          snapshot={spaceSnapshots[selectedSpace.id]}
          onClose={() => setSelectedSpace(null)}
          onExplore={() => exploreSpace(selectedSpace)}
        />
      )}
    </main>
  )
}

function officeRoomsPosition(roomId: string): [number, number] {
  const room = officeRooms.find(({ id }) => id === roomId)
  return room ? [room.entry[0], room.entry[1]] : [-0.14, 7.5]
}
