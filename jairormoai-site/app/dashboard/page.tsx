import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EyebrowPill } from '@/components/ui/EyebrowPill'
import { EnrolledCourseCard } from '@/components/dashboard/EnrolledCourseCard'
import type { Course, Enrollment } from '@/lib/types'

export const metadata = {
  title: 'Mi aprendizaje — jairoromo.ai',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user

  if (!user) redirect('/login?redirect=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, courses(*)')
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false })

  const courseIds = enrollments?.map((e) => e.course_id) ?? []
  const { data: lessonRows } = courseIds.length > 0
    ? await supabase.from('lessons').select('course_id').in('course_id', courseIds)
    : { data: [] }

  const countMap: Record<string, number> = {}
  lessonRows?.forEach(({ course_id }: { course_id: string }) => {
    countMap[course_id] = (countMap[course_id] || 0) + 1
  })

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'estudiante'

  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <EyebrowPill live className="mb-5">Mi aprendizaje</EyebrowPill>
          <h1 className="font-sora font-black text-3xl md:text-4xl">
            Bienvenido, <span className="text-cyan">{displayName}.</span>
          </h1>
        </div>

        {!enrollments || enrollments.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-white/[0.06] bg-bg2/40">
            <p className="font-sora text-gray mb-6">No estás inscrito en ningún curso todavía.</p>
            <a href="/courses" className="font-mono text-[11px] text-cyan uppercase tracking-wider hover:underline">
              Ver catálogo de cursos →
            </a>
          </div>
        ) : (
          <>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-gray2 mb-6">
              Cursos inscritos — {enrollments.length}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrollments.map((enrollment) => {
                const course = enrollment.courses as unknown as Course
                return (
                  <EnrolledCourseCard
                    key={enrollment.id}
                    course={course}
                    enrollment={enrollment as unknown as Enrollment}
                    lessonCount={countMap[enrollment.course_id] ?? 0}
                  />
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
