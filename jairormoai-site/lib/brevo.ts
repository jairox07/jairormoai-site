const BREVO_API = 'https://api.brevo.com/v3/smtp/email'

interface SendEmailParams {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
}

export async function sendEmail({ to, subject, htmlContent }: SendEmailParams) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return

  await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Jairo Romo', email: 'hola@jairoromo.ai' },
      to,
      subject,
      htmlContent,
    }),
  })
}

export function welcomeCourseEmail(name: string, courseTitle: string, courseSlug: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bienvenido a tu curso</title>
</head>
<body style="margin:0;padding:0;background-color:#080B14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#080B14;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="padding-bottom:32px;text-align:center;">
    <span style="font-family:monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#4FC3F7;background:rgba(79,195,247,0.08);border:1px solid rgba(79,195,247,0.2);padding:6px 16px;border-radius:100px;">jairoromo.ai</span>
  </td></tr>

  <!-- Main card -->
  <tr><td style="background:#0D1220;border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:48px 40px;">

    <p style="margin:0 0 8px;font-family:monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#4FC3F7;">Acceso confirmado</p>
    <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#FFFFFF;line-height:1.2;">Hola ${name || 'por allá'} 👋</h1>
    <p style="margin:0 0 32px;font-size:16px;color:#94A3B8;line-height:1.6;">
      Ya tienes acceso a <strong style="color:#FFFFFF;">${courseTitle}</strong>. Entra cuando quieras y avanza a tu ritmo.
    </p>

    <!-- CTA principal -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
      <tr><td style="background:linear-gradient(135deg,#4FC3F7,#8B5CF6);border-radius:12px;padding:1px;">
        <td style="background:#0D1220;border-radius:11px;">
          <a href="https://jairoromo.ai/courses/${courseSlug}" style="display:inline-block;padding:14px 32px;font-family:monospace;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4FC3F7;text-decoration:none;">
            Ir a mi curso →
          </a>
        </td>
      </td></tr>
    </table>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0 0 40px;">

    <!-- Upsell: Guía Claude -->
    <p style="margin:0 0 16px;font-family:monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#8B5CF6;">También te puede interesar</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.15);border-radius:14px;margin-bottom:16px;">
      <tr><td style="padding:24px;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#FFFFFF;">Guía Claude — De cero a avanzado</p>
        <p style="margin:0 0-16px;font-size:13px;color:#94A3B8;line-height:1.5;">La guía definitiva en español para dominar Claude. Prompting, agentes, automatización. Solo $25 USD.</p>
        <a href="https://buy.stripe.com/dRm4gA01fcupa1H6GB6wE0f" style="display:inline-block;margin-top:16px;padding:10px 24px;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);border-radius:8px;font-family:monospace;font-size:11px;font-weight:700;letter-spacing:1px;color:#A78BFA;text-decoration:none;text-transform:uppercase;">
          Obtener por $25 →
        </a>
      </td></tr>
    </table>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0;">

    <!-- Sessions -->
    <p style="margin:0 0 16px;font-family:monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4FC3F7;">Sesiones 1:1 conmigo</p>
    <p style="margin:0 0 20px;font-size:14px;color:#94A3B8;line-height:1.6;">¿Tienes un proyecto atascado? ¿Quieres una estrategia de IA para tu empresa? Trabajamos juntos directamente.</p>

    <!-- Session cards -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr>
        <td width="32%" style="padding:4px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(79,195,247,0.04);border:1px solid rgba(79,195,247,0.12);border-radius:12px;">
            <tr><td style="padding:16px;text-align:center;">
              <p style="margin:0 0 2px;font-family:monospace;font-size:10px;color:#4FC3F7;letter-spacing:1px;text-transform:uppercase;">20 min</p>
              <p style="margin:0 0 2px;font-size:18px;font-weight:900;color:#FFFFFF;">$15</p>
              <p style="margin:0 0 12px;font-size:11px;color:#64748B;">Enfoque Rápido</p>
              <a href="https://buy.stripe.com/aFa28s7tH51Xa1H5Cx6wE09" style="display:block;padding:8px;background:rgba(79,195,247,0.1);border:1px solid rgba(79,195,247,0.2);border-radius:6px;font-family:monospace;font-size:10px;color:#4FC3F7;text-decoration:none;letter-spacing:1px;">AGENDAR</a>
            </td></tr>
          </table>
        </td>
        <td width="36%" style="padding:4px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(79,195,247,0.06);border:1px solid rgba(79,195,247,0.2);border-radius:12px;">
            <tr><td style="padding:16px;text-align:center;">
              <p style="margin:0 0 2px;font-family:monospace;font-size:10px;color:#4FC3F7;letter-spacing:1px;text-transform:uppercase;">⭐ 45 min</p>
              <p style="margin:0 0 2px;font-size:18px;font-weight:900;color:#FFFFFF;">$79</p>
              <p style="margin:0 0 12px;font-size:11px;color:#64748B;">Sesión de Trabajo</p>
              <a href="https://buy.stripe.com/14A7sM6pD9id4HnaWR6wE0d" style="display:block;padding:8px;background:rgba(79,195,247,0.15);border:1px solid rgba(79,195,247,0.3);border-radius:6px;font-family:monospace;font-size:10px;color:#4FC3F7;text-decoration:none;letter-spacing:1px;">AGENDAR</a>
            </td></tr>
          </table>
        </td>
        <td width="32%" style="padding:4px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(79,195,247,0.04);border:1px solid rgba(79,195,247,0.12);border-radius:12px;">
            <tr><td style="padding:16px;text-align:center;">
              <p style="margin:0 0 2px;font-family:monospace;font-size:10px;color:#4FC3F7;letter-spacing:1px;text-transform:uppercase;">90 min</p>
              <p style="margin:0 0 2px;font-size:18px;font-weight:900;color:#FFFFFF;">$297</p>
              <p style="margin:0 0 12px;font-size:11px;color:#64748B;">Consultoría Profunda</p>
              <a href="https://buy.stripe.com/eVqcN6cO1fGB7Tzc0V6wE0e" style="display:block;padding:8px;background:rgba(79,195,247,0.1);border:1px solid rgba(79,195,247,0.2);border-radius:6px;font-family:monospace;font-size:10px;color:#4FC3F7;text-decoration:none;letter-spacing:1px;">AGENDAR</a>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>

  </td></tr>

  <!-- Footer -->
  <tr><td style="padding-top:32px;text-align:center;">
    <p style="margin:0;font-family:monospace;font-size:10px;color:#334155;letter-spacing:1px;">
      jairoromo.ai · México
    </p>
    <p style="margin:8px 0 0;font-family:monospace;font-size:10px;color:#1E293B;">
      Recibiste este email porque te inscribiste a un curso.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}
