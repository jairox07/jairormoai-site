import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { AdminDashboard } from './AdminDashboard'

export const metadata = { title: 'Admin — jairoromo.ai' }

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jairoromo@gmail.com'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/')

  const service = getServiceClient()

  const { data: themeRow } = await service.from('site_settings').select('value').eq('key', 'theme').single()
  const currentTheme = themeRow?.value === 'v2' ? 'v2' : 'v1'

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Fetch all stats in parallel
  const [
    { count: totalUsers },
    { count: newsletterCount },
    { count: enrollmentCount },
    { count: commentCount },
    { count: pageViewCount },
    { count: pageViewTodayCount },
    { data: recentActivity },
    { data: profiles },
    { data: newsletterSubs },
    { data: allEnrollments },
    { data: pageViews },
    { data: interactionEvents },
    { data: authUsersData },
  ] = await Promise.all([
    service.from('profiles').select('*', { count: 'exact', head: true }),
    service.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
    service.from('enrollments').select('*', { count: 'exact', head: true }),
    service.from('comments').select('*', { count: 'exact', head: true }),
    service.from('activity_log').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view'),
    service.from('activity_log').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view').gte('created_at', todayStart.toISOString()),
    service.from('activity_log').select('*').order('created_at', { ascending: false }).limit(50),
    service.from('profiles').select('id, full_name, created_at, is_admin').order('created_at', { ascending: false }).limit(200),
    service.from('newsletter_subscribers').select('email, created_at').order('created_at', { ascending: false }).limit(100),
    service.from('enrollments').select('user_id, course_id, enrolled_at, stripe_session_id, courses(title)').order('enrolled_at', { ascending: false }).limit(500),
    service.from('activity_log').select('metadata, created_at').eq('event_type', 'page_view').order('created_at', { ascending: false }).limit(500),
    service.from('activity_log').select('user_id, event_type, created_at').neq('event_type', 'page_view').order('created_at', { ascending: false }).limit(1000),
    service.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  // Aggregate top pages from recent page_view events
  const pageCounts = new Map<string, number>()
  for (const row of pageViews || []) {
    const path = (row.metadata as Record<string, unknown>)?.path
    if (typeof path === 'string') {
      pageCounts.set(path, (pageCounts.get(path) || 0) + 1)
    }
  }
  const topPages = Array.from(pageCounts.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Map auth user id -> { email, last_sign_in_at }
  const authById = new Map<string, { email: string; last_sign_in_at: string | null }>()
  const authByEmail = new Map<string, { id: string; email: string }>()
  for (const u of authUsersData?.users || []) {
    if (!u.email) continue
    authById.set(u.id, { email: u.email, last_sign_in_at: u.last_sign_in_at ?? null })
    authByEmail.set(u.email.toLowerCase(), { id: u.id, email: u.email })
  }

  // Group enrollments by user
  const purchasesByUser = new Map<string, string[]>()
  for (const e of allEnrollments || []) {
    const course = e.courses as { title?: string } | null
    const title = course?.title || e.course_id
    const list = purchasesByUser.get(e.user_id) || []
    list.push(title)
    purchasesByUser.set(e.user_id, list)
  }

  // Count interactions (non-page_view events) by user
  const interactionsByUser = new Map<string, Record<string, number>>()
  for (const a of interactionEvents || []) {
    if (!a.user_id) continue
    const counts = interactionsByUser.get(a.user_id) || {}
    counts[a.event_type] = (counts[a.event_type] || 0) + 1
    interactionsByUser.set(a.user_id, counts)
  }

  // Build enriched users list
  const recentUsers = (profiles || []).map((p) => {
    const auth = authById.get(p.id)
    return {
      id: p.id,
      full_name: p.full_name,
      email: auth?.email ?? null,
      created_at: p.created_at,
      last_sign_in_at: auth?.last_sign_in_at ?? null,
      is_admin: p.is_admin,
      purchases: purchasesByUser.get(p.id) || [],
      interactions: interactionsByUser.get(p.id) || {},
    }
  })

  // Enrich newsletter subs with registration + purchase info
  const newsletterEnriched = (newsletterSubs || []).map((s) => {
    const match = authByEmail.get(s.email.toLowerCase())
    return {
      email: s.email,
      created_at: s.created_at,
      isRegistered: !!match,
      purchases: match ? (purchasesByUser.get(match.id) || []) : [],
    }
  })

  return (
    <AdminDashboard
      adminEmail={user.email!}
      currentTheme={currentTheme}
      stats={{
        totalUsers: totalUsers ?? 0,
        newsletterCount: newsletterCount ?? 0,
        enrollmentCount: enrollmentCount ?? 0,
        commentCount: commentCount ?? 0,
        pageViewCount: pageViewCount ?? 0,
        pageViewTodayCount: pageViewTodayCount ?? 0,
      }}
      recentActivity={recentActivity || []}
      recentUsers={recentUsers}
      newsletterSubs={newsletterEnriched}
      enrollments={(allEnrollments || []).slice(0, 20)}
      topPages={topPages}
    />
  )
}
