import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Fecha } from "@/components/fecha";
import { SoapResult } from "@/components/soap-result";
import { formatTiempo } from "@/lib/utils";
import { SECCIONES_SOAP, type NotaSoap } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ConsultaPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  // RLS garantiza que solo se devuelve si pertenece al usuario.
  const { data } = await supabase
    .from("consultas")
    .select("id, fecha, nota_soap_final, paciente_nombre, paciente_edad, numero, expediente, transcripcion_raw, audio_segundos")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) notFound();

  // Datos del médico para el encabezado y la firma del PDF (RLS: solo su propio perfil).
  const { data: perfil } = await supabase.from("perfiles").select("nombre, cedula, especialidad, clinica").maybeSingle();
  const medico = perfil ? { nombre: perfil.nombre, cedula: perfil.cedula, especialidad: perfil.especialidad, clinica: perfil.clinica } : null;

  const nota = data.nota_soap_final as NotaSoap;
  const puntos = SECCIONES_SOAP.reduce((n, { key }) => n + (nota[key]?.length ?? 0), 0);

  return (
    <main className="mx-auto max-w-lg px-4 pb-10 pt-5">
      <header className="mb-5 flex items-center justify-between">
        <Link
          href="/dashboard"
          aria-label="Volver"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-soft transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-medium text-slate-900">Detalle de la consulta</h1>
        <span className="h-11 w-11" aria-hidden="true" />
      </header>

      <section className="mb-6">
        <p className="text-sm text-slate-500">Nota clínica SOAP</p>
        <h2 className="mt-1 text-3xl font-semibold leading-tight text-slate-900">
          {data.paciente_nombre ?? "Sin nombre"}
        </h2>
        <p className="mt-1 text-xs text-slate-400">Borrador generado con IA · revísalo antes de usarlo</p>
      </section>

      <div className="mb-6 grid grid-cols-3 divide-x divide-slate-100 rounded-3xl bg-white py-4 text-center shadow-soft">
        <div>
          <p className="text-lg font-semibold text-slate-900">{data.numero ? `#${data.numero}` : "—"}</p>
          <p className="text-xs text-slate-500">Consulta</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">
            <Fecha iso={data.fecha} formato="hora" />
          </p>
          <p className="text-xs text-slate-500">Hora</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">{puntos}</p>
          <p className="text-xs text-slate-500">Puntos clínicos</p>
        </div>
      </div>

      <details className="group mb-6 rounded-3xl bg-white p-5 shadow-soft">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-slate-900">
          Transcripción completa
          {data.audio_segundos ? (
            <span className="text-xs font-normal text-slate-400">Audio {formatTiempo(Math.round(data.audio_segundos))}</span>
          ) : null}
        </summary>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{data.transcripcion_raw}</p>
      </details>

      <SoapResult
        nota={nota}
        fecha={data.fecha}
        cabecera={false}
        paciente={data.paciente_nombre ? { nombre: data.paciente_nombre, edad: data.paciente_edad } : undefined}
        numero={data.numero}
        expediente={data.expediente}
        consultaId={data.id}
        medico={medico}
      />
    </main>
  );
}
