'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

interface LessonPlayerProps {
  lessonId: string
  playbackId: string
  enrollmentId: string
  isCompleted: boolean
  downloadableUrl?: string | null
  nextLessonId?: string
  courseSlug: string
}

export function LessonPlayer({
  lessonId,
  playbackId,
  enrollmentId,
  isCompleted,
  downloadableUrl,
  nextLessonId,
  courseSlug,
}: LessonPlayerProps) {
  const [completed, setCompleted] = useState(isCompleted)
  const [saving, setSaving] = useState(false)

  const markComplete = async () => {
    if (completed) return
    setSaving(true)
    const supabase = createClient()

    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('progress')
      .eq('id', enrollmentId)
      .single()

    const progress: Record<string, string> = (enrollment?.progress as Record<string, string>) || {}
    progress[lessonId] = new Date().toISOString()

    await supabase
      .from('enrollments')
      .update({ progress })
      .eq('id', enrollmentId)

    setCompleted(true)
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Mux iframe embed — no server-only dependencies */}
      <div className="rounded-xl overflow-hidden bg-black aspect-video">
        <iframe
          src={`https://stream.mux.com/${playbackId}`}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 0 }}
          title="Lesson video"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant={completed ? 'outline' : 'primary'}
            size="sm"
            loading={saving}
            onClick={markComplete}
            disabled={completed}
          >
            {completed ? '✓ Completada' : 'Marcar como completada'}
          </Button>

          {downloadableUrl && (
            <a href={downloadableUrl} download target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                Descargar material
              </Button>
            </a>
          )}
        </div>

        {nextLessonId && (
          <a href={`/courses/${courseSlug}/${nextLessonId}`}>
            <Button variant="ghost" size="sm">
              Siguiente lección →
            </Button>
          </a>
        )}
      </div>
    </div>
  )
}
