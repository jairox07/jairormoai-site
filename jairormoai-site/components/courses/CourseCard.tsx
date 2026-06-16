'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import type { Course } from '@/lib/types'

interface CourseCardProps {
  course: Course
  lessonCount?: number
  enrolled?: boolean
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)} USD`
}

function useCountdown(freeUntil: string | null) {
  const [secsLeft, setSecsLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!freeUntil) return
    const end = new Date(freeUntil).getTime()
    const update = () => {
      const diff = Math.max(0, Math.floor((end - Date.now()) / 1000))
      setSecsLeft(diff)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [freeUntil])

  return secsLeft
}

function formatCountdown(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function CourseCard({ course, lessonCount, enrolled = false }: CourseCardProps) {
  const secsLeft = useCountdown(course.free_until ?? null)
  const isFreeNow = secsLeft !== null && secsLeft > 0

  return (
    <article className="flex flex-col rounded-2xl border border-white/[0.07] bg-bg2/60 overflow-hidden hover:border-white/[0.14] transition-all duration-300 group">
      {/* Thumbnail */}
      <div className="relative h-48 bg-bg3 overflow-hidden">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-[linear-gradient(135deg,rgba(79,195,247,0.08),rgba(139,92,246,0.08))] flex items-center justify-center">
            <span className="font-mono text-[11px] text-gray2 uppercase tracking-wider">Próximamente</span>
          </div>
        )}
        {enrolled && (
          <div className="absolute top-3 right-3 font-mono text-[10px] font-bold uppercase tracking-[2px] bg-cyan text-bg px-3 py-1 rounded-full">
            Inscrito
          </div>
        )}
        {isFreeNow && !enrolled && (
          <div className="absolute top-3 left-3 font-mono text-[10px] font-bold uppercase tracking-[2px] bg-green-500 text-white px-3 py-1 rounded-full animate-pulse">
            GRATIS — hoy
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="font-sora font-bold text-lg leading-snug mb-3">{course.title}</h3>
        {course.description && (
          <p className="font-sora text-gray text-sm leading-relaxed flex-1 mb-4 line-clamp-3">
            {course.description}
          </p>
        )}

        {lessonCount !== undefined && (
          <div className="font-mono text-[11px] text-gray2 uppercase tracking-wider mb-5">
            {lessonCount} {lessonCount === 1 ? 'lección' : 'lecciones'}
          </div>
        )}

        {/* Countdown when free period active */}
        {isFreeNow && !enrolled && secsLeft !== null && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3">
            <div className="font-mono text-[9px] text-red-400 uppercase tracking-[2px] mb-1">⚡ Precio regresa a {formatPrice(course.price_cents)} en:</div>
            <div className="font-mono text-2xl font-bold text-red-400 tabular-nums tracking-tighter">
              {formatCountdown(secsLeft)}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <span className={`font-sora font-black text-2xl ${isFreeNow ? 'text-green-400' : ''}`}>
            {isFreeNow ? 'GRATIS' : formatPrice(course.price_cents)}
          </span>
          {enrolled ? (
            <Link href={`/courses/${course.slug}`}>
              <Button variant="outline" size="sm">Continuar →</Button>
            </Link>
          ) : (
            <Link href={`/courses/${course.slug}`}>
              <Button variant="primary" size="sm">Ver curso</Button>
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
