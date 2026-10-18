import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { mainEntrance, officeRooms } from './config/officeLayout'
import { CabinNavigator } from './components/CabinNavigator'
import { FloorMapOverlay } from './components/FloorMap'
import { MobileJoystick } from './components/OfficeHud'
import { PremiumUI } from './components/PremiumUI'
import { SpaceDetailCurtain, SpaceShowcase, type ShowcaseSpace } from './components/SpaceShowcase'
import './styles/global.css'
import './styles/experience.css'

const ExperienceCanvas = lazy(() =>
  import('./components/ExperienceCanvas').then(({ ExperienceCanvas: canvas }) => ({ default: canvas }))
)

type Position = { x: number; z: number }

export default function App() {
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

  return (
    <main className="site-shell">
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
          <p>Begin a conversation about a private viewing of the DMIRALUXE office.</p>
          <a href="#experience" className="viewing-button">RETURN TO DMIRALUXE <span>↑</span></a>
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
