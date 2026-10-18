import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { officeRooms } from '../config/officeLayout'
import { showcaseSpaces } from './SpaceShowcase'

const SNAPSHOT_WIDTH = 640
const SNAPSHOT_HEIGHT = 400

export function SpaceSnapshotCapture({
  onComplete
}: {
  onComplete: (snapshots: Record<string, string>) => void
}) {
  const { gl, scene, invalidate } = useThree()

  useEffect(() => {
    let disposed = false
    const timer = window.setTimeout(() => {
      const renderTarget = new THREE.WebGLRenderTarget(SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT, {
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        depthBuffer: true,
        stencilBuffer: false
      })
      renderTarget.texture.colorSpace = THREE.SRGBColorSpace

      const previousTarget = gl.getRenderTarget()
      const previousViewport = gl.getViewport(new THREE.Vector4())
      const previousScissor = gl.getScissor(new THREE.Vector4())
      const previousScissorTest = gl.getScissorTest()
      const snapshots: Record<string, string> = {}
      const camera = new THREE.PerspectiveCamera(58, SNAPSHOT_WIDTH / SNAPSHOT_HEIGHT, 0.1, 80)
      const pixels = new Uint8Array(SNAPSHOT_WIDTH * SNAPSHOT_HEIGHT * 4)
      const canvas = document.createElement('canvas')
      canvas.width = SNAPSHOT_WIDTH
      canvas.height = SNAPSHOT_HEIGHT
      const context = canvas.getContext('2d')
      if (!context) {
        renderTarget.dispose()
        throw new Error('Unable to create a canvas for office room previews.')
      }

      try {
        gl.setScissorTest(false)
        gl.setRenderTarget(renderTarget)

        for (const space of showcaseSpaces) {
          const room = officeRooms.find(({ id }) => id === space.id)
          if (!room) {
            console.warn(`No 3D room is configured for the ${space.name} preview.`)
            continue
          }

          if (space.id === 'boardroom') {
            camera.position.set(6, 1.62, -4.18)
          } else {
            camera.position.set(room.entry[0], 1.62, room.entry[1])
          }
          camera.lookAt(room.center[0], 1.3, room.center[1])
          camera.updateMatrixWorld()
          gl.clear(true, true, true)
          gl.render(scene, camera)
          gl.readRenderTargetPixels(renderTarget, 0, 0, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT, pixels)

          const imageData = context.createImageData(SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT)
          for (let y = 0; y < SNAPSHOT_HEIGHT; y += 1) {
            const sourceOffset = (SNAPSHOT_HEIGHT - y - 1) * SNAPSHOT_WIDTH * 4
            const destinationOffset = y * SNAPSHOT_WIDTH * 4
            imageData.data.set(pixels.subarray(sourceOffset, sourceOffset + SNAPSHOT_WIDTH * 4), destinationOffset)
          }
          context.putImageData(imageData, 0, 0)
          snapshots[space.id] = canvas.toDataURL('image/webp', 0.84)
        }
      } catch (error) {
        console.error('Unable to capture the office room previews from the 3D scene.', error)
      } finally {
        gl.setRenderTarget(previousTarget)
        gl.setViewport(previousViewport)
        gl.setScissor(previousScissor)
        gl.setScissorTest(previousScissorTest)
        gl.resetState()
        renderTarget.dispose()
        invalidate()
      }

      if (!disposed && Object.keys(snapshots).length > 0) onComplete(snapshots)
    }, 900)

    return () => {
      disposed = true
      window.clearTimeout(timer)
    }
  }, [gl, invalidate, onComplete, scene])

  return null
}
