import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/brevo'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jairoromo@gmail.com'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await sendEmail({
    to: [{ email: ADMIN_EMAIL, name: 'Jairo' }],
    subject: '✅ Test — correo de bienvenida jairoromo.ai',
    htmlContent: testEmailHtml(),
  })

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

function testEmailHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#080B14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080B14;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="padding-bottom:32px;text-align:center;">
    <span style="font-family:monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#4FC3F7;background:rgba(79,195,247,0.08);border:1px solid rgba(79,195,247,0.2);padding:6px 16px;border-radius:100px;">jairoromo.ai — TEST</span>
  </td></tr>
  <tr><td style="background:#0D1220;border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:48px 40px;">
    <p style="margin:0 0 8px;font-family:monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#4FC3F7;">Email de prueba</p>
    <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#FFFFFF;">✅ Resend funciona</h1>
    <p style="margin:0;font-size:16px;color:#94A3B8;line-height:1.6;">
      Si estás leyendo esto, la integración con Resend está activa y los correos de bienvenida se enviarán correctamente a todos los nuevos registros.
    </p>
  </td></tr>
  <tr><td style="padding-top:32px;text-align:center;">
    <p style="margin:0;font-family:monospace;font-size:10px;color:#334155;">jairoromo.ai · México</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}
