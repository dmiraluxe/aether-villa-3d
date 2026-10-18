import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { mainEntrance } from '../config/officeLayout'
import { CameraRig } from './CameraRig'
import { ModelLoader } from './ModelLoader'
import { CinematicPlayer } from './CinematicPlayer'
import { SpaceSnapshotCapture } from './SpaceSnapshotCapture'

interface ExperienceCanvasProps {
  active: boolean
  visible: boolean
  tourPlaying: boolean
  tourLoop: boolean
  tourRestartToken: number
  destination: [number, number] | null
  joystick: { forward: number; strafe: number }
  onExit: () => void
  onPositionChange: (position: { x: number; z: number }) => void
  onRoomChange: (room: string | null) => void
  onTourComplete: () => void
  onSpaceSnapshotsReady: (snapshots: Record<string, string>) => void
}

function StudioEnvironment() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl)
    const studio = new RoomEnvironment()
    const target = generator.fromScene(studio, 0.04)
    const previousEnvironment = scene.environment
    const previousIntensity = scene.environmentIntensity
    scene.environment = target.texture
    scene.environmentIntensity = 0.38
    generator.dispose()

    return () => {
      scene.environment = previousEnvironment
      scene.environmentIntensity = previousIntensity
      studio.dispose()
      target.dispose()
    }
  }, [gl, scene])
  return null
}

function StableShadowMap() {
  const { gl } = useThree()
  useEffect(() => {
    gl.shadowMap.type = THREE.PCFSoftShadowMap
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
  }, [gl])
  return null
}

function ResumeVisibleCanvas({ visible }: { visible: boolean }) {
  const invalidate = useThree(({ invalidate }) => invalidate)
  useEffect(() => {
    if (visible) invalidate()
  }, [invalidate, visible])
  return null
}

export function ExperienceCanvas({
  active,
  visible,
  tourPlaying,
  tourLoop,
  tourRestartToken,
  destination,
  joystick,
  onExit,
  onPositionChange,
  onRoomChange,
  onTourComplete,
  onSpaceSnapshotsReady
}: ExperienceCanvasProps) {
  const [mobileQuality, setMobileQuality] = useState(() =>
    window.matchMedia('(max-width: 760px), (pointer: coarse)').matches
  )

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px), (pointer: coarse)')
    const updateQuality = () => setMobileQuality(media.matches)
    media.addEventListener('change', updateQuality)
    return () => media.removeEventListener('change', updateQuality)
  }, [])

  return (
    <Canvas
      shadows={!mobileQuality}
      frameloop={visible ? 'always' : 'demand'}
      dpr={mobileQuality ? 1 : [1, 1.5]}
      gl={{
        antialias: !mobileQuality,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.28,
        outputColorSpace: THREE.SRGBColorSpace
      }}
      camera={{ position: [mainEntrance[0], 1.65, mainEntrance[1]], fov: 72, near: 0.1, far: 70 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: active ? 'auto' : 'none' }}
    >
      <color attach="background" args={['#151613']} />
      <fog attach="fog" args={['#c5b9a6', 38, 58]} />

      <StudioEnvironment />
      <StableShadowMap />
      <ResumeVisibleCanvas visible={visible} />
      <ambientLight intensity={0.96} color="#fff2df" />
      <hemisphereLight intensity={0.72} color="#fff2df" groundColor="#756653" />
      <directionalLight
        castShadow
        position={[-8, 12, 8]}
        intensity={0.9}
        color="#fff0d8"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={35}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[7, 7, -6]} intensity={0.5} color="#e7e9e8" />

      <CameraRig
        active={active && !tourPlaying}
        destination={destination}
        joystick={joystick}
        onExit={onExit}
        onPositionChange={onPositionChange}
        onRoomChange={onRoomChange}
      />
      <CinematicPlayer
        playing={active && tourPlaying}
        loop={tourLoop}
        restartToken={tourRestartToken}
        onComplete={onTourComplete}
        onPositionChange={onPositionChange}
        onRoomChange={onRoomChange}
      />
      <ModelLoader />
      <SpaceSnapshotCapture onComplete={onSpaceSnapshotsReady} />
    </Canvas>
  )
}
