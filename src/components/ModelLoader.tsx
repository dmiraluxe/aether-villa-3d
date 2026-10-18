import { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { modelConfig } from '../config/modelConfig'
import { OfficeEnvironment } from '../scenes/OfficeEnvironment'

function ReplacementModel() {
  const { scene } = useGLTF(modelConfig.path)
  const model = useMemo(() => {
    const clone = scene.clone(true)
    clone.position.set(...modelConfig.position)
    clone.rotation.set(...modelConfig.rotation)
    clone.scale.setScalar(modelConfig.scale)
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [scene])
  return <primitive object={model} />
}

export function ModelLoader() {
  if (modelConfig.useExternalModel) {
    return (
      <Suspense fallback={<OfficeEnvironment />}>
        <ReplacementModel />
      </Suspense>
    )
  }
  return <OfficeEnvironment />
}
