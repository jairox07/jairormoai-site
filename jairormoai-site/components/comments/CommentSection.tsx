'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { Comment } from '@/lib/types'

interface CommentSectionProps {
  projectId?: string
  courseId?: string
  userId: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function CommentSection({ projectId, courseId, userId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  const fetchComments = useCallback(async () => {
    const supabase = createClient()
    const filter = projectId ? { column: 'project_id', value: projectId } : { column: 'course_id', value: courseId }
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(full_name)')
      .eq(filter.column, filter.value!)
      .order('created_at', { ascending: false })
      .limit(50)
    setComments((data as Comment[]) || [])
    setFetching(false)
  }, [projectId, courseId])

  useEffect(() => { fetchComments() }, [fetchComments])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) { setError('Debes iniciar sesión para comentar'); return }
    if (!content.trim()) return
    setError('')
    setLoading(true)
    const supabase = createClient()
    const payload: Record<string, string> = { user_id: userId, content: content.trim() }
    if (projectId) payload.project_id = projectId
    if (courseId) payload.course_id = courseId
    const { error: err } = await supabase.from('comments').insert(payload)
    setLoading(false)
    if (err) { setError('Error al publicar comentario'); return }
    setContent('')
    fetchComments()
  }

  const onDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('comments').delete().eq('id', id)
    setComments(c => c.filter(x => x.id !== id))
  }

  return (
    <div className="mt-10 pt-8 border-t border-white/[0.07]">
      <h3 className="font-sora font-bold text-lg mb-6">
        Comentarios <span className="text-gray2 font-normal">({comments.length})</span>
      </h3>

      {userId && (
        <form onSubmit={onSubmit} className="mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comparte tu experiencia, duda o aporte..."
            maxLength={1000}
            rows={3}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 font-sora text-sm text-white placeholder:text-gray2 focus:outline-none focus:border-cyan/50 transition-colors resize-none mb-3"
          />
          {error && <p className="font-mono text-[11px] text-red-400 mb-2">{error}</p>}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-gray2">{content.length}/1000</span>
            <Button type="submit" variant="primary" size="sm" loading={loading} className="px-6">
              Publicar
            </Button>
          </div>
        </form>
      )}

      {!userId && (
        <div className="mb-8 p-4 rounded-xl border border-white/[0.07] bg-bg2/40 text-center">
          <p className="font-sora text-gray text-sm">
            <a href="/login" className="text-cyan hover:underline">Inicia sesión</a> para dejar un comentario.
          </p>
        </div>
      )}

      {fetching ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />)}
        </div>
      ) : comments.length === 0 ? (
        <p className="font-sora text-gray text-sm text-center py-8">
          Sin comentarios todavía. ¡Sé el primero!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-white/[0.07] bg-bg2/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sora font-semibold text-sm">
                  {c.profiles?.full_name || 'Usuario'}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-gray2">{formatDate(c.created_at)}</span>
                  {userId === c.user_id && (
                    <button
                      onClick={() => onDelete(c.id)}
                      className="font-mono text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
              <p className="font-sora text-sm text-gray leading-relaxed">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
