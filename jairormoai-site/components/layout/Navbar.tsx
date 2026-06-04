'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/sessions', label: 'Sesiones 1:1' },
  { href: '/vault', label: 'Bóveda IA' },
  { href: '/courses', label: 'Cursos' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Gradient topline */}
      <div className="h-[3px] bg-brand-grad" />

      <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-bg/70 backdrop-blur-xl border-b border-white/[0.05]">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="https://aufounpvgprzciqcswyi.supabase.co/storage/v1/object/sign/jairoromo.ai%20bucket/jr-logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wY2EyZWRmZC03MzZiLTRkNWItOGY5OS1jNjNiMzFmMjQzMmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJqYWlyb3JvbW8uYWkgYnVja2V0L2pyLWxvZ28ucG5nIiwiaWF0IjoxNzgwNjEwNzE0LCJleHAiOjE4MTIxNDY3MTR9.P0MhIJ7aSwxI0dEz8jA2OoiKPb6Zi1fsx4D7-nTa75A"
            alt="jairoromo.ai logo"
            width={36}
            height={36}
            priority
          />
          <span className="font-sora font-black text-[1rem] tracking-tight">
            jairo<span className="text-cyan">romo.ai</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'font-sora text-sm font-medium transition-colors duration-200',
                pathname === link.href ? 'text-white' : 'text-gray hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link href="/login">
          <Button variant="primary" size="sm">Iniciar sesión</Button>
        </Link>
      </nav>
    </header>
  )
}
