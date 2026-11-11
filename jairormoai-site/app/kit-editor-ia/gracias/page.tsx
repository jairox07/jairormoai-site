import Link from 'next/link'
import { EyebrowPill } from '@/components/ui/EyebrowPill'
import { verifyKitPurchase } from '@/lib/kit-editor-ia'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Tu Kit Editor IA — Descarga e instalación',
  robots: { index: false, follow: false },
}

const PROMPT =
  'Hola, compré el Kit Editor IA de jairoromo.ai. Instálalo en esta computadora: lee INSTALAR.md, corre el instalador de mi sistema y avísame cuando pueda mandarte mi primer video.'

export default async function KitGraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const purchase = await verifyKitPurchase(session_id)

  if (!purchase.ok || !session_id) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-24">
        <div className="max-w-lg text-center">
          <EyebrowPill className="mb-5">Kit Editor IA</EyebrowPill>
          <h1 className="font-sora font-black text-3xl mb-4">No encontramos tu compra</h1>
          <p className="font-sora text-gray mb-8">
            Abre el enlace del correo de compra que te llegó de contacto@novotech.mx. Si pagaste y no te llegó, revisa spam o
            escríbeme a @jairoromo.ai con el correo que usaste.
          </p>
          <Link href="/kit-editor-ia" className="font-sora font-bold underline">Volver al Kit Editor IA</Link>
        </div>
      </div>
    )
  }

  const q = `session_id=${encodeURIComponent(session_id)}`
  const steps = [
    { t: 'Descarga y descomprime', d: 'En Windows: clic derecho sobre el zip → Extraer todo. En Mac: doble clic.' },
    { t: 'Abre Claude Code en esa carpeta', d: 'App de Claude → pestaña Code → carpeta kit-editor-ia. Necesitas plan Pro o Max.' },
    { t: 'Pega el mensaje de abajo y dale Permitir', d: 'Claude corre el instalador. Tarda de 5 a 15 minutos, casi todo es descarga.' },
    { t: 'Reinicia Claude Code y manda tu video', d: 'Arrastra un video vertical hablado y escribe: «Edítame este video».' },
  ]

  return (
    <div className="py-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" fill="none" stroke="#4FC3F7" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </div>
          <EyebrowPill className="mb-5">Pago confirmado</EyebrowPill>
          <h1 className="font-sora font-black text-3xl md:text-4xl mb-4">Tu Kit Editor IA está listo</h1>
          <p className="font-sora text-gray">
            {purchase.email ? <>También te mandamos estos enlaces a <strong>{purchase.email}</strong>. </> : null}
            Guarda esta página: tus descargas siempre están aquí.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mb-12">
          <a
            href={`/api/kit-editor-ia/descarga?${q}&file=zip`}
            className="font-sora font-black text-center rounded-2xl px-6 py-4 text-white"
            style={{ background: 'linear-gradient(135deg,#00A3FF,#6B21A8 55%,#FF00FF)' }}
          >
            Descargar kit-editor-ia.zip
          </a>
          <a
            href={`/api/kit-editor-ia/descarga?${q}&file=manual`}
            className="font-sora font-black text-center rounded-2xl px-6 py-4 bg-white text-[#0b0716]"
          >
            Descargar el manual (PDF)
          </a>
        </div>

        <h2 className="font-sora font-black text-2xl mb-5">Instalación en 4 pasos</h2>
        <ol className="space-y-3 mb-8">
          {steps.map((s, i) => (
            <li key={s.t} className="flex gap-4 rounded-2xl border border-gray2/40 p-4">
              <span
                className="flex-none w-8 h-8 rounded-lg flex items-center justify-center font-black text-white"
                style={{ background: 'linear-gradient(135deg,#00A3FF,#6B21A8 55%,#FF00FF)' }}
              >
                {i + 1}
              </span>
              <div>
                <p className="font-sora font-bold">{s.t}</p>
                <p className="font-sora text-gray text-sm">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="font-sora font-bold mb-2">Mensaje para pegar en Claude Code</p>
        <pre className="whitespace-pre-wrap break-words rounded-xl bg-[#0d0a18] text-[#F3F1FA] border border-white/10 p-4 text-sm font-mono mb-12">{PROMPT}</pre>

        <div className="rounded-3xl border border-fuchsia-500/30 p-8" style={{ background: 'linear-gradient(135deg,rgba(0,163,255,.12),rgba(107,33,168,.18) 50%,rgba(255,0,255,.12))' }}>
          <h2 className="font-sora font-black text-2xl mb-3">¿Prefieres que lo instalemos juntos?</h2>
          <p className="font-sora text-gray mb-6">
            En una sesión 1:1 dejamos el kit funcionando en tu computadora y editamos tu primer video en vivo.
          </p>
          <Link href="/sessions" className="inline-block font-sora font-black rounded-xl bg-white text-[#0b0716] px-6 py-3">
            Agendar mi sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
