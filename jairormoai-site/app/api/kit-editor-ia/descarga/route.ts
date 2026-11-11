import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { KIT_EDITOR, KIT_EDITOR_DIR, verifyKitPurchase, type KitFile } from '@/lib/kit-editor-ia'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MIME: Record<string, string> = { '.zip': 'application/zip', '.pdf': 'application/pdf' }

// Descarga del Kit Editor IA: solo con una sesión de Stripe pagada de este producto.
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  const which = (req.nextUrl.searchParams.get('file') ?? 'zip') as KitFile
  const fileName = KIT_EDITOR.files[which]
  if (!fileName) return NextResponse.json({ error: 'Archivo inválido' }, { status: 400 })

  const purchase = await verifyKitPurchase(sessionId)
  if (!purchase.ok) {
    return NextResponse.json(
      { error: 'No encontramos un pago confirmado con este enlace. Usa el enlace de tu correo de compra o escríbenos a @jairoromo.ai.' },
      { status: 403 },
    )
  }

  try {
    const data = await readFile(path.join(KIT_EDITOR_DIR, fileName))
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': MIME[path.extname(fileName)] ?? 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Archivo no disponible por el momento. Escríbenos a @jairoromo.ai.' }, { status: 500 })
  }
}
