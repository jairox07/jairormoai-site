import { Suspense } from 'react'
import { CalEmbed } from '@/components/sessions/CalEmbed'
import { SESSION_PACKAGES } from '@/lib/constants'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

function SuccessContent({ pkg: pkgId }: { pkg?: string }) {
  const pkg = SESSION_PACKAGES.find((p) => p.id === pkgId)

  if (!pkg) {
    return (
      <div className="text-center py-24">
        <p className="text-gray">Sesión no encontrada. Revisa tu email de confirmación.</p>
      </div>
    )
  }

  return (
    <div className="py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" fill="none" stroke="#4FC3F7" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
          <EyebrowPill className="mb-5">Pago confirmado</EyebrowPill>
          <h1 className="font-sora font-black text-3xl md:text-4xl mb-4">
            Listo. Elige tu horario.
          </h1>
          <p className="font-sora text-gray">
            Tu <strong className="text-white">{pkg.name}</strong> está pagada.
            Selecciona el día y hora que mejor te funcione.
          </p>
        </div>
        <CalEmbed calLink={pkg.calLink} />
      </div>
    </div>
  )
}

async function SuccessPageContent({
  searchParams,
}: {
  searchParams: Promise<{ pkg?: string; session_id?: string }>
}) {
  const params = await searchParams
  return <SuccessContent pkg={params.pkg} />
}

export default function SessionsSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ pkg?: string; session_id?: string }>
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray font-sora">Cargando...</span>
      </div>
    }>
      <SuccessPageContent searchParams={searchParams} />
    </Suspense>
  )
}
