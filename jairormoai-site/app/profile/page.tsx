import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

function service() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/profile')

  const svc = service()

  const [
    { data: profile },
    { data: enrollments },
    { data: downloads },
    { data: newsletter },
  ] = await Promise.all([
    svc.from('profiles').select('full_name, avatar_url, created_at').eq('id', user.id).single(),
    svc.from('enrollments')
      .select('enrolled_at, course_id, courses(title, slug)')
      .eq('user_id', user.id)
      .order('enrolled_at', { ascending: false }),
    svc.from('activity_log')
      .select('created_at, metadata')
      .eq('user_id', user.id)
      .in('event_type', ['skill_download', 'download'])
      .order('created_at', { ascending: false }),
    svc.from('newsletter_subscribers')
      .select('email, created_at')
      .eq('email', user.email!)
      .maybeSingle(),
  ])

  const name = profile?.full_name ?? user.user_metadata?.full_name ?? user.email ?? 'Usuario'
  const initials = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <main className="min-h-screen pt-24 pb-16 px-6 md:px-12">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center gap-5">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={name} className="w-16 h-16 rounded-full object-cover border border-white/10" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-cyan/10 border border-cyan/20 flex items-center justify-center font-sora font-black text-xl text-cyan">
              {initials}
            </div>
          )}
          <div>
            <h1 className="font-sora font-black text-2xl">{name}</h1>
            <p className="font-mono text-[11px] text-gray2 mt-1">{user.email}</p>
            {profile?.created_at && (
              <p className="font-mono text-[10px] text-gray2/60 mt-0.5">Miembro desde {fmt(profile.created_at)}</p>
            )}
          </div>
          {newsletter && (
            <span className="ml-auto font-mono text-[10px] bg-cyan/10 border border-cyan/20 text-cyan px-2.5 py-1 rounded-full uppercase tracking-wider">
              Newsletter ✓
            </span>
          )}
        </div>

        {/* Compras / Cursos */}
        <section>
          <EyebrowPill className="mb-4">Compras y cursos</EyebrowPill>
          {enrollments && enrollments.length > 0 ? (
            <ul className="space-y-2">
              {enrollments.map((e: any) => (
                <li key={e.course_id} className="flex items-center justify-between bg-bg2 border border-white/[0.06] rounded-xl px-4 py-3">
                  <span className="font-sora text-sm">{e.courses?.title ?? 'Curso'}</span>
                  <span className="font-mono text-[10px] text-gray2">{fmt(e.enrolled_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sora text-sm text-gray2">Sin compras aún.</p>
          )}
        </section>

        {/* Descargas */}
        <section>
          <EyebrowPill className="mb-4">Descargas</EyebrowPill>
          {downloads && downloads.length > 0 ? (
            <ul className="space-y-2">
              {downloads.map((d: any, i: number) => (
                <li key={i} className="flex items-center justify-between bg-bg2 border border-white/[0.06] rounded-xl px-4 py-3">
                  <span className="font-sora text-sm">{d.metadata?.title ?? d.metadata?.file ?? d.metadata?.slug ?? 'Recurso'}</span>
                  <span className="font-mono text-[10px] text-gray2">{fmt(d.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sora text-sm text-gray2">Sin descargas aún.</p>
          )}
        </section>

      </div>
    </main>
  )
}
