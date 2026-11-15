"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, ChevronLeft, Loader2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AVISO_VERSION, CEDULA, ESPECIALIDADES } from "@/lib/perfil";
import { validarRfc } from "@/lib/rfc";
import { cn } from "@/lib/utils";

type Inicial = { nombre: string; clinica: string; especialidad: string; rfc: string; cedula: string };

const PASOS = ["Tus datos", "Especialidad", "RFC", "Privacidad"] as const;
const OTRA = "__otra__";

const selectCls =
  "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 focus-visible:border-brand-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100";

export function WizardRegistro({ inicial }: { inicial: Inicial }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const esConocida = (ESPECIALIDADES as readonly string[]).includes(inicial.especialidad);

  const [paso, setPaso] = useState(0);
  const [nombre, setNombre] = useState(inicial.nombre);
  const [clinica, setClinica] = useState(inicial.clinica);
  const [cedula, setCedula] = useState(inicial.cedula);
  const [seleccion, setSeleccion] = useState(inicial.especialidad ? (esConocida ? inicial.especialidad : OTRA) : "");
  const [otra, setOtra] = useState(esConocida ? "" : inicial.especialidad);
  const [rfcTxt, setRfcTxt] = useState(inicial.rfc);
  const [aviso, setAviso] = useState(false);
  const [pacientes, setPacientes] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const especialidad = seleccion === OTRA ? otra.trim() : seleccion;
  const rfc = validarRfc(rfcTxt);

  const valido = [
    nombre.trim().length >= 2 && clinica.trim().length >= 2 && CEDULA.test(cedula.replace(/\s/g, "")),
    especialidad.length >= 2,
    rfc.ok,
    aviso && pacientes,
  ];

  async function guardar() {
    if (!rfc.ok) return;
    setGuardando(true);
    setError(null);
    const { error } = await supabase.rpc("guardar_perfil", {
      p_nombre: nombre.trim(),
      p_clinica: clinica.trim(),
      p_especialidad: especialidad,
      p_rfc: rfc.rfc,
      p_cedula: cedula.replace(/\s/g, ""),
      p_acepta_aviso: aviso && pacientes,
      p_aviso_version: AVISO_VERSION,
    });
    if (error) {
      setError(
        error.message.includes("RFC_INVALIDO")
          ? "El RFC no es válido."
          : error.message.includes("CEDULA_INVALIDA")
            ? "La cédula profesional debe tener de 6 a 8 dígitos."
          : error.message.includes("AVISO_NO_ACEPTADO")
            ? "Debes aceptar el aviso de privacidad."
            : "No se pudo guardar tu perfil. Revisa los datos e intenta de nuevo."
      );
      setGuardando(false);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-8">
      <header className="mb-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-md shadow-brand-500/30">
          <ShieldCheck className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Configura tu consultorio</h1>
        <p className="mt-1 text-sm text-slate-500">Son 4 pasos y solo se hace una vez.</p>
      </header>

      <ol className="mb-6 flex items-center justify-center gap-2" aria-label="Progreso">
        {PASOS.map((p, i) => (
          <li key={p} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                i < paso ? "bg-brand-500 text-white" : i === paso ? "bg-brand-100 text-brand-700 ring-2 ring-brand-400" : "bg-slate-200 text-slate-500"
              )}
              aria-current={i === paso ? "step" : undefined}
            >
              {i < paso ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            {i < PASOS.length - 1 && <span className={cn("h-0.5 w-6 rounded", i < paso ? "bg-brand-500" : "bg-slate-200")} />}
          </li>
        ))}
      </ol>

      <section className="flex-1 space-y-4 rounded-3xl bg-white p-5 shadow-soft" aria-live="polite">
        <h2 className="font-medium text-slate-900">{PASOS[paso]}</h2>

        {paso === 0 && (
          <>
            <div>
              <label htmlFor="nombre" className="text-sm text-slate-600">Tu nombre completo</label>
              <Input id="nombre" className="mt-1" placeholder="Dra. María López Pérez" maxLength={120} value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div>
              <label htmlFor="clinica" className="text-sm text-slate-600">Nombre de la clínica o consultorio</label>
              <Input id="clinica" className="mt-1" placeholder="Clínica Sol" maxLength={120} value={clinica} onChange={(e) => setClinica(e.target.value)} />
            </div>
            <div>
              <label htmlFor="cedula" className="text-sm text-slate-600">Cédula profesional</label>
              <Input
                id="cedula"
                className="mt-1 font-mono"
                inputMode="numeric"
                placeholder="12345678"
                autoComplete="off"
                maxLength={10}
                value={cedula}
                onChange={(e) => setCedula(e.target.value.replace(/[^\d\s]/g, ""))}
              />
              {cedula.trim() !== "" && !CEDULA.test(cedula.replace(/\s/g, "")) && (
                <p role="alert" className="mt-1 text-sm text-rose-600">Debe tener de 6 a 8 dígitos.</p>
              )}
              <p className="mt-1 text-xs text-slate-400">
                Va en el PDF de tus notas, como pide la NOM-004. No la comprobamos contra el registro de la SEP.
              </p>
            </div>
          </>
        )}

        {paso === 1 && (
          <>
            <p className="text-sm text-slate-500">
              La usamos para que las notas usen la terminología de tu especialidad. Puedes cambiarla después.
            </p>
            <select aria-label="Especialidad" className={selectCls} value={seleccion} onChange={(e) => setSeleccion(e.target.value)}>
              <option value="">Elige tu especialidad…</option>
              {ESPECIALIDADES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
              <option value={OTRA}>Otra…</option>
            </select>
            {seleccion === OTRA && (
              <Input aria-label="Tu especialidad" placeholder="Escribe tu especialidad" maxLength={80} value={otra} onChange={(e) => setOtra(e.target.value)} />
            )}
          </>
        )}

        {paso === 2 && (
          <>
            <div>
              <label htmlFor="rfc" className="text-sm text-slate-600">Tu RFC</label>
              <Input
                id="rfc"
                className="mt-1 font-mono uppercase"
                placeholder="PEGJ800101AB1"
                autoComplete="off"
                maxLength={14}
                value={rfcTxt}
                onChange={(e) => setRfcTxt(e.target.value.toUpperCase())}
              />
            </div>
            {rfcTxt.trim() !== "" && !rfc.ok && (
              <p role="alert" className="flex items-start gap-2 text-sm text-rose-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {rfc.error}
              </p>
            )}
            {rfc.ok && rfc.digitoCoincide && (
              <p className="flex items-center gap-2 text-sm text-brand-700">
                <Check className="h-4 w-4" /> Formato válido ({rfc.tipo === "fisica" ? "persona física" : "persona moral"}).
              </p>
            )}
            {rfc.ok && !rfc.digitoCoincide && (
              <p role="alert" className="flex items-start gap-2 text-sm text-amber-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> El formato es válido, pero el dígito verificador no coincide. Revisa que esté bien escrito; si es correcto, puedes continuar.
              </p>
            )}
            <p className="text-xs text-slate-400">
              Revisamos el formato, la fecha y el dígito verificador. No comprobamos que exista en el SAT. Solo tú ves tu RFC.
            </p>
          </>
        )}

        {paso === 3 && (
          <>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-600">
              <li>Tú eres el responsable de los datos de tus pacientes; DocScribe los procesa por tu cuenta.</li>
              <li>Los datos de salud son sensibles: necesitas el consentimiento expreso y por escrito del paciente.</li>
              <li>La nota se conserva hasta que la elimines (la norma pide al menos 5 años). El audio se borra a los 30 días.</li>
            </ul>
            <a href="/aviso-privacidad" target="_blank" rel="noopener" className="inline-block text-sm text-brand-600 underline-offset-4 hover:underline">
              Leer el aviso completo y la plantilla para pacientes
            </a>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={aviso} onChange={(e) => setAviso(e.target.checked)} className="mt-0.5 h-5 w-5 accent-brand-500" />
              He leído y acepto el aviso de privacidad.
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={pacientes} onChange={(e) => setPacientes(e.target.checked)} className="mt-0.5 h-5 w-5 accent-brand-500" />
              Me comprometo a informar a mis pacientes y recabar su consentimiento expreso y por escrito antes de grabar.
            </label>
          </>
        )}

        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      </section>

      <div className="mt-5 flex gap-3">
        {paso > 0 && (
          <Button type="button" variant="outline" size="lg" onClick={() => setPaso(paso - 1)} disabled={guardando}>
            <ChevronLeft /> Atrás
          </Button>
        )}
        {paso < PASOS.length - 1 ? (
          <Button type="button" size="lg" className="flex-1" disabled={!valido[paso]} onClick={() => setPaso(paso + 1)}>
            Siguiente
          </Button>
        ) : (
          <Button type="button" size="lg" className="flex-1" disabled={!valido[3] || guardando} onClick={guardar}>
            {guardando && <Loader2 className="animate-spin" />} Empezar a usar DocScribe
          </Button>
        )}
      </div>
    </main>
  );
}
