import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { createClient } from '@/lib/supabase/server'

const SKILLS_DIR = path.join(process.cwd(), 'private', 'skills', 'legal')

const MIME_TYPES: Record<string, string> = {
  '.md': 'text/markdown; charset=utf-8',
  '.zip': 'application/zip',
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado. Inicia sesión para descargar este recurso.' }, { status: 401 })
  }

  const { file } = await params

  // Prevent path traversal: only allow simple filenames within SKILLS_DIR
  if (file.includes('/') || file.includes('\\') || file.includes('..')) {
    return NextResponse.json({ error: 'Archivo inválido' }, { status: 400 })
  }

  const ext = path.extname(file).toLowerCase()
  const mimeType = MIME_TYPES[ext]
  if (!mimeType) {
    return NextResponse.json({ error: 'Archivo inválido' }, { status: 400 })
  }

  const filePath = path.join(SKILLS_DIR, file)
  if (!filePath.startsWith(SKILLS_DIR)) {
    return NextResponse.json({ error: 'Archivo inválido' }, { status: 400 })
  }

  try {
    const data = await readFile(filePath)
    return new NextResponse(data, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${file}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
  }
}
