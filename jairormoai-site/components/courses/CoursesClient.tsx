'use client'
import { useState } from 'react'
import { CourseCard } from './CourseCard'
import type { Course } from '@/lib/types'

interface CoursesClientProps {
  courses: Course[]
  enrolledCourseIds: string[]
  countMap: Record<string, number>
}

export function CoursesClient({ courses, enrolledCourseIds, countMap }: CoursesClientProps) {
  const [search, setSearch] = useState('')

  const filtered = courses.filter((c) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.slug?.toLowerCase().includes(q)
    )
  })

  if (courses.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="font-mono text-[11px] text-gray2 uppercase tracking-wider">
          Cursos próximamente
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Search bar */}
      <div className="mb-10">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cursos..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl font-mono text-[12px] text-white placeholder:text-gray2 focus:outline-none focus:border-cyan/40 focus:bg-white/[0.06] transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray2 hover:text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray font-sora">
          No hay cursos que coincidan con &ldquo;{search}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              lessonCount={countMap[course.id] ?? 0}
              enrolled={enrolledCourseIds.includes(course.id)}
            />
          ))}
        </div>
      )}
    </>
  )
}
