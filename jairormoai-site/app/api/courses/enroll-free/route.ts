import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Autenticación requerida' }, { status: 401 })
  }

  const { courseSlug } = await req.json()
  if (!courseSlug) {
    return NextResponse.json({ error: 'courseSlug requerido' }, { status: 400 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: course } = await service
    .from('courses')
    .select('id, free_until')
    .eq('slug', courseSlug)
    .single()

  if (!course) {
    return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
  }

  if (!course.free_until || new Date(course.free_until) <= new Date()) {
    return NextResponse.json({ error: 'El período gratuito ha terminado' }, { status: 403 })
  }

  await service.from('enrollments').upsert({
    user_id: user.id,
    course_id: course.id,
    stripe_session_id: 'free',
    progress: {},
  }, { onConflict: 'user_id,course_id' })

  return NextResponse.json({ ok: true })
}
