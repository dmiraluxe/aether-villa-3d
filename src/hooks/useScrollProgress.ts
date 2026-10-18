import { useEffect, useState, useRef } from 'react'
import { sceneConfig } from '../config/modelConfig'

/**
 * Tracks scroll progress over the pinned cinematic section.
 * Returns a value 0–1 that drives the camera and chapter system.
 */
export function useScrollProgress(containerRef: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0)
  const ticking = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const total = el.offsetHeight - window.innerHeight
        const scrolled = Math.max(0, -rect.top)
        const p = total > 0 ? Math.min(1, scrolled / total) : 0
        setProgress(p)
        ticking.current = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [containerRef])

  return progress
}

export const scrollHeightVh = sceneConfig.scrollLength * 100
