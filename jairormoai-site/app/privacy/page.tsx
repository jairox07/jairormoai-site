import { EyebrowPill } from '@/components/ui/EyebrowPill'

export const metadata = {
  title: 'Aviso de Privacidad — jairoromo.ai',
  description: 'Cómo jairoromo.ai recaba, usa y protege tus datos personales, conforme a la LFPDPPP.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-sora font-black text-xl text-white mb-3">{title}</h2>
      <div className="font-sora text-[15px] text-gray leading-[1.8] space-y-3">{children}</div>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-2xl mx-auto">
        <EyebrowPill className="mb-5">Legal</EyebrowPill>
        <h1 className="font-sora font-black text-3xl md:text-4xl text-white mb-3">Aviso de Privacidad</h1>
        <p className="font-mono text-[11px] text-gray2 uppercase tracking-wider mb-12">
          Última actualización: septiembre 2026
        </p>

        <Section title="1. Responsable del tratamiento">
          <p>
            <strong className="text-white">Jairo Romo</strong>, operando bajo la marca <strong className="text-white">jairoromo.ai</strong> (en conjunto con Novotech Digital Solutions), con domicilio en Guadalajara, Jalisco, México, es responsable del tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.
          </p>
          <p>
            Puedes contactarnos para cualquier tema relacionado con este aviso en{' '}
            <a href="mailto:jairo.romo@novotech.mx" className="text-cyan hover:underline">jairo.romo@novotech.mx</a>.
          </p>
        </Section>

        <Section title="2. Datos personales que recabamos">
          <p>Dependiendo de cómo interactúes con el sitio, podemos recabar:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Datos de identificación: nombre completo, correo electrónico.</li>
            <li>Datos de cuenta: contraseña (almacenada de forma cifrada, nunca en texto plano).</li>
            <li>Datos de facturación y pago: procesados directamente por Stripe — nosotros no almacenamos números de tarjeta.</li>
            <li>Datos de uso: progreso en cursos, actividad en la plataforma, preferencias de contenido.</li>
          </ul>
        </Section>

        <Section title="3. Finalidades del tratamiento">
          <p><strong className="text-white">Finalidades primarias</strong> (necesarias para darte el servicio):</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Crear y administrar tu cuenta.</li>
            <li>Darte acceso a los cursos, la Bóveda IA, el blog y las sesiones 1:1 que adquieras.</li>
            <li>Procesar pagos y emitir comprobantes.</li>
            <li>Enviarte el newsletter y correos operativos (confirmaciones, accesos, soporte).</li>
          </ul>
          <p className="mt-3"><strong className="text-white">Finalidades secundarias</strong> (puedes oponerte sin que afecte el servicio):</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Enviarte contenido promocional adicional o encuestas.</li>
            <li>Analítica agregada para mejorar el sitio y el contenido.</li>
          </ul>
        </Section>

        <Section title="4. Transferencias y encargados">
          <p>
            Para operar el servicio, compartimos los datos estrictamente necesarios con los siguientes proveedores, que actúan como encargados bajo sus propias políticas de seguridad:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong className="text-white">Supabase</strong> — base de datos y autenticación.</li>
            <li><strong className="text-white">Stripe</strong> — procesamiento de pagos.</li>
            <li><strong className="text-white">Resend</strong> — envío de correos y del newsletter.</li>
            <li><strong className="text-white">Vercel</strong> — hospedaje del sitio.</li>
          </ul>
          <p>No vendemos ni rentamos tus datos personales a terceros con fines comerciales.</p>
        </Section>

        <Section title="5. Derechos ARCO">
          <p>
            Tienes derecho a <strong className="text-white">Acceder</strong> a tus datos, <strong className="text-white">Rectificarlos</strong> si son inexactos, <strong className="text-white">Cancelarlos</strong> cuando consideres que no se requieren para las finalidades señaladas, y <strong className="text-white">Oponerte</strong> a su tratamiento para fines específicos.
          </p>
          <p>
            Para ejercer cualquiera de estos derechos, escríbenos a{' '}
            <a href="mailto:jairo.romo@novotech.mx" className="text-cyan hover:underline">jairo.romo@novotech.mx</a>{' '}
            indicando tu nombre, el derecho que deseas ejercer y una copia de identificación. Responderemos dentro de los plazos que marca la ley.
          </p>
          <p>
            Puedes darte de baja del newsletter en cualquier momento con el link de &quot;Darme de baja&quot; incluido en cada correo.
          </p>
        </Section>

        <Section title="6. Seguridad">
          <p>
            Aplicamos medidas administrativas, técnicas y físicas razonables para proteger tus datos contra daño, pérdida, alteración, destrucción o uso no autorizado. Las contraseñas se almacenan cifradas y los pagos se procesan por Stripe, que cumple el estándar PCI-DSS.
          </p>
        </Section>

        <Section title="7. Uso de cookies y tecnologías similares">
          <p>
            Usamos cookies esenciales para mantener tu sesión iniciada y, en el caso del newsletter, tecnologías de seguimiento de apertura y clics para saber qué contenido es útil. Puedes controlar las cookies desde la configuración de tu navegador.
          </p>
        </Section>

        <Section title="8. Cambios a este aviso">
          <p>
            Podemos actualizar este aviso de privacidad. Cualquier cambio relevante se publicará en esta misma página con su fecha de actualización.
          </p>
        </Section>
      </div>
    </div>
  )
}
