/** A coordinate-aligned office GLB can replace the procedural scene. */
export const modelConfig = {
  path: '/models/dmiraluxe-office.glb',
  useExternalModel: false,
  scale: 1,
  position: [0, 0, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number]
}

export const sceneConfig = {
  scrollLength: 6,
  fogColor: '#151613',
  fogNear: 25,
  fogFar: 52,
  background: '#151613',
  dayIntensity: 1.2,
  nightIntensity: 0.35
}
