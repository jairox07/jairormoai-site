'use client'
import { useState, useEffect } from 'react'

export function DarkModeToggle({ className = '' }: { className?: string }) {
  const [light, setLight] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('site-mode')
    if (saved === 'light') {
      setLight(true)
      document.documentElement.setAttribute('data-mode', 'light')
    }
  }, [])

  const toggle = () => {
    const next = !light
    setLight(next)
    if (next) {
      document.documentElement.setAttribute('data-mode', 'light')
      localStorage.setItem('site-mode', 'light')
    } else {
      document.documentElement.removeAttribute('data-mode')
      localStorage.setItem('site-mode', 'dark')
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={light ? 'Activar modo oscuro' : 'Activar modo claro'}
      className={`w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray2 hover:text-cyan hover:border-cyan/30 transition-all duration-200 ${className}`}
    >
      {light ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
    </button>
  )
}
