'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { DarkModeToggle } from '@/components/ui/DarkModeToggle'

const NAV_LINKS: { href: string; label: string; highlight?: boolean }[] = [
  { href: '/', label: 'Inicio' },
  { href: '/sessions', label: 'Sesiones 1:1' },
  { href: '/guia-claude', label: 'Guía Claude', highlight: true },
  { href: '/vault', label: 'Bóveda IA' },
  { href: '/courses', label: 'Cursos' },
]

const ADMIN_EMAIL = 'jairoromo@gmail.com'

const ADMIN_SECTIONS = [
  { tab: 'overview', label: 'Resumen', icon: '📊' },
  { tab: 'users', label: 'Usuarios', icon: '👥' },
  { tab: 'newsletter', label: 'Newsletter', icon: '📧' },
  { tab: 'purchases', label: 'Compras', icon: '💳' },
  { tab: 'activity', label: 'Actividad', icon: '⚡' },
  { tab: 'courses', label: 'Cursos', icon: '🎓' },
  { tab: 'profile', label: 'Perfil', icon: '⚙️' },
]

function AdminMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="font-mono text-[11px] font-bold uppercase tracking-[2px] px-3 py-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan hover:bg-cyan/20 transition-colors flex items-center gap-1.5"
      >
        Admin
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={cn('transition-transform', open && 'rotate-180')}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/[0.08] bg-bg2/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden z-50">
          {ADMIN_SECTIONS.map((s) => (
            <Link
              key={s.tab}
              href={`/admin?tab=${s.tab}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 font-sora text-sm text-gray hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-base">{s.icon}</span>
              {s.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsAdmin(data.user?.email === ADMIN_EMAIL)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(session?.user?.email === ADMIN_EMAIL)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Gradient topline */}
      <div className="h-[3px] bg-brand-grad" />

      <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-bg/70 backdrop-blur-xl border-b border-white/[0.05]">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="https://aufounpvgprzciqcswyi.supabase.co/storage/v1/object/sign/jairoromo.ai%20bucket/jr-logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wY2EyZWRmZC03MzZiLTRkNWItOGY5OS1jNjNiMzFmMjQzMmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJqYWlyb3JvbW8uYWkgYnVja2V0L2pyLWxvZ28ucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTAzMTk1MywiZXhwIjoxODEyNTY3OTUzfQ.l-50MC-iOhuOWWXQNykabWlio6wAwZpOJLTBVaUP5eo"
            alt="jairoromo.ai logo"
            width={36}
            height={36}
            priority
          />
          <span className="font-sora font-black text-[1rem] tracking-tight">
            jairo<span className="text-cyan">romo.ai</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'font-sora text-sm font-medium transition-colors duration-200',
                link.highlight
                  ? 'text-cyan font-bold'
                  : pathname === link.href ? 'text-white' : 'text-gray hover:text-white'
              )}
            >
              {link.label}
              {link.highlight && (
                <span className="ml-1.5 font-mono text-[9px] bg-cyan/15 border border-cyan/30 text-cyan px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  nuevo
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <DarkModeToggle />
          {isAdmin && <AdminMenu />}
          <Link href="/login">
            <Button variant="primary" size="sm">Iniciar sesión</Button>
          </Link>
        </div>

        {/* Mobile: hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menú"
        >
          <span
            className={cn('block w-5 h-[2px] bg-white transition-all duration-200', mobileOpen && 'rotate-45 translate-y-[7px]')}
          />
          <span
            className={cn('block w-5 h-[2px] bg-white transition-all duration-200', mobileOpen && 'opacity-0')}
          />
          <span
            className={cn('block w-5 h-[2px] bg-white transition-all duration-200', mobileOpen && '-rotate-45 -translate-y-[7px]')}
          />
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-bg/95 backdrop-blur-xl border-b border-white/[0.05] px-6 py-6 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center justify-between font-sora text-base font-medium py-3 border-b border-white/[0.05] transition-colors',
                pathname === link.href ? 'text-white' : 'text-gray'
              )}
            >
              <span>
                {link.label}
                {link.highlight && (
                  <span className="ml-2 font-mono text-[9px] bg-cyan/15 border border-cyan/30 text-cyan px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    nuevo
                  </span>
                )}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-gray2 uppercase tracking-wider">Modo claro/oscuro</span>
              <DarkModeToggle />
            </div>
            {isAdmin && (
              <Link href="/admin" className="font-mono text-[11px] font-bold uppercase tracking-[2px] px-4 py-3 rounded-xl bg-cyan/10 border border-cyan/30 text-cyan text-center">
                Admin Dashboard
              </Link>
            )}
            <Link href="/login">
              <Button variant="primary" className="w-full">Iniciar sesión</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
