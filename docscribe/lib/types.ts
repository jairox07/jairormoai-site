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

// Texto plano para copiar / compartir. `fecha` = fecha de la consulta.
export function notaATexto(nota: NotaSoap, fecha = new Date()) {
  const encabezado = `${MEMBRETE}\nFecha de generación: ${fechaLarga(new Date())}\nConsulta: ${fechaLarga(fecha)}`;
  const cuerpo = SECCIONES_SOAP.map(
    ({ key, titulo }) => `${titulo.toUpperCase()}\n${nota[key].map((l) => `• ${l}`).join("\n")}`
  ).join("\n\n");
  return `${encabezado}\n\n${cuerpo}`;
}
