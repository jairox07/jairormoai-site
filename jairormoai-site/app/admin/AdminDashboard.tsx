'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { ActivityLog } from '@/lib/types'

type TabId = 'overview' | 'users' | 'newsletter' | 'purchases' | 'activity'
const VALID_TABS: TabId[] = ['overview', 'users', 'newsletter', 'purchases', 'activity']

const EVENT_ICONS: Record<string, string> = {
  signup: '👤',
  login: '🔑',
  purchase: '💳',
  download: '⬇️',
  comment: '💬',
  newsletter_subscribe: '📧',
  page_view: '👁',
}

const EVENT_LABELS: Record<string, string> = {
  signup: 'Nuevo registro',
  login: 'Inicio de sesión',
  purchase: 'Compra',
  download: 'Descarga',
  comment: 'Comentario',
  newsletter_subscribe: 'Suscripción newsletter',
  page_view: 'Visita',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface Props {
  stats: { totalUsers: number; newsletterCount: number; enrollmentCount: number; commentCount: number }
  recentActivity: ActivityLog[]
  recentUsers: Array<{ id: string; full_name: string | null; created_at: string }>
  newsletterSubs: Array<{ email: string; created_at: string }>
  enrollments: Array<{ user_id: string; course_id: string; enrolled_at: string; stripe_session_id: string | null; courses: unknown }>
}

export function AdminDashboard({ stats, recentActivity: initialActivity, recentUsers, newsletterSubs, enrollments }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activity, setActivity] = useState<ActivityLog[]>(initialActivity)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [liveCount, setLiveCount] = useState(0)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && (VALID_TABS as string[]).includes(tab)) {
      setActiveTab(tab as TabId)
    }
  }, [searchParams])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin-activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, (payload) => {
        setActivity(prev => [payload.new as ActivityLog, ...prev.slice(0, 49)])
        setLiveCount(n => n + 1)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const STAT_CARDS = [
    { label: 'Usuarios registrados', value: stats.totalUsers, icon: '👥', color: 'cyan' },
    { label: 'Newsletter', value: stats.newsletterCount, icon: '📧', color: 'purp' },
    { label: 'Inscripciones', value: stats.enrollmentCount, icon: '🎓', color: 'cyan' },
    { label: 'Comentarios', value: stats.commentCount, icon: '💬', color: 'purp' },
  ]

  const TABS = [
    { id: 'overview', label: 'Resumen' },
    { id: 'users', label: `Usuarios (${recentUsers.length})` },
    { id: 'newsletter', label: `Newsletter (${newsletterSubs.length})` },
    { id: 'purchases', label: `Compras (${enrollments.length})` },
    { id: 'activity', label: 'Actividad en vivo' },
  ] as const

  const QUICK_ACCESS = [
    { id: 'overview', label: 'Resumen', icon: '📊', color: 'cyan' },
    { id: 'users', label: 'Usuarios', icon: '👥', color: 'purp' },
    { id: 'newsletter', label: 'Newsletter', icon: '📧', color: 'cyan' },
    { id: 'purchases', label: 'Compras', icon: '💳', color: 'purp' },
    { id: 'activity', label: 'Actividad', icon: '⚡', color: 'cyan' },
  ] as const

  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-2">
              Panel de Administración
            </div>
            <h1 className="font-sora font-black text-3xl">jairoromo.ai</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse shadow-[0_0_6px_#4FC3F7]" />
              <span className="font-mono text-[11px] text-cyan">LIVE</span>
              {liveCount > 0 && (
                <span className="font-mono text-[10px] bg-cyan/10 border border-cyan/20 text-cyan px-2 py-0.5 rounded-full ml-1">
                  +{liveCount} nuevos
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/[0.1]">
              <Link href="/">
                <button className="font-mono text-[10px] font-bold uppercase tracking-[1px] px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray2 hover:text-white transition-colors">
                  Inicio
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="font-mono text-[10px] font-bold uppercase tracking-[1px] px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
          {QUICK_ACCESS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`rounded-xl p-4 transition-all border ${
                activeTab === section.id
                  ? section.color === 'cyan'
                    ? 'bg-cyan/20 border-cyan/40 ring-2 ring-cyan/30'
                    : 'bg-purp/20 border-purp/40 ring-2 ring-purp/30'
                  : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]'
              }`}
            >
              <div className="text-2xl mb-2">{section.icon}</div>
              <div className="font-sora text-[13px] font-bold">{section.label}</div>
            </button>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {STAT_CARDS.map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/[0.07] bg-bg2/60 p-6">
              <div className="text-2xl mb-3">{card.icon}</div>
              <div className="font-sora font-black text-3xl text-white mb-1">{card.value}</div>
              <div className="font-mono text-[11px] text-gray2 uppercase tracking-wider">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-mono text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan text-bg'
                  : 'bg-white/[0.04] border border-white/[0.08] text-gray2 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent signups */}
            <div className="rounded-2xl border border-white/[0.07] bg-bg2/40 p-6">
              <h3 className="font-sora font-bold mb-5">Registros recientes</h3>
              <div className="space-y-3">
                {recentUsers.slice(0, 8).map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan/10 border border-cyan/20 flex items-center justify-center font-mono text-[11px] text-cyan font-bold">
                        {(u.full_name || 'U')[0].toUpperCase()}
                      </div>
                      <span className="font-sora text-sm">{u.full_name || 'Sin nombre'}</span>
                    </div>
                    <span className="font-mono text-[10px] text-gray2">{formatDate(u.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live activity */}
            <div className="rounded-2xl border border-cyan/15 bg-bg2/40 p-6">
              <div className="flex items-center gap-2 mb-5">
                <h3 className="font-sora font-bold">Actividad en vivo</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activity.slice(0, 15).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 py-1.5">
                    <span className="text-base flex-shrink-0">{EVENT_ICONS[a.event_type] || '•'}</span>
                    <span className="font-sora text-sm flex-1">{EVENT_LABELS[a.event_type] || a.event_type}</span>
                    <span className="font-mono text-[10px] text-gray2 flex-shrink-0">{timeAgo(a.created_at)}</span>
                  </div>
                ))}
                {activity.length === 0 && (
                  <p className="font-sora text-gray text-sm text-center py-6">Sin actividad registrada aún.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="rounded-2xl border border-white/[0.07] bg-bg2/40 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <th className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-gray2 text-left px-6 py-4">Usuario</th>
                  <th className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-gray2 text-left px-6 py-4">Registro</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u, i) => (
                  <tr key={u.id} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purp/10 border border-purp/20 flex items-center justify-center font-mono text-[11px] text-purp font-bold">
                          {(u.full_name || 'U')[0].toUpperCase()}
                        </div>
                        <span className="font-sora text-sm">{u.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-gray2">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'newsletter' && (
          <div className="rounded-2xl border border-white/[0.07] bg-bg2/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.07]">
              <span className="font-mono text-[11px] text-gray2">{newsletterSubs.length} suscriptores</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {newsletterSubs.map((s) => (
                <div key={s.email} className="flex items-center justify-between px-6 py-3">
                  <span className="font-sora text-sm">{s.email}</span>
                  <span className="font-mono text-[10px] text-gray2">{formatDate(s.created_at)}</span>
                </div>
              ))}
              {newsletterSubs.length === 0 && (
                <p className="font-sora text-gray text-sm text-center py-12">Sin suscriptores todavía.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="rounded-2xl border border-white/[0.07] bg-bg2/40 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <th className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-gray2 text-left px-6 py-4">Curso</th>
                  <th className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-gray2 text-left px-6 py-4">Stripe ID</th>
                  <th className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-gray2 text-left px-6 py-4">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e, i) => {
                  const course = e.courses as { title?: string } | null
                  return (
                    <tr key={`${e.user_id}-${e.course_id}`} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                      <td className="px-6 py-4 font-sora text-sm">{course?.title || e.course_id}</td>
                      <td className="px-6 py-4 font-mono text-[10px] text-gray2">
                        {e.stripe_session_id ? e.stripe_session_id.slice(0, 20) + '…' : '—'}
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-gray2">{formatDate(e.enrolled_at)}</td>
                    </tr>
                  )
                })}
                {enrollments.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-12 text-center font-sora text-gray text-sm">Sin compras todavía.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="rounded-2xl border border-cyan/15 bg-bg2/40 p-6">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="font-sora font-bold">Feed en tiempo real</h3>
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse shadow-[0_0_6px_#4FC3F7]" />
              <span className="font-mono text-[10px] text-cyan">LIVE</span>
            </div>
            <div className="space-y-2">
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-4 py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-xl flex-shrink-0 mt-0.5">{EVENT_ICONS[a.event_type] || '•'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-sora font-semibold text-sm">{EVENT_LABELS[a.event_type] || a.event_type}</span>
                      <span className="font-mono text-[10px] text-gray2">{timeAgo(a.created_at)}</span>
                    </div>
                    {a.metadata && Object.keys(a.metadata).length > 0 && (
                      <p className="font-mono text-[10px] text-gray2 mt-0.5 truncate">
                        {JSON.stringify(a.metadata)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {activity.length === 0 && (
                <p className="font-sora text-gray text-sm text-center py-12">
                  Sin actividad registrada. Los eventos aparecerán aquí en tiempo real.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
