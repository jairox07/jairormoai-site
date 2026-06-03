'use client'
import { useEffect } from 'react'

const PARTICLE_COLORS = [
  'rgba(79,195,247,',
  'rgba(107,142,245,',
  'rgba(139,92,246,',
]

export function ClickRipple() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const ripple = document.createElement('div')
      ripple.style.cssText = `
        position:fixed;z-index:9999;border-radius:50%;pointer-events:none;
        left:${e.clientX - 30}px;top:${e.clientY - 30}px;
        width:60px;height:60px;
        background:rgba(79,195,247,0.12);
        border:1px solid rgba(79,195,247,0.35);
        transform:scale(0);
      `
      document.body.appendChild(ripple)
      ripple.animate(
        [{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(4)', opacity: 0 }],
        { duration: 600, easing: 'cubic-bezier(0,0.55,0.45,1)', fill: 'forwards' }
      ).addEventListener('finish', () => ripple.remove())

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const speed = 50 + Math.random() * 50
        const size = 2 + Math.random() * 3
        const col = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
        const p = document.createElement('div')
        p.style.cssText = `
          position:fixed;z-index:9999;border-radius:50%;pointer-events:none;
          width:${size}px;height:${size}px;
          background:${col}0.9);
          box-shadow:0 0 4px ${col}0.6);
          left:${e.clientX}px;top:${e.clientY}px;
          transform:translate(-50%,-50%);
        `
        document.body.appendChild(p)
        p.animate(
          [
            { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
            {
              transform: `translate(calc(-50% + ${Math.cos(angle) * speed}px), calc(-50% + ${Math.sin(angle) * speed}px)) scale(0)`,
              opacity: 0,
            },
          ],
          { duration: 500 + Math.random() * 300, easing: 'cubic-bezier(0,0.55,0.45,1)', fill: 'forwards' }
        ).addEventListener('finish', () => p.remove())
      }
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
