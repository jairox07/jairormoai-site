import { createClient } from '@/lib/supabase/server'
import { CourseCard } from '@/components/courses/CourseCard'
import { EyebrowPill } from '@/components/ui/EyebrowPill'
import type { Course } from '@/lib/types'

export const metadata = {
  title: 'Cursos de IA en Español — Aprende Claude, GPT y Automatización',
  description: 'Cursos prácticos de Inteligencia Artificial en español con Jairo Romo. Claude, GPT, Gemini, RAG, Agentes IA. Para profesionales en México y LATAM que quieren resultados reales.',
  alternates: { canonical: 'https://jairoromo.ai/courses' },
  openGraph: {
    title: 'Cursos de IA en Español con Jairo Romo',
    description: 'Aprende IA aplicada al mundo real. Sin teoría vacía. Cursos en español para profesionales y empresas.',
    url: 'https://jairoromo.ai/courses',
    type: 'website',
  },
}

export default async function CoursesPage() {
  let courses: Course[] = []
  let enrolledCourseIds: string[] = []
  let countMap: Record<string, number> = {}

  try {
    const supabase = await createClient()

    const [{ data: coursesData }, { data: { user } }] = await Promise.all([
      supabase.from('courses').select('*').eq('published', true).order('created_at'),
      supabase.auth.getUser(),
    ])

    courses = (coursesData as Course[]) || []

    if (user) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id)
      enrolledCourseIds = enrollments?.map((e: { course_id: string }) => e.course_id) ?? []
    }

    const { data: lessonCounts } = await supabase
      .from('lessons')
      .select('course_id')

    lessonCounts?.forEach(({ course_id }: { course_id: string }) => {
      countMap[course_id] = (countMap[course_id] || 0) + 1
    })
  } catch {
    // Supabase not configured yet — show empty state
  }

  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <EyebrowPill live className="mb-6">Cursos</EyebrowPill>
          <h1 className="font-sora font-black text-4xl md:text-5xl mb-5 leading-tight">
            IA que se aprende<br />
            <span className="text-cyan">haciéndola.</span>
          </h1>
          <p className="font-sora text-gray text-lg max-w-2xl">
            Sin teoría vacía. Cada clase tiene un caso de uso real, código funcional y resultado medible.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-mono text-[11px] text-gray2 uppercase tracking-wider">
              Cursos próximamente
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                lessonCount={countMap[course.id] ?? 0}
                enrolled={enrolledCourseIds.includes(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
