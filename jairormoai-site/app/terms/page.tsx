import { EyebrowPill } from '@/components/ui/EyebrowPill'

export const metadata = {
  title: 'Términos de Uso — jairoromo.ai',
  description: 'Condiciones de uso del sitio, los cursos, la Bóveda IA y las sesiones 1:1 de jairoromo.ai.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-sora font-black text-xl text-white mb-3">{title}</h2>
      <div className="font-sora text-[15px] text-gray leading-[1.8] space-y-3">{children}</div>
    </div>
  )
}

export default function TermsPage() {
  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-2xl mx-auto">
        <EyebrowPill className="mb-5">Legal</EyebrowPill>
        <h1 className="font-sora font-black text-3xl md:text-4xl text-white mb-3">Términos de Uso</h1>
        <p className="font-mono text-[11px] text-gray2 uppercase tracking-wider mb-12">
          Última actualización: septiembre 2026
        </p>

        <Section title="1. Aceptación">
          <p>
            Al crear una cuenta, suscribirte al newsletter, comprar un curso o agendar una sesión 1:1 en jairoromo.ai, aceptas estos Términos de Uso y el{' '}
            <a href="/privacy" className="text-cyan hover:underline">Aviso de Privacidad</a>. Si no estás de acuerdo, no utilices el sitio.
          </p>
        </Section>

        <Section title="2. Quiénes somos">
          <p>
            jairoromo.ai es un proyecto de Jairo Romo (Novotech Digital Solutions), con domicilio en Guadalajara, Jalisco, México, dedicado a educación e implementación práctica de IA para profesionistas y PyMEs.
          </p>
        </Section>

        <Section title="3. Cuentas de usuario">
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Debes proporcionar información veraz al registrarte.</li>
            <li>Eres responsable de mantener la confidencialidad de tu contraseña y de toda actividad en tu cuenta.</li>
            <li>Debes ser mayor de edad para crear una cuenta o realizar una compra.</li>
          </ul>
        </Section>

        <Section title="4. Cursos, Bóveda IA y productos digitales">
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>El acceso se otorga de forma personal e intransferible.</li>
            <li>El contenido (videos, guías, prompts, herramientas) es para tu uso individual — no puedes redistribuirlo ni revenderlo.</li>
            <li>Los precios se muestran en la moneda indicada al momento de la compra y pueden cambiar sin previo aviso para compras futuras.</li>
          </ul>
        </Section>

        <Section title="5. Sesiones 1:1">
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Las sesiones se pagan por adelantado y se agendan directamente después del pago.</li>
            <li>Reprogramar o cancelar debe hacerse con al menos 24 horas de anticipación; de lo contrario la sesión se considera consumida.</li>
            <li>La sesión es una asesoría de orientación — no constituye garantía de resultado de negocio.</li>
          </ul>
        </Section>

        <Section title="6. Newsletter y blog">
          <p>
            Al suscribirte al newsletter, aceptas recibir correos periódicos de jairoromo.ai. Puedes darte de baja en cualquier momento desde el link incluido en cada correo. El acceso a las notas completas del blog requiere verificar tu correo mediante un enlace de acceso — no se requiere contraseña ni se comparte tu correo con terceros para este fin.
          </p>
        </Section>

        <Section title="7. Propiedad intelectual">
          <p>
            Todo el contenido del sitio (textos, diseño, marca, cursos, guías) es propiedad de Jairo Romo / Novotech Digital Solutions, salvo donde se indique lo contrario, y está protegido por la Ley Federal del Derecho de Autor.
          </p>
        </Section>

        <Section title="8. Limitación de responsabilidad">
          <p>
            El contenido educativo se ofrece &quot;tal cual&quot; con fines informativos y de implementación práctica. No garantizamos resultados económicos específicos derivados de aplicar el contenido, los cursos o las sesiones.
          </p>
        </Section>

        <Section title="9. Ley aplicable">
          <p>
            Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia se someterá a los tribunales competentes de Guadalajara, Jalisco.
          </p>
        </Section>

        <Section title="10. Contacto">
          <p>
            Dudas sobre estos términos:{' '}
            <a href="mailto:jairo.romo@novotech.mx" className="text-cyan hover:underline">jairo.romo@novotech.mx</a>
          </p>
        </Section>
      </div>
    </div>
  )
}
