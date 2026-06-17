'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { ActivityLog } from '@/lib/types'

type TabId = 'overview' | 'users' | 'newsletter' | 'purchases' | 'activity' | 'courses' | 'profile'
const VALID_TABS: TabId[] = ['overview', 'users', 'newsletter', 'purchases', 'activity', 'courses', 'profile']
const PAGE_SIZE = 50

const EVENT_ICONS: Record<string, string> = {
  signup: '👤', login: '🔑', purchase: '💳', download: '⬇️',
  comment: '💬', newsletter_subscribe: '📧', page_view: '👁',
}
const EVENT_LABELS: Record<string, string> = {
  signup: 'Nuevo registro', login: 'Inicio de sesión', purchase: 'Compra',
  download: 'Descarga', comment: 'Comentario',
  newsletter_subscribe: 'Suscripción newsletter', page_view: 'Visita',
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

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / PAGE_SIZE)
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
      <span className="font-mono text-[10px] text-gray2">
        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total}
      </span>
      <div className="flex gap-2">
        <button disabled={page === 1} onClick={() => onChange(page - 1)}
          className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-white/[0.08] text-gray2 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          ← Anterior
        </button>
        <span className="font-mono text-[10px] px-3 py-1.5 text-gray2">{page}/{pages}</span>
        <button disabled={page === pages} onClick={() => onChange(page + 1)}
          className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-white/[0.08] text-gray2 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          Siguiente →
        </button>
      </div>
    </div>
  )
}

// ─── Modals ───────────────────────────────────────────────────────────────────

interface UserRow {
  id: string
  full_name: string | null
  email: string | null
  created_at: string
  last_sign_in_at: string | null
  is_admin?: boolean | null
  purchases: string[]
  interactions: Record<string, number>
}

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0d1117] p-8 shadow-2xl">
        {children}
      </div>
    </div>
  )
}

function FieldInput({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[2px] text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-sora text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50"
      />
    </div>
  )
}

