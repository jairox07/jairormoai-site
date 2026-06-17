import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jairoromo@gmail.com'

function service() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const svc = service()

  const authUpdate: Record<string, unknown> = {}
  if (body.email) authUpdate.email = body.email
  if (body.password) authUpdate.password = body.password
  if (body.full_name !== undefined) authUpdate.user_metadata = { full_name: body.full_name }

  if (Object.keys(authUpdate).length > 0) {
    const { error } = await svc.auth.admin.updateUserById(id, authUpdate)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (body.is_admin !== undefined) {
    await svc.from('profiles').update({ is_admin: body.is_admin }).eq('id', id)
  }
  if (body.full_name !== undefined) {
    await svc.from('profiles').update({ full_name: body.full_name }).eq('id', id)
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Prevent self-deletion
  if (id === admin.id) {
    return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 })
  }

  const svc = service()
  const { error } = await svc.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
