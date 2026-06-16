'use client'
import { useState, useEffect } from 'react'

interface Props {
  freeUntil: string
  normalPriceCents: number
}

export function CourseFreeCountdown({ freeUntil, normalPriceCents }: Props) {
  const [secsLeft, setSecsLeft] = useState(() => {
    const diff = Math.floor((new Date(freeUntil).getTime() - Date.now()) / 1000)
    return Math.max(0, diff)
  })

  useEffect(() => {
    const end = new Date(freeUntil).getTime()
    const id = setInterval(() => {
      setSecsLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)))
    }, 1000)
    return () => clearInterval(id)
  }, [freeUntil])

  if (secsLeft <= 0) return null

  const h = Math.floor(secsLeft / 3600)
  const m = Math.floor((secsLeft % 3600) / 60)
  const s = secsLeft % 60
  const fmt = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  const normalPrice = `$${(normalPriceCents / 100).toFixed(0)} USD`

  return (
    <div className="mb-8 rounded-2xl bg-red-500/[0.07] border border-red-500/25 px-6 py-5">
      <div className="font-mono text-[10px] text-red-400 uppercase tracking-[2px] mb-2">
        ⚡ OFERTA ESPECIAL — SOLO HOY · Gratis por tiempo limitado
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <div className="font-mono text-[9px] text-red-400/70 uppercase tracking-wider mb-1">Precio regresa a {normalPrice} en:</div>
          <div className="font-mono text-3xl font-bold text-red-400 tabular-nums tracking-tighter">{fmt}</div>
        </div>
      </div>
    </div>
  )
}
