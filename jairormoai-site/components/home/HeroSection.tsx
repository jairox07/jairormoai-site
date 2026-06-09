'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, useCallback } from 'react'
import { useParallax } from '@/lib/hooks/useParallax'
import { useMouseTilt } from '@/lib/hooks/useMouseTilt'
import { EyebrowPill } from '@/components/ui/EyebrowPill'
import { Button } from '@/components/ui/Button'
import { SocialRow } from './SocialRow'
import { HERO_TAGS } from '@/lib/constants'

const ORIGINAL_PHOTO = 'https://aufounpvgprzciqcswyi.supabase.co/storage/v1/object/sign/jairoromo.ai%20bucket/aragonai-7984aeb5-3408-4714-bbc3-f21c8bb0dd2f.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wY2EyZWRmZC03MzZiLTRkNWItOGY5OS1jNjNiMzFmMjQzMmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJqYWlyb3JvbW8uYWkgYnVja2V0L2FyYWdvbmFpLTc5ODRhZWI1LTM0MDgtNDcxNC1iYmMzLWYyMWM4YmIwZGQyZi5qcGVnIiwiaWF0IjoxNzgwNjEwNzAxLCJleHAiOjE4MTIxNDY3MDF9.tIzFipsnTXhr4EvUFkW3_a8Qh6byTAkwBnS20ZfhvmY'
const CYBORG_PHOTO = '/jairo-cyborg.jpg'

export function HeroSection() {
  const leftRef = useParallax(0.12)
  const tiltRef = useMouseTilt(4)
  const revealRef = useRef<HTMLDivElement>(null)
  const [clipPct, setClipPct] = useState(50)
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = revealRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    setClipPct(Math.max(0, Math.min(100, (x / rect.width) * 100)))
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    setClipPct(50)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-20 py-24">
      <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* LEFT */}
        <div ref={leftRef} className="flex-1 will-change-transform">
          <EyebrowPill live className="mb-7">
            IA Aplicada al Mundo Real
          </EyebrowPill>

          <h1 className="font-sora font-black text-[clamp(2.8rem,5vw,4.5rem)] leading-[1.05] tracking-tight mb-5">
            Inteligencia Artificial<br />
            Aplicada, <span className="text-cyan">sin fricción.</span>
          </h1>

          <p className="font-sora font-light text-lg text-gray leading-relaxed max-w-[520px] mb-7">
            Construyo, enseño y escalo sistemas de IA para empresas reales.
            Sin teoría vacía, sin promesas falsas.
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {HERO_TAGS.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[11px] font-bold uppercase tracking-[1.5px] text-gray2 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/sessions">
              <Button variant="primary" size="lg">Agendar sesión</Button>
            </Link>
            <Link href="/vault">
              <Button variant="ghost" size="lg">Ver proyectos →</Button>
            </Link>
          </div>

          <SocialRow />
        </div>

        {/* RIGHT — Photo with Cyborg Reveal */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div ref={tiltRef} className="relative will-change-transform" style={{ width: 425, height: 425 }}>
            {/* Glow */}
            <div className="absolute inset-[-40px] rounded-full bg-[radial-gradient(circle,rgba(79,195,247,0.12),transparent_65%)] blur-2xl" />
            {/* Ring */}
            <div className="absolute inset-0 rounded-full bg-brand-grad z-0" />
            {/* Border gap */}
            <div className="absolute inset-[3px] rounded-full bg-bg z-[1]" />

            {/* Photo container — reveal lives here */}
            <div
              ref={revealRef}
              className="absolute inset-[9px] rounded-full overflow-hidden z-[2] bg-bg3 cursor-ew-resize select-none"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* BACKGROUND: cyborg image (always visible) */}
              <Image
                src={CYBORG_PHOTO}
                alt="Jairo Romo — versión IA"
                fill
                className="object-cover object-top pointer-events-none"
                priority
              />

              {/* FOREGROUND: original photo, clipped to reveal from left */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `polygon(0 0, ${clipPct}% 0, ${clipPct}% 100%, 0 100%)`,
                  transition: isHovering ? 'none' : 'clip-path 0.4s ease-in-out',
                }}
              >
                <Image
                  src={ORIGINAL_PHOTO}
                  alt="Jairo Romo"
                  fill
                  className="object-cover object-top pointer-events-none"
                  priority
                />
              </div>

              {/* Divider line */}
              {isHovering && (
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-cyan/70 shadow-[0_0_8px_#4FC3F7] pointer-events-none z-10"
                  style={{ left: `${clipPct}%`, transform: 'translateX(-50%)' }}
                />
              )}
            </div>

            {/* Floating dots */}
            <span className="absolute top-[8%] right-[-6%] w-2 h-2 rounded-full bg-cyan shadow-[0_0_8px_#4FC3F7] animate-float z-[3]" />
            <span className="absolute bottom-[20%] left-[-5%] w-1.5 h-1.5 rounded-full bg-purp shadow-[0_0_8px_#8B5CF6] animate-float z-[3]" style={{ animationDelay: '2s' }} />
            <span className="absolute top-[55%] right-[-9%] w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_6px_#4FC3F7] animate-float z-[3]" style={{ animationDelay: '1s' }} />
          </div>

          {/* Hint label */}
          <div className="mt-4 flex flex-col items-center gap-1">
            <div className="font-mono text-[12px] text-cyan tracking-[3px] uppercase">
              @jairoromo.ai
            </div>
            <div className="font-mono text-[9px] text-gray2/50 tracking-[1.5px] uppercase">
              ← desliza →
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-px h-12 bg-[linear-gradient(to_bottom,rgba(79,195,247,0.4),transparent)] animate-scroll-hint" />
        <span className="font-mono text-[10px] text-gray2 tracking-[3px] uppercase">scroll</span>
      </div>
    </section>
  )
}
