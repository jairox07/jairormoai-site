import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/courses/ProgressBar'
import type { Course, Enrollment } from '@/lib/types'

interface EnrolledCourseCardProps {
  course: Course
  enrollment: Enrollment
  lessonCount: number
}

export function EnrolledCourseCard({ course, enrollment, lessonCount }: EnrolledCourseCardProps) {
  const completedCount = Object.keys(enrollment.progress || {}).length
  const label = completedCount === 0
    ? 'Comenzar'
    : completedCount >= lessonCount
    ? 'Repasar'
    : 'Continuar'

  return (
    <article className="flex flex-col rounded-2xl border border-cyan/20 bg-bg2/60 overflow-hidden">
      <div className="relative h-36 bg-bg3">
        {course.thumbnail_url ? (
          <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-[linear-gradient(135deg,rgba(79,195,247,0.08),rgba(139,92,246,0.08))]" />
        )}
      </div>
      <div className="p-5 flex flex-col gap-4">
        <h3 className="font-sora font-bold text-base leading-snug">{course.title}</h3>
        <ProgressBar completed={completedCount} total={lessonCount} />
        <Link href={`/courses/${course.slug}`}>
          <Button variant="primary" size="sm" className="w-full">{label}</Button>
        </Link>
      </div>
    </article>
  )
}
