import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LessonPlayer } from '@/components/courses/LessonPlayer'
import { LessonSidebar } from '@/components/courses/LessonSidebar'
import type { Enrollment } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string; lessonId: string }>
}

export default async function LessonPage({ params }: Props) {
  const { slug, lessonId } = await params
  const supabase = await createClient()

  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user
  if (!user) redirect(`/login?redirect=/courses/${slug}/${lessonId}`)

  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', slug)
    .single()

  if (!course) notFound()

  const { data: enrollmentData } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .single()

  if (!enrollmentData) redirect(`/courses/${slug}`)

  const enrollment = enrollmentData as unknown as Enrollment

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, order_index, mux_playback_id, duration_seconds, downloadable_url')
    .eq('course_id', course.id)
    .order('order_index')

  const currentLesson = lessons?.find((l) => l.id === lessonId)
  if (!currentLesson) notFound()

  if (!currentLesson.mux_playback_id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-sora text-gray">Esta lección no tiene video todavía.</p>
      </div>
    )
  }

  const currentIndex = lessons?.findIndex((l) => l.id === lessonId) ?? 0
  const nextLesson = lessons?.[currentIndex + 1]
  const completedIds = Object.keys(enrollment.progress || {})
  const sidebarLessons = (lessons ?? []).map((l) => ({
    id: l.id,
    title: l.title,
    order_index: l.order_index,
  }))

  return (
    <div className="flex h-screen pt-[67px]">
      <LessonSidebar
        lessons={sidebarLessons}
        currentLessonId={lessonId}
        courseSlug={slug}
        completedIds={completedIds}
      />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl">
          <h1 className="font-sora font-black text-2xl mb-6">{currentLesson.title}</h1>
          <LessonPlayer
            lessonId={lessonId}
            playbackId={currentLesson.mux_playback_id}
            enrollmentId={enrollment.id}
            isCompleted={completedIds.includes(lessonId)}
            downloadableUrl={currentLesson.downloadable_url}
            nextLessonId={nextLesson?.id}
            courseSlug={slug}
          />
        </div>
      </main>
    </div>
  )
}
