'use client'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Lesson } from '@/lib/types'

interface LessonSidebarProps {
  lessons: Pick<Lesson, 'id' | 'title' | 'order_index'>[]
  currentLessonId: string
  courseSlug: string
  completedIds: string[]
}

export function LessonSidebar({ lessons, currentLessonId, courseSlug, completedIds }: LessonSidebarProps) {
  return (
    <aside className="w-72 flex-shrink-0 border-r border-white/[0.06] h-full overflow-y-auto bg-bg2/40">
      <div className="p-5 border-b border-white/[0.06]">
        <Link
          href={`/courses/${courseSlug}`}
          className="font-mono text-[11px] text-gray2 hover:text-cyan transition-colors uppercase tracking-wider"
        >
          ← Volver al curso
        </Link>
      </div>
      <nav className="p-3">
        {lessons.map((lesson, i) => {
          const isActive = lesson.id === currentLessonId
          const isDone = completedIds.includes(lesson.id)
          return (
            <Link
              key={lesson.id}
              href={`/courses/${courseSlug}/${lesson.id}`}
              className={cn(
                'flex items-start gap-3 px-3 py-3 rounded-lg mb-1 transition-all duration-200',
                isActive ? 'bg-cyan/[0.1] border border-cyan/25' : 'hover:bg-white/[0.04]'
              )}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold mt-0.5',
                  isDone ? 'bg-cyan text-bg' : 'border border-white/[0.15] text-gray2'
                )}
              >
                {isDone ? '✓' : i + 1}
              </div>
              <span
                className={cn(
                  'font-sora text-sm leading-snug',
                  isActive ? 'text-white font-medium' : 'text-gray'
                )}
              >
                {lesson.title}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