function EditUserModal({ user, onClose, onSaved }: {
  user: UserRow; onClose: () => void; onSaved: (u: Partial<UserRow>) => void
}) {
  const [name, setName] = useState(user.full_name || '')
  const [email, setEmail] = useState(user.email || '')
  const [password, setPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(!!user.is_admin)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    setLoading(true); setError('')
    const body: Record<string, unknown> = {}
    if (name !== (user.full_name || '')) body.full_name = name
    if (email !== (user.email || '')) body.email = email
    if (password) body.password = password
    if (isAdmin !== !!user.is_admin) body.is_admin = isAdmin

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Error'); return }
    onSaved({ full_name: name, email, is_admin: isAdmin })
    onClose()
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[3px] text-cyan-400 mb-1">Editar usuario</div>
        <h2 className="font-sora font-bold text-xl">{user.full_name || user.email}</h2>
      </div>
      <div className="flex flex-col gap-4">
        <FieldInput label="Nombre" value={name} onChange={setName} placeholder="Nombre completo" />
        <FieldInput label="Email" type="email" value={email} onChange={setEmail} placeholder="correo@ejemplo.com" />
        <FieldInput label="Nueva contraseña (opcional)" type="password" value={password} onChange={setPassword} placeholder="Dejar vacío para no cambiar" />
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setIsAdmin(v => !v)}
            className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${isAdmin ? 'bg-cyan-500' : 'bg-white/10'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${isAdmin ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          <span className="font-sora text-sm">Permisos de Admin</span>
        </label>
        {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 font-mono text-[11px] uppercase tracking-[1px] px-4 py-3 rounded-xl border border-white/[0.08] text-gray-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button onClick={save} disabled={loading}
            className="flex-1 font-mono text-[11px] uppercase tracking-[1px] px-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50">
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const create = async () => {
    if (!email || !password) { setError('Email y contraseña requeridos'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, email, password, is_admin: isAdmin }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Error'); return }
    onCreated()
    onClose()
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[3px] text-cyan-400 mb-1">Nuevo usuario</div>
        <h2 className="font-sora font-bold text-xl">Crear cuenta</h2>
      </div>
      <div className="flex flex-col gap-4">
        <FieldInput label="Nombre completo" value={name} onChange={setName} placeholder="Nombre" />
        <FieldInput label="Email" type="email" value={email} onChange={setEmail} placeholder="correo@ejemplo.com" />
        <FieldInput label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" />
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setIsAdmin(v => !v)}
            className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${isAdmin ? 'bg-cyan-500' : 'bg-white/10'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${isAdmin ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          <span className="font-sora text-sm">Permisos de Admin</span>
        </label>
        {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 font-mono text-[11px] uppercase tracking-[1px] px-4 py-3 rounded-xl border border-white/[0.08] text-gray-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button onClick={create} disabled={loading}
            className="flex-1 font-mono text-[11px] uppercase tracking-[1px] px-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50">
            {loading ? 'Creando…' : 'Crear usuario'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

function DeleteUserModal({ user, onClose, onDeleted }: {
  user: UserRow; onClose: () => void; onDeleted: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const del = async () => {
    setLoading(true); setError('')
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Error'); return }
    onDeleted()
    onClose()
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[3px] text-red-400 mb-1">Eliminar usuario</div>
        <h2 className="font-sora font-bold text-xl">¿Confirmar eliminación?</h2>
      </div>
      <p className="font-sora text-sm text-gray-400 mb-6">
        Esta acción eliminará permanentemente la cuenta de <strong className="text-white">{user.full_name || user.email}</strong> y todos sus datos. No se puede deshacer.
      </p>
      {error && <p className="font-mono text-[11px] text-red-400 mb-4">{error}</p>}
      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 font-mono text-[11px] uppercase tracking-[1px] px-4 py-3 rounded-xl border border-white/[0.08] text-gray-400 hover:text-white transition-colors">
          Cancelar
        </button>
        <button onClick={del} disabled={loading}
          className="flex-1 font-mono text-[11px] uppercase tracking-[1px] px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50">
          {loading ? 'Eliminando…' : 'Eliminar'}
        </button>
      </div>
    </ModalOverlay>
  )
}

// ─── Courses ──────────────────────────────────────────────────────────────────

interface CourseRow {
  id: string; slug: string; title: string; price_cents: number; free_until: string | null; published: boolean
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  adminEmail: string
  stats: { totalUsers: number; newsletterCount: number; enrollmentCount: number; commentCount: number; pageViewCount: number; pageViewTodayCount: number }
  recentActivity: ActivityLog[]
  recentUsers: UserRow[]
  newsletterSubs: Array<{ email: string; created_at: string; isRegistered: boolean; purchases: string[] }>
  enrollments: Array<{ user_id: string; course_id: string; enrolled_at: string; stripe_session_id: string | null; courses: unknown }>
  topPages: Array<{ path: string; count: number }>
}

export function AdminDashboard({ adminEmail, stats, recentActivity: initialActivity, recentUsers: initialUsers, newsletterSubs, enrollments, topPages }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activity, setActivity] = useState<ActivityLog[]>(initialActivity)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [liveCount, setLiveCount] = useState(0)

  // Users state (mutable locally)
  const [users, setUsers] = useState<UserRow[]>(initialUsers)

  // Pagination
  const [usersPage, setUsersPage] = useState(1)
  const [newsletterPage, setNewsletterPage] = useState(1)
  const [purchasesPage, setPurchasesPage] = useState(1)
  const [activityPage, setActivityPage] = useState(1)

  // User modals
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null)
  const [showCreateUser, setShowCreateUser] = useState(false)

  // Courses
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [savingCourse, setSavingCourse] = useState<string | null>(null)
  const [freeDays, setFreeDays] = useState<Record<string, string>>({})

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && (VALID_TABS as string[]).includes(tab)) setActiveTab(tab as TabId)
  }, [searchParams])

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

  useEffect(() => {
    if (activeTab !== 'courses') return
    const supabase = createClient()
    supabase.from('courses').select('id, slug, title, price_cents, free_until, published').order('created_at').then(({ data }) => {
      if (data) {
        setCourses(data as CourseRow[])
        const init: Record<string, string> = {}
        data.forEach((c: CourseRow) => { init[c.id] = '7' })
        setFreeDays(init)
      }
    })
  }, [activeTab])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const setCourseFree = async (courseId: string, days: number) => {
    setSavingCourse(courseId)
    const supabase = createClient()
    const freeUntil = new Date(Date.now() + days * 86400000).toISOString()
    await supabase.from('courses').update({ free_until: freeUntil }).eq('id', courseId)
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, free_until: freeUntil } : c))
    setSavingCourse(null)
  }

  const setCoursePaid = async (courseId: string) => {
    setSavingCourse(courseId)
    const supabase = createClient()
    await supabase.from('courses').update({ free_until: null }).eq('id', courseId)
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, free_until: null } : c))
    setSavingCourse(null)
  }

  // Local user mutations (optimistic)
  const applyUserEdit = (id: string, patch: Partial<UserRow>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u))
  }
  const removeUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  const STAT_CARDS = [
    { label: 'Usuarios registrados', value: stats.totalUsers, icon: '👥', color: 'cyan' },
    { label: 'Visitas totales', value: stats.pageViewCount, icon: '👁', color: 'purp' },
    { label: 'Visitas hoy', value: stats.pageViewTodayCount, icon: '📈', color: 'cyan' },
    { label: 'Newsletter', value: stats.newsletterCount, icon: '📧', color: 'purp' },
    { label: 'Inscripciones', value: stats.enrollmentCount, icon: '🎓', color: 'cyan' },
    { label: 'Comentarios', value: stats.commentCount, icon: '💬', color: 'purp' },
  ]
  const QUICK_ACCESS = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'users', label: `Usuarios (${users.length})`, icon: '👥' },
    { id: 'newsletter', label: `Newsletter (${newsletterSubs.length})`, icon: '📧' },
    { id: 'purchases', label: `Compras (${enrollments.length})`, icon: '💳' },
    { id: 'activity', label: 'Actividad', icon: '⚡' },
    { id: 'courses', label: 'Cursos', icon: '🎓' },
    { id: 'profile', label: 'Perfil', icon: '⚙️' },
  ] as const

  const usersSlice = users.slice((usersPage - 1) * PAGE_SIZE, usersPage * PAGE_SIZE)
  const newsletterSlice = newsletterSubs.slice((newsletterPage - 1) * PAGE_SIZE, newsletterPage * PAGE_SIZE)
  const enrollmentsSlice = enrollments.slice((purchasesPage - 1) * PAGE_SIZE, purchasesPage * PAGE_SIZE)
  const activitySlice = activity.slice((activityPage - 1) * PAGE_SIZE, activityPage * PAGE_SIZE)

  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      {/* Modals */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={(patch) => applyUserEdit(editingUser.id, patch)}
        />
      )}
      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onDeleted={() => removeUser(deletingUser.id)}
        />
      )}
      {showCreateUser && (
        <CreateUserModal
          onClose={() => setShowCreateUser(false)}
          onCreated={() => router.refresh()}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-2">Panel de Administración</div>
            <h1 className="font-sora font-black text-3xl">jairoromo.ai</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse shadow-[0_0_6px_#4FC3F7]" />
              <span className="font-mono text-[11px] text-cyan">LIVE</span>
              {liveCount > 0 && (
                <span className="font-mono text-[10px] bg-cyan/10 border border-cyan/20 text-cyan px-2 py-0.5 rounded-full ml-1">+{liveCount} nuevos</span>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/[0.1]">
              <Link href="/"><button className="font-mono text-[10px] font-bold uppercase tracking-[1px] px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray2 hover:text-white transition-colors">Inicio</button></Link>
              <button onClick={handleLogout} className="font-mono text-[10px] font-bold uppercase tracking-[1px] px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">Salir</button>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 mb-10">
          {QUICK_ACCESS.map((s) => (
            <button key={s.id} onClick={() => setActiveTab(s.id as TabId)}
              className={`rounded-xl p-4 transition-all border ${activeTab === s.id ? 'bg-cyan/20 border-cyan/40 ring-2 ring-cyan/30' : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]'}`}
            >
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-sora text-[12px] font-bold">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {STAT_CARDS.map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/[0.07] bg-bg2/60 p-6">
              <div className="text-2xl mb-3">{card.icon}</div>
              <div className="font-sora font-black text-3xl text-white mb-1">{card.value}</div>
              <div className="font-mono text-[11px] text-gray2 uppercase tracking-wider">{card.label}</div>
            </div>
          ))}
        </div>

        {/* === OVERVIEW === */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/[0.07] bg-bg2/40 p-6">
              <h3 className="font-sora font-bold mb-5">Registros recientes</h3>
              <div className="space-y-3">
                {users.slice(0, 8).map((u) => (
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
                {users.length === 0 && <p className="font-sora text-gray text-sm text-center py-6">Sin registros todavía.</p>}
              </div>
            </div>
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
                {activity.length === 0 && <p className="font-sora text-gray text-sm text-center py-6">Sin actividad.</p>}
              </div>
            </div>
            <div className="rounded-2xl border border-purp/15 bg-bg2/40 p-6 lg:col-span-2">
              <h3 className="font-sora font-bold mb-5">Páginas más visitadas</h3>
              <div className="space-y-2">
                {topPages.map((p) => {
                  const max = topPages[0]?.count || 1
                  return (
                    <div key={p.path} className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-gray w-40 truncate flex-shrink-0">{p.path}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,#4FC3F7,#8B5CF6)]" style={{ width: `${(p.count / max) * 100}%` }} />
                      </div>
                      <span className="font-mono text-[11px] text-gray2 w-10 text-right flex-shrink-0">{p.count}</span>
                    </div>
                  )
                })}
                {topPages.length === 0 && <p className="font-sora text-gray text-sm text-center py-6">Sin visitas.</p>}
              </div>
            </div>
          </div>
        )}

        {/* === USERS === */}
        {activeTab === 'users' && (
          <div className="rounded-2xl border border-white/[0.07] bg-bg2/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
              <span className="font-mono text-[11px] text-gray2">{users.length} usuarios totales</span>
              <button
                onClick={() => setShowCreateUser(true)}
                className="font-mono text-[10px] font-bold uppercase tracking-[1px] px-3 py-1.5 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan hover:bg-cyan/20 transition-colors"
              >
                + Crear usuario
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    {['Usuario', 'Email', 'Rol', 'Registro', 'Compras', 'Acciones'].map(h => (
                      <th key={h} className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-gray2 text-left px-6 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersSlice.map((u, i) => (
                    <tr key={u.id} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purp/10 border border-purp/20 flex items-center justify-center font-mono text-[11px] text-purp font-bold">
                            {(u.full_name || u.email || 'U')[0].toUpperCase()}
                          </div>
                          <span className="font-sora text-sm">{u.full_name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-gray2">{u.email || '—'}</td>
                      <td className="px-6 py-4">
                        {u.is_admin
                          ? <span className="font-mono text-[9px] bg-cyan/10 border border-cyan/30 text-cyan px-2 py-0.5 rounded-full uppercase">Admin</span>
                          : <span className="font-mono text-[9px] bg-white/[0.04] border border-white/[0.08] text-gray2 px-2 py-0.5 rounded-full uppercase">Usuario</span>
                        }
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-gray2">{formatDate(u.created_at)}</td>
                      <td className="px-6 py-4 font-mono text-[11px] text-gray2">
                        {u.purchases.length > 0
                          ? <span className="font-mono text-[10px] bg-cyan/10 border border-cyan/30 text-cyan px-2 py-0.5 rounded-full" title={u.purchases.join(', ')}>{u.purchases.length}</span>
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="font-mono text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray2 hover:text-white hover:border-white/20 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setDeletingUser(u)}
                            disabled={u.email === adminEmail}
                            className="font-mono text-[10px] px-2.5 py-1 rounded-lg bg-red-500/[0.06] border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={usersPage} total={users.length} onChange={setUsersPage} />
          </div>
        )}

        {/* === NEWSLETTER === */}
        {activeTab === 'newsletter' && (
          <div className="rounded-2xl border border-white/[0.07] bg-bg2/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
              <span className="font-mono text-[11px] text-gray2">{newsletterSubs.length} suscriptores</span>
              <a href="https://app.brevo.com/contact/list" target="_blank" rel="noopener noreferrer"
                className="font-mono text-[10px] font-bold uppercase tracking-[1px] px-3 py-1.5 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan hover:bg-cyan/20 transition-colors">
                Enviar campaña en Brevo →
              </a>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {newsletterSlice.map((s) => (
                <div key={s.email} className="flex items-center justify-between px-6 py-3 gap-3">
                  <span className="font-sora text-sm truncate">{s.email}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {s.isRegistered
                      ? <span className="font-mono text-[9px] bg-cyan/10 border border-cyan/30 text-cyan px-2 py-0.5 rounded-full uppercase">registrado</span>
                      : <span className="font-mono text-[9px] bg-white/[0.04] border border-white/[0.08] text-gray2 px-2 py-0.5 rounded-full uppercase">newsletter</span>
                    }
                    {s.purchases.length > 0 && (
                      <span className="font-mono text-[9px] bg-purp/10 border border-purp/30 text-purp px-2 py-0.5 rounded-full" title={s.purchases.join(', ')}>
                        {s.purchases.length} compra{s.purchases.length > 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-gray2">{formatDate(s.created_at)}</span>
                  </div>
                </div>
              ))}
              {newsletterSubs.length === 0 && <p className="font-sora text-gray text-sm text-center py-12">Sin suscriptores todavía.</p>}
            </div>
            <Pagination page={newsletterPage} total={newsletterSubs.length} onChange={setNewsletterPage} />
          </div>
        )}

        {/* === PURCHASES === */}
        {activeTab === 'purchases' && (
          <div className="rounded-2xl border border-white/[0.07] bg-bg2/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.07]">
              <span className="font-mono text-[11px] text-gray2">{enrollments.length} inscripciones totales</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    {['Curso', 'Stripe / Tipo', 'Fecha'].map(h => (
                      <th key={h} className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-gray2 text-left px-6 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enrollmentsSlice.map((e, i) => {
                    const course = e.courses as { title?: string } | null
                    return (
                      <tr key={`${e.user_id}-${e.course_id}`} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                        <td className="px-6 py-4 font-sora text-sm">{course?.title || e.course_id}</td>
                        <td className="px-6 py-4 font-mono text-[10px] text-gray2">
                          {e.stripe_session_id === 'free'
                            ? <span className="bg-green-500/10 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full">Gratis</span>
                            : e.stripe_session_id ? e.stripe_session_id.slice(0, 24) + '…' : '—'}
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
            <Pagination page={purchasesPage} total={enrollments.length} onChange={setPurchasesPage} />
          </div>
        )}

        {/* === ACTIVITY === */}
        {activeTab === 'activity' && (
          <div className="rounded-2xl border border-cyan/15 bg-bg2/40 p-6">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="font-sora font-bold">Feed en tiempo real</h3>
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse shadow-[0_0_6px_#4FC3F7]" />
              <span className="font-mono text-[10px] text-cyan">LIVE</span>
            </div>
            <div className="space-y-2 mb-6">
              {activitySlice.map((a) => (
                <div key={a.id} className="flex items-start gap-4 py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-xl flex-shrink-0 mt-0.5">{EVENT_ICONS[a.event_type] || '•'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-sora font-semibold text-sm">{EVENT_LABELS[a.event_type] || a.event_type}</span>
                      <span className="font-mono text-[10px] text-gray2">{timeAgo(a.created_at)}</span>
                    </div>
                    {a.metadata && Object.keys(a.metadata).length > 0 && (
                      <p className="font-mono text-[10px] text-gray2 mt-0.5 truncate">{JSON.stringify(a.metadata)}</p>
                    )}
                  </div>
                </div>
              ))}
              {activity.length === 0 && <p className="font-sora text-gray text-sm text-center py-12">Sin actividad registrada.</p>}
            </div>
            <Pagination page={activityPage} total={activity.length} onChange={setActivityPage} />
          </div>
        )}

        {/* === COURSES === */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div className="font-mono text-[11px] text-gray2 uppercase tracking-[2px] mb-6">Gestión de cursos — acceso gratuito</div>
            {courses.length === 0 && <p className="font-sora text-gray text-sm text-center py-12">Cargando cursos…</p>}
            {courses.map((c) => {
              const isFreeNow = !!c.free_until && new Date(c.free_until) > new Date()
              const freeUntilDate = c.free_until ? new Date(c.free_until) : null
              const saving = savingCourse === c.id
              return (
                <div key={c.id} className="rounded-2xl border border-white/[0.07] bg-bg2/40 p-6 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-sora font-bold text-base">{c.title}</span>
                      {!c.published && (
                        <span className="font-mono text-[9px] bg-white/[0.06] border border-white/[0.12] text-gray2 px-2 py-0.5 rounded-full uppercase">no publicado</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-[11px] text-gray2">${(c.price_cents / 100).toFixed(0)} USD</span>
                      {isFreeNow
                        ? <span className="font-mono text-[10px] bg-green-500/10 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full uppercase">GRATIS hasta {freeUntilDate?.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                        : <span className="font-mono text-[10px] bg-white/[0.04] border border-white/[0.08] text-gray2 px-2 py-0.5 rounded-full uppercase">Precio normal</span>
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                    {isFreeNow ? (
                      <button onClick={() => setCoursePaid(c.id)} disabled={saving}
                        className="font-mono text-[10px] font-bold uppercase tracking-[1px] px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50">
                        {saving ? '…' : 'Quitar acceso gratis'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select value={freeDays[c.id] || '7'} onChange={(e) => setFreeDays(prev => ({ ...prev, [c.id]: e.target.value }))}
                          className="font-mono text-[11px] px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-cyan/40">
                          {[1,2,3,5,7,14,30].map(d => (
                            <option key={d} value={String(d)}>{d} día{d > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                        <button onClick={() => setCourseFree(c.id, parseInt(freeDays[c.id] || '7'))} disabled={saving}
                          className="font-mono text-[10px] font-bold uppercase tracking-[1px] px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50">
                          {saving ? '…' : 'Poner gratis'}
                        </button>
                      </div>
                    )}
                    <Link href={`/courses/${c.slug}`} target="_blank">
                      <button className="font-mono text-[10px] font-bold uppercase tracking-[1px] px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray2 hover:text-white transition-colors">Ver →</button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* === PROFILE === */}
        {activeTab === 'profile' && (
          <div className="rounded-2xl border border-white/[0.07] bg-bg2/40 p-8 max-w-lg">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-[linear-gradient(135deg,#4FC3F7,#6B8EF5,#8B5CF6)] flex items-center justify-center font-sora font-black text-xl text-bg flex-shrink-0">
                {adminEmail[0].toUpperCase()}
              </div>
              <div>
                <div className="font-sora font-bold text-lg">Administrador</div>
                <div className="font-mono text-[12px] text-gray2">{adminEmail}</div>
              </div>
            </div>
            <div className="space-y-3 mb-8">
              {[['Email', adminEmail], ['Rol', 'Admin'], ['Sitio', 'jairoromo.ai']].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-white/[0.05]">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-gray2">{label}</span>
                  <span className="font-sora text-sm">{val}</span>
                </div>
              ))}
            </div>
            <button onClick={handleLogout} className="w-full font-mono text-[11px] font-bold uppercase tracking-[2px] px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
