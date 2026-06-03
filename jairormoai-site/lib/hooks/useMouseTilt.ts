'use client'
import { useEffect, useRef } from 'react'

export function useMouseTilt(maxDeg = 4) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const rx = ((e.clientY - cy) / cy) * maxDeg
      const ry = ((e.clientX - cx) / cx) * -maxDeg
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`
      el.style.transition = 'transform 0.1s ease-out'
    }

    const onLeave = () => {
      el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)'
      el.style.transition = 'transform 0.4s ease-out'
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [maxDeg])

  return ref
}
