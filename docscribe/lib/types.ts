export type NotaSoap = {
  subjetivo: string[];
  objetivo: string[];
  analisis: string[];
  plan: string[];
};

export const SECCIONES_SOAP: { key: keyof NotaSoap; letra: string; titulo: string }[] = [
  { key: "subjetivo", letra: "S", titulo: "Subjetivo" },
  { key: "objetivo", letra: "O", titulo: "Objetivo" },
  { key: "analisis", letra: "A", titulo: "Análisis" },
  { key: "plan", letra: "P", titulo: "Plan" },
];

export const MEMBRETE = "DocScribe - Expediente Clínico";

export function fechaLarga(fecha: Date) {
  return fecha.toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" });
}

export type Paciente = { nombre: string; edad: number | null };

// "María López · 42 años · Consulta #3". Sin nombre de paciente en el asunto de los correos (ver /api/email).
export function lineaPaciente(p: Paciente, numero?: number | null) {
  const partes = [p.nombre, p.edad !== null ? `${p.edad} años` : null, numero ? `Consulta #${numero}` : null];
  return partes.filter(Boolean).join(" · ");
}

// Texto plano para copiar / compartir. `fecha` = fecha de la consulta.
export function notaATexto(nota: NotaSoap, fecha = new Date(), paciente?: Paciente, numero?: number | null) {
  const cabecera = paciente ? `${lineaPaciente(paciente, numero)}\n` : "";
  const encabezado = `${cabecera}${MEMBRETE}\nFecha de generación: ${fechaLarga(new Date())}\nConsulta: ${fechaLarga(fecha)}`;
  const cuerpo = SECCIONES_SOAP.map(
    ({ key, titulo }) => `${titulo.toUpperCase()}\n${nota[key].map((l) => `• ${l}`).join("\n")}`
  ).join("\n\n");
  return `${encabezado}\n\n${cuerpo}`;
}
