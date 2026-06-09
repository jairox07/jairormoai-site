import Link from 'next/link'
import Image from 'next/image'
import { SOCIAL_LINKS } from '@/lib/constants'

const FOOTER_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/sessions', label: 'Sesiones' },
  { href: '/vault', label: 'Bóveda IA' },
  { href: '/login', label: 'Acceder' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-bg2 py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="https://aufounpvgprzciqcswyi.supabase.co/storage/v1/object/sign/jairoromo.ai%20bucket/jr-logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wY2EyZWRmZC03MzZiLTRkNWItOGY5OS1jNjNiMzFmMjQzMmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJqYWlyb3JvbW8uYWkgYnVja2V0L2pyLWxvZ28ucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTAzMTk1MywiZXhwIjoxODEyNTY3OTUzfQ.l-50MC-iOhuOWWXQNykabWlio6wAwZpOJLTBVaUP5eo"
                alt="jairoromo.ai"
                width={32}
                height={32}
              />
              <span className="font-sora font-black text-sm">
                jairo<span className="text-cyan">romo.ai</span>
              </span>
            </Link>
            <p className="font-mono text-[11px] text-gray2 tracking-wider uppercase">
              IA sin fricción.
            </p>
          </div>

          {/* Nav */}
          <div className="flex flex-wrap gap-6">
            {FOOTER_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="font-sora text-sm text-gray2 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray2 hover:text-cyan hover:border-cyan/30 transition-all duration-200"
                aria-label={s.label}
              >
                <span className="text-xs font-mono font-bold">{s.label[0]}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.05] flex items-center justify-between">
          <span className="font-mono text-[11px] text-gray2">
            © {new Date().getFullYear()} Jairo Romo. Todos los derechos reservados.
          </span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_6px_#4FC3F7]" />
            <span className="font-mono text-[11px] text-gray2">jairoromo.ai</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
