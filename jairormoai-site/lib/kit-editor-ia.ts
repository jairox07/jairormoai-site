import path from 'path'
import { getStripe } from '@/lib/stripe'

// Kit Editor IA — producto digital de pago único (US$19), entregado por descarga verificada con Stripe.
export const KIT_EDITOR = {
  id: 'kit-editor-ia',
  name: 'Kit Editor IA',
  description: '11 skills de edición de video para Claude Code: cortes, mejor toma, subtítulos, gancho, fondo, música y más.',
  priceCents: 1900,
  currency: 'usd',
  files: {
    zip: 'kit-editor-ia.zip',
    manual: 'MANUAL-KIT-EDITOR-IA.pdf',
  } as const,
}

export const KIT_EDITOR_DIR = path.join(process.cwd(), 'private', 'skills', 'kit-editor-ia')

export type KitFile = keyof typeof KIT_EDITOR.files

/** Devuelve el correo del comprador si la sesión de Stripe es un pago confirmado del Kit Editor IA. */
export async function verifyKitPurchase(sessionId: string | null | undefined): Promise<{ ok: true; email: string | null; amount: number } | { ok: false }> {
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return { ok: false }
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    // 'no_payment_required' = sesión completada con un cupón de 100 % (pruebas con amigos); 'unpaid' nunca entra
    const settled = session.payment_status === 'paid' || session.payment_status === 'no_payment_required'
    if (session.status === 'complete' && settled && session.metadata?.product === KIT_EDITOR.id) {
      return { ok: true, email: session.customer_details?.email ?? null, amount: session.amount_total ?? 0 }
    }
  } catch {
    // sesión inexistente o error de Stripe
  }
  return { ok: false }
}

export function kitDownloadUrl(siteUrl: string, sessionId: string, file: KitFile = 'zip') {
  return `${siteUrl.replace(/\/$/, '')}/api/kit-editor-ia/descarga?session_id=${encodeURIComponent(sessionId)}&file=${file}`
}

export function kitPurchaseEmail(siteUrl: string, sessionId: string): string {
  const zip = kitDownloadUrl(siteUrl, sessionId, 'zip')
  const manual = kitDownloadUrl(siteUrl, sessionId, 'manual')
  const gracias = `${siteUrl.replace(/\/$/, '')}/kit-editor-ia/gracias?session_id=${encodeURIComponent(sessionId)}`
  const sessions = `${siteUrl.replace(/\/$/, '')}/sessions`
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tu Kit Editor IA</title></head>
<body style="margin:0;padding:0;background:#080610;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080610;padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="height:5px;background:linear-gradient(90deg,#00A3FF,#6B21A8,#FF00FF);border-radius:3px;"></td></tr>
<tr><td style="padding:28px 0 20px;text-align:center;font-weight:800;font-size:18px;color:#fff;">jairoromo<span style="color:#FF00FF;">.ai</span></td></tr>
<tr><td style="background:#0E0B1A;border:1px solid rgba(255,0,255,.25);border-radius:20px;padding:40px 32px;">
  <p style="margin:0 0 8px;font-family:monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#00A3FF;">Pago confirmado</p>
  <h1 style="margin:0 0 14px;font-size:28px;font-weight:900;color:#fff;line-height:1.2;">Tu Kit Editor IA está listo</h1>
  <p style="margin:0 0 26px;font-size:16px;color:#C9C6D8;line-height:1.6;">Gracias por tu compra. Descarga el kit y sigue el manual: en unos 20 minutos vas a tener tu primer video editado por Claude.</p>
  <a href="${zip}" style="display:block;text-align:center;padding:16px 24px;background:linear-gradient(135deg,#00A3FF,#6B21A8 55%,#FF00FF);border-radius:14px;color:#fff;font-weight:900;font-size:16px;text-decoration:none;">Descargar kit-editor-ia.zip</a>
  <a href="${manual}" style="display:block;text-align:center;margin-top:10px;padding:14px 24px;background:#fff;border-radius:14px;color:#0b0716;font-weight:900;font-size:15px;text-decoration:none;">Descargar el manual (PDF)</a>
  <p style="margin:26px 0 8px;font-weight:800;color:#fff;font-size:15px;">Instalación en 3 pasos</p>
  <ol style="margin:0 0 20px;padding-left:20px;color:#C9C6D8;font-size:15px;line-height:1.7;">
    <li>Descomprime el zip (en Windows: clic derecho → Extraer todo).</li>
    <li>Abre Claude Code en esa carpeta y pega: <em>«Compré el Kit Editor IA de jairoromo.ai. Instálalo en esta computadora: lee INSTALAR.md, corre el instalador de mi sistema y avísame cuando pueda mandarte mi primer video.»</em></li>
    <li>Dale clic en Permitir, espera el «Todo listo» y reinicia Claude Code.</li>
  </ol>
  <p style="margin:0 0 24px;font-size:13px;color:#A6A3B8;">Tus enlaces de descarga siempre están aquí: <a href="${gracias}" style="color:#00A3FF;">página de tu compra</a>.</p>
  <p style="margin:0 0 22px;font-size:13px;color:#3DDC97;line-height:1.6;"><b>Garantía de 7 días:</b> si no te sirve o no logras instalarlo, te devuelvo el 100 % sin preguntas. Escríbeme por mensaje a @jairoromo.ai en Instagram con el correo de tu compra.</p>
  <hr style="border:none;border-top:1px solid rgba(255,255,255,.08);margin:0 0 22px;">
  <p style="margin:0 0 6px;font-weight:800;color:#fff;font-size:15px;">¿Prefieres que lo instalemos juntos?</p>
  <p style="margin:0 0 14px;font-size:14px;color:#C9C6D8;line-height:1.6;">En una sesión 1:1 dejamos el kit funcionando y editamos tu primer video en vivo.</p>
  <a href="${sessions}" style="display:inline-block;padding:11px 20px;border:1.5px solid rgba(255,0,255,.5);border-radius:10px;color:#fff;font-weight:800;font-size:14px;text-decoration:none;">Agendar mi sesión →</a>
</td></tr>
<tr><td style="padding:22px 0;text-align:center;font-family:monospace;font-size:11px;color:#5E5A73;">@jairoromo.ai · IA SIN FRICCIÓN<br>Recibiste este correo porque compraste el Kit Editor IA.</td></tr>
</table></td></tr></table></body></html>`
}
