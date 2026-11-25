import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import JSZip from 'jszip'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { KIT_EDITOR, KIT_EDITOR_DIR, verifyKitPurchase, type KitFile } from '@/lib/kit-editor-ia'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Marca por comprador: cada descarga lleva el correo y la sesión de quien compró (visible en LICENCIA.txt, en un
// archivo oculto del kit y en el pie del manual). Si una copia circula, se sabe de quién salió.
async function marcarZip(data: Buffer, email: string | null, sessionId: string) {
  const zip = await JSZip.loadAsync(data)
  const quien = email ?? 'comprador sin correo'
  const fecha = new Date().toISOString().slice(0, 10)
  const marca = `Licenciado a: ${quien}\nCompra: ${sessionId}\nFecha de descarga: ${fecha}\n`
  const lic = zip.file('kit-editor-ia/LICENCIA.txt')
  const base = lic ? await lic.async('string') : ''
  zip.file('kit-editor-ia/LICENCIA.txt', `${base}\n---\n${marca}`)
  zip.file('kit-editor-ia/.licencia-comprador', `${marca}Uso personal e intransferible. © jairoromo.ai\n`)
  return Buffer.from(await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } }))
}

async function marcarPdf(data: Buffer, email: string | null) {
  const pdf = await PDFDocument.load(data)
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const txt = `Licenciado a: ${email ?? 'comprador'} · Uso personal, prohibido compartir o revender · © jairoromo.ai`
  for (const page of pdf.getPages()) {
    page.drawText(txt, { x: 24, y: 10, size: 6.5, font, color: rgb(0.55, 0.53, 0.65), opacity: 0.8 })
  }
  return Buffer.from(await pdf.save())
}

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
    let data: Buffer = await readFile(path.join(KIT_EDITOR_DIR, fileName))
    try {
      if (which === 'zip') data = await marcarZip(data, purchase.email, sessionId as string)
      else if (which === 'manual') data = await marcarPdf(data, purchase.email)
    } catch {
      // si la marca falla, se entrega el archivo original (la licencia ya viene dentro del kit)
    }
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
