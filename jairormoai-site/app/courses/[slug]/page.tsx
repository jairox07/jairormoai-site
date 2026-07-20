import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EyebrowPill } from '@/components/ui/EyebrowPill'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/courses/ProgressBar'
import { BuyCourseButton } from '@/components/courses/BuyCourseButton'
import { CourseFreeCountdown } from '@/components/courses/CourseFreeCountdown'
import type { Course, Lesson, Enrollment } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ enrolled?: string }>
}

export default async function CourseDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { enrolled: justEnrolled } = await searchParams

  const supabase = await createClient()

  const [{ data: course, error }, { data: authData }] = await Promise.all([
    supabase.from('courses').select('*').eq('slug', slug).eq('published', true).single(),
    supabase.auth.getUser(),
  ])

  if (error || !course) notFound()

  const typedCourse = course as Course
  const user = authData?.user ?? null

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, order_index, duration_seconds, mux_playback_id')
    .eq('course_id', typedCourse.id)
    .order('order_index')

  let enrollment: Enrollment | null = null
  if (user) {
    const { data } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', typedCourse.id)
      .single()
    enrollment = data as Enrollment | null
  }

  const completedCount = enrollment ? Object.keys(enrollment.progress || {}).length : 0
  const totalLessons = lessons?.length ?? 0
  const firstLessonId = lessons?.[0]?.id

  function formatDuration(secs: number | null): string {
    if (!secs) return ''
    return `${Math.floor(secs / 60)} min`
  }

  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">

        {justEnrolled && (
          <div className="mb-8 p-4 rounded-xl bg-cyan/[0.08] border border-cyan/25 font-sora text-sm text-cyan">
            Inscripción confirmada. ¡Empieza tu primera lección abajo!
          </div>
        )}

        {/* Header */}
        <div className="mb-12">
          <EyebrowPill className="mb-5">Curso</EyebrowPill>
          <h1 className="font-sora font-black text-3xl md:text-5xl mb-5 leading-tight">
            {typedCourse.title}
          </h1>
          {typedCourse.description && (
            <p className="font-sora text-gray text-lg leading-relaxed max-w-3xl mb-8">
              {typedCourse.description}
            </p>
          )}

          {/* Landing content — only for non-enrolled */}
          {!enrollment && (typedCourse as any).long_description && (() => {
            const ld = (typedCourse as any).long_description
            return (
              <div className="mb-10 space-y-10">
                {ld.tagline && (
                  <p className="font-sora font-bold text-xl text-cyan">{ld.tagline}</p>
                )}
                <div className="grid md:grid-cols-2 gap-8">
                  {ld.for_who?.length > 0 && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[3px] text-gray2 mb-3">¿Para quién es?</p>
                      <ul className="space-y-2">
                        {ld.for_who.map((item: string, i: number) => (
                          <li key={i} className="flex gap-2 font-sora text-sm text-gray">
                            <span className="text-cyan mt-0.5">→</span>{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ld.what_you_learn?.length > 0 && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[3px] text-gray2 mb-3">Qué aprenderás</p>
                      <ul className="space-y-2">
                        {ld.what_you_learn.map((item: string, i: number) => (
                          <li key={i} className="flex gap-2 font-sora text-sm text-gray">
                            <span className="text-cyan mt-0.5">✓</span>{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {ld.modules?.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[3px] text-gray2 mb-4">Contenido del curso</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {ld.modules.map((m: {num: number; title: string; desc: string}) => (
                        <div key={m.num} className="flex gap-3 p-4 rounded-xl bg-bg2 border border-white/[0.06]">
                          <span className="font-mono text-[11px] text-cyan font-bold w-6 shrink-0">{m.num}</span>
                          <div>
                            <p className="font-sora text-sm font-bold">{m.title}</p>
                            <p className="font-sora text-xs text-gray mt-0.5">{m.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {enrollment ? (
            <div className="flex flex-col gap-4">
              <ProgressBar completed={completedCount} total={totalLessons} className="max-w-md" />
              <a
                href="https://drive.google.com/file/d/1wf_5LRfY78qIj7kN6doR5J7qNVlzy91h/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[2px] text-cyan border border-cyan/30 rounded-xl px-4 py-2 hover:bg-cyan/10 transition-colors w-fit"
              >
                Descargar curso completo (PDF)
              </a>
            </div>
          ) : (
            <>
              {typedCourse.free_until && new Date(typedCourse.free_until) > new Date() && (
                <CourseFreeCountdown
                  freeUntil={typedCourse.free_until}
                  normalPriceCents={typedCourse.price_cents}
                />
              )}
              <div id="comprar" className="flex items-center gap-4 flex-wrap">
                {typedCourse.free_until && new Date(typedCourse.free_until) > new Date() ? (
                  <span className="font-sora font-black text-3xl text-green-400">GRATIS</span>
                ) : (
                  <span className="font-sora font-black text-3xl">
                    ${(typedCourse.price_cents / 100).toFixed(0)} USD
                  </span>
                )}
                <BuyCourseButton
                  courseSlug={typedCourse.slug}
                  stripePriceId={typedCourse.stripe_price_id}
                  isLoggedIn={!!user}
                  freeUntil={typedCourse.free_until ?? undefined}
                  firstLessonId={firstLessonId}
                  customCheckoutLink={(typedCourse as any).long_description?.stripe_checkout_link}
                />
              </div>
            </>
          )}
        </div>

        {/* Lesson list */}
        {totalLessons > 0 && (
          <div>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-gray2 mb-6">
              Contenido — {totalLessons} lecciones
            </div>
            <div className="flex flex-col gap-2">
              {(lessons as Pick<Lesson, 'id' | 'title' | 'order_index' | 'duration_seconds' | 'mux_playback_id'>[])
                .map((lesson, i) => {
                  const completed = enrollment ? lesson.id in (enrollment.progress || {}) : false
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-bg2/40"
                    >
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold border border-white/[0.1]"
                        style={completed ? { background: '#4FC3F7', color: '#080B14', borderColor: 'transparent' } : {}}
                      >
                        {completed ? '✓' : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-sora font-medium text-sm truncate">{lesson.title}</div>
                        {lesson.duration_seconds && (
                          <div className="font-mono text-[11px] text-gray2 mt-0.5">
                            {formatDuration(lesson.duration_seconds)}
                          </div>
                        )}
                      </div>
                      {enrollment ? (
                        <Link href={`/courses/${slug}/${lesson.id}`}>
                          <Button variant="outline" size="sm">
                            {completed ? 'Repasar' : 'Ver'}
                          </Button>
                        </Link>
                      ) : (
                        <span className="font-mono text-[11px] text-gray2">🔒</span>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {totalLessons === 0 && (
          <div className="text-center py-16 text-gray2 font-mono text-[11px] uppercase tracking-wider">
            Lecciones próximamente
          </div>
        )}

        {/* Second CTA — bottom of temario, only for non-enrolled */}
        {!enrollment && totalLessons > 0 && (
          <div className="mt-10 rounded-2xl border border-cyan/20 bg-cyan/[0.04] p-8 text-center">
            {typedCourse.free_until && new Date(typedCourse.free_until) > new Date() && (
              <p className="font-mono text-[10px] uppercase tracking-[3px] text-cyan mb-3">
                ⚡ Acceso gratuito por tiempo limitado
              </p>
            )}
            <p className="font-sora text-white font-bold text-lg mb-6">
              ¿Listo para empezar? El acceso es gratis hoy.
            </p>
            <BuyCourseButton
              courseSlug={typedCourse.slug}
              stripePriceId={typedCourse.stripe_price_id}
              isLoggedIn={!!user}
              freeUntil={typedCourse.free_until ?? undefined}
              firstLessonId={firstLessonId}
              customCheckoutLink={(typedCourse as any).long_description?.stripe_checkout_link}
            />
          </div>
        )}
      </div>
    </div>
  )
}
