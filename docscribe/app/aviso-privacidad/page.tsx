import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CopiarTexto } from "@/components/copiar-texto";
import { AVISO_VERSION } from "@/lib/perfil";

export const metadata = { title: "Aviso de privacidad · DocScribe" };

// Plantilla para que el médico la entregue a sus pacientes. Los corchetes son datos que debe completar.
const AVISO_PACIENTES = `AVISO DE PRIVACIDAD PARA PACIENTES

Responsable: [Nombre del médico o clínica], con domicilio en [domicilio].

Datos que trato: identificación (nombre, edad), datos de contacto, y datos sobre su estado de salud, que son datos personales SENSIBLES. Durante la consulta se graba el audio de la conversación.

Para qué los uso: brindarle atención médica, integrar su expediente clínico y elaborar la nota de su consulta con apoyo de herramientas de inteligencia artificial, que redactan un borrador que yo reviso y valido.

Con quién se procesan: proveedores tecnológicos que almacenan y procesan la información por mi cuenta (almacenamiento, transcripción y redacción asistida). No se venden sus datos.

Conservación: la nota clínica se conserva en su expediente por el tiempo que exige la normatividad (al menos 5 años desde su última consulta, conforme a la NOM-004-SSA3-2012). El audio de la consulta se elimina a más tardar a los [30] días.

Sus derechos: puede acceder, rectificar, cancelar u oponerse al tratamiento de sus datos, o retirar su consentimiento, escribiendo a [correo de contacto].

CONSENTIMIENTO: Acepto de forma expresa el tratamiento de mis datos personales sensibles de salud y la grabación de mi consulta para los fines descritos.

Nombre: ____________________   Firma: ____________________   Fecha: ____________`;

export default function AvisoPrivacidadPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-5">
      <header className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard"
          aria-label="Volver"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-soft transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-medium text-slate-900">Aviso de privacidad</h1>
        <span className="h-11 w-11" aria-hidden="true" />
      </header>

      <article className="space-y-6 text-sm leading-relaxed text-slate-700">
        <section className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Para ti, médico usuario</h2>
          <p className="mt-1 text-xs text-slate-400">Versión {AVISO_VERSION}</p>

          <h3 className="mt-5 font-medium text-slate-900">1. Quién trata tus datos</h3>
          <p>[Razón social del operador de DocScribe], con domicilio en [domicilio], es responsable de los datos de tu cuenta.</p>

          <h3 className="mt-5 font-medium text-slate-900">2. Tus datos y para qué</h3>
          <p>
            Nombre, correo, clínica, especialidad y RFC. Los usamos para crear y administrar tu cuenta y tu licencia, dar soporte,
            mantener la seguridad del servicio y, más adelante, facturación. Tu RFC solo lo ves tú; el administrador de la plataforma no lo consulta.
          </p>

          <h3 className="mt-5 font-medium text-slate-900">3. Los datos de tus pacientes: tu papel</h3>
          <p>
            Tú eres el <strong>responsable</strong> de los datos de tus pacientes. DocScribe los procesa por tu cuenta, solo para lo que le pides:
            grabar, transcribir y redactar la nota. Los datos de salud son <strong>datos personales sensibles</strong>: la ley exige
            el consentimiento expreso y por escrito del paciente. Antes de grabar, tú debes entregarle tu propio aviso de privacidad y
            recabar su consentimiento, e informarle que se usa inteligencia artificial para redactar un borrador. Abajo tienes una plantilla.
            El paciente no usa DocScribe ni ve este aviso.
          </p>

          <h3 className="mt-5 font-medium text-slate-900">4. Qué hace DocScribe con una consulta</h3>
          <p>
            Guarda el audio en un almacenamiento privado, lo transcribe, genera una nota SOAP con un modelo de inteligencia artificial y la guarda
            en tu cuenta. Según la configuración, el audio o el texto pueden procesarse con proveedores tecnológicos (almacenamiento, transcripción,
            redacción y correo). No vendemos datos. El administrador de la plataforma ve conteos y códigos de expediente, no el contenido clínico.
          </p>

          <h3 className="mt-5 font-medium text-slate-900">5. Cuánto tiempo se conserva</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Nota y transcripción:</strong> hasta que tú las elimines. La NOM-004-SSA3-2012 pide conservar el expediente clínico al menos 5 años
              desde el último acto médico; borrar antes es decisión y responsabilidad tuya.
            </li>
            <li>
              <strong>Audio:</strong> se elimina automáticamente a los [30] días (el administrador puede cambiar el plazo, incluso a no guardarlo). Puedes
              borrarlo antes eliminando la consulta.
            </li>
            <li>
              <strong>Tu cuenta y perfil:</strong> mientras la cuenta esté activa. [Definir plazo tras la cancelación.]
            </li>
          </ul>

          <h3 className="mt-5 font-medium text-slate-900">6. Tus derechos</h3>
          <p>Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos escribiendo a [correo de privacidad].</p>

          <h3 className="mt-5 font-medium text-slate-900">7. Cambios</h3>
          <p>Si este aviso cambia, te pediremos aceptarlo de nuevo antes de seguir usando la plataforma.</p>

          <p className="mt-6 rounded-2xl bg-amber-50 p-3 text-xs text-amber-900">
            Texto informativo y plantilla: no sustituye asesoría legal. Complétalo y revísalo con un abogado antes de operar con pacientes reales.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Plantilla para tus pacientes</h2>
              <p className="mt-1 text-xs text-slate-500">Adáptala, imprímela y recaba la firma. Los datos entre corchetes son tuyos.</p>
            </div>
            <CopiarTexto texto={AVISO_PACIENTES} />
          </div>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 font-sans text-[13px] leading-relaxed text-slate-700">{AVISO_PACIENTES}</pre>
        </section>
      </article>
    </main>
  );
}
