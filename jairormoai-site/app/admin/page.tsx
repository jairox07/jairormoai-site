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
    { data: recentUsers },
    { data: newsletterSubs },
    { data: enrollments },
    { data: pageViews },
  ] = await Promise.all([
    service.from('profiles').select('*', { count: 'exact', head: true }),
    service.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
    service.from('enrollments').select('*', { count: 'exact', head: true }),
    service.from('comments').select('*', { count: 'exact', head: true }),
    service.from('activity_log').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view'),
    service.from('activity_log').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view').gte('created_at', todayStart.toISOString()),
    service.from('activity_log').select('*').order('created_at', { ascending: false }).limit(50),
    service.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(20),
    service.from('newsletter_subscribers').select('email, created_at').order('created_at', { ascending: false }).limit(50),
    service.from('enrollments').select('user_id, course_id, enrolled_at, stripe_session_id, courses(title)').order('enrolled_at', { ascending: false }).limit(20),
    service.from('activity_log').select('metadata, created_at').eq('event_type', 'page_view').order('created_at', { ascending: false }).limit(500),
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

  return (
    <AdminDashboard
      adminEmail={user.email!}
      stats={{
        totalUsers: totalUsers ?? 0,
        newsletterCount: newsletterCount ?? 0,
        enrollmentCount: enrollmentCount ?? 0,
        commentCount: commentCount ?? 0,
        pageViewCount: pageViewCount ?? 0,
        pageViewTodayCount: pageViewTodayCount ?? 0,
      }}
      recentActivity={recentActivity || []}
      recentUsers={recentUsers || []}
      newsletterSubs={newsletterSubs || []}
      enrollments={enrollments || []}
      topPages={topPages}
    />
  )
}
