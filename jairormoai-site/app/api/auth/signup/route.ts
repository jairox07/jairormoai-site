import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/brevo'

export async function POST(req: NextRequest) {
  const { email, password, full_name } = await req.json()

  if (!email || !password || !full_name) {
    return NextResponse.json({ error: 'Campos requeridos' }, { status: 400 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })

  if (error) {
    const msg = error.message.includes('already registered')
      ? 'Este email ya tiene cuenta. Inicia sesión.'
      : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  sendEmail({
    to: [{ email, name: full_name }],
    subject: `¡Bienvenido a jairoromo.ai, ${full_name.split(' ')[0]}!`,
    htmlContent: welcomeEmail(full_name),
  }).catch(() => {})

  sendEmail({
    to: [
      { email: 'jairo.romo@novotech.mx', name: 'Jairo Romo' },
      { email: 'contacto@novotech.mx', name: 'Contacto Novotech' },
    ],
    subject: `Nuevo registro: ${full_name} (${email})`,
    htmlContent: `<p>Nuevo usuario registrado en jairoromo.ai:</p><ul><li><b>Nombre:</b> ${full_name}</li><li><b>Email:</b> ${email}</li></ul>`,
  }).catch(() => {})

  return NextResponse.json({ ok: true, userId: data.user?.id })
}

function welcomeEmail(name: string): string {
  const first = name.split(' ')[0]
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#080B14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080B14;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <tr><td style="padding-bottom:32px;text-align:center;">
    <span style="font-family:monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#4FC3F7;background:rgba(79,195,247,0.08);border:1px solid rgba(79,195,247,0.2);padding:6px 16px;border-radius:100px;">jairoromo.ai</span>
  </td></tr>

  <tr><td style="background:#0D1220;border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:48px 40px;">
    <p style="margin:0 0 8px;font-family:monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#4FC3F7;">Cuenta creada</p>
    <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#FFFFFF;line-height:1.2;">Hola ${first} 👋</h1>
    <p style="margin:0 0 32px;font-size:16px;color:#94A3B8;line-height:1.6;">
      Ya eres parte de la comunidad jairoromo.ai. Aquí aprenderás a usar IA de forma práctica, en español, con ejemplos reales para tu negocio o carrera.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
      <tr><td style="background:linear-gradient(135deg,#4FC3F7,#8B5CF6);border-radius:12px;padding:1px;">
        <td style="background:#0D1220;border-radius:11px;">
          <a href="https://jairoromo.ai/courses" style="display:inline-block;padding:14px 32px;font-family:monospace;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4FC3F7;text-decoration:none;">
            Ver mis cursos →
          </a>
        </td>
      </td></tr>
    </table>

    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0 0 32px;">

    <p style="margin:0 0 16px;font-family:monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#8B5CF6;">Sesiones 1:1 conmigo</p>
    <p style="margin:0 0 20px;font-size:14px;color:#94A3B8;line-height:1.6;">Si tienes un proyecto de IA que quieres desbloquear, podemos trabajar juntos directamente.</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="32%" style="padding:4px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(79,195,247,0.04);border:1px solid rgba(79,195,247,0.12);border-radius:12px;">
            <tr><td style="padding:16px;text-align:center;">
              <p style="margin:0 0 2px;font-size:18px;font-weight:900;color:#FFFFFF;">$15</p>
              <p style="margin:0 0 12px;font-size:11px;color:#64748B;">20 min</p>
              <a href="https://cal.com/jairo-romo-76rckd/enfoque-rapido-jairoromo.ai" style="display:block;padding:8px;background:rgba(79,195,247,0.1);border:1px solid rgba(79,195,247,0.2);border-radius:6px;font-family:monospace;font-size:10px;color:#4FC3F7;text-decoration:none;">AGENDAR</a>
            </td></tr>
          </table>
        </td>
        <td width="36%" style="padding:4px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(79,195,247,0.06);border:1px solid rgba(79,195,247,0.2);border-radius:12px;">
            <tr><td style="padding:16px;text-align:center;">
              <p style="margin:0 0 2px;font-size:11px;color:#4FC3F7;font-family:monospace;">⭐ Popular</p>
              <p style="margin:0 0 2px;font-size:18px;font-weight:900;color:#FFFFFF;">$79</p>
              <p style="margin:0 0 12px;font-size:11px;color:#64748B;">45 min</p>
              <a href="https://cal.com/jairo-romo-76rckd/sesion-de-trabajo-jairoromo.ai" style="display:block;padding:8px;background:rgba(79,195,247,0.15);border:1px solid rgba(79,195,247,0.3);border-radius:6px;font-family:monospace;font-size:10px;color:#4FC3F7;text-decoration:none;">AGENDAR</a>
            </td></tr>
          </table>
        </td>
        <td width="32%" style="padding:4px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(79,195,247,0.04);border:1px solid rgba(79,195,247,0.12);border-radius:12px;">
            <tr><td style="padding:16px;text-align:center;">
              <p style="margin:0 0 2px;font-size:18px;font-weight:900;color:#FFFFFF;">$297</p>
              <p style="margin:0 0 12px;font-size:11px;color:#64748B;">90 min</p>
              <a href="https://cal.com/jairo-romo-76rckd/consultoria-profunda-jairoromo.ai" style="display:block;padding:8px;background:rgba(79,195,247,0.1);border:1px solid rgba(79,195,247,0.2);border-radius:6px;font-family:monospace;font-size:10px;color:#4FC3F7;text-decoration:none;">AGENDAR</a>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
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
