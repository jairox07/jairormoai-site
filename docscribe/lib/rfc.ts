// Validación local del RFC mexicano: formato, fecha y dígito verificador.
// NO comprueba que exista en el SAT (eso requiere un servicio del SAT o un tercero autorizado).

export type ResultadoRfc =
  | { ok: true; rfc: string; tipo: "fisica" | "moral"; digitoCoincide: boolean }
  | { ok: false; error: string };

const PERSONA_FISICA = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;
const PERSONA_MORAL = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/;

// RFC genéricos del SAT (público en general / extranjeros): no identifican a un médico.
const GENERICOS = new Set(["XAXX010101000", "XEXX010101000"]);

const TABLA = "0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ";

export function normalizarRfc(entrada: string) {
  return entrada.normalize("NFC").replace(/\s+/g, "").toUpperCase();
}

function fechaValida(aa: number, mm: number, dd: number) {
  // El RFC trae año de 2 dígitos: vale si la fecha existe en 19aa o en 20aa.
  for (const siglo of [1900, 2000]) {
    const f = new Date(siglo + aa, mm - 1, dd);
    if (f.getFullYear() === siglo + aa && f.getMonth() === mm - 1 && f.getDate() === dd) return true;
  }
  return false;
}

// Dígito verificador (módulo 11) sobre los primeros 12 caracteres (las personas morales se rellenan con un espacio al inicio).
function digitoEsperado(rfc: string) {
  const base = (rfc.length === 12 ? " " + rfc : rfc).slice(0, 12);
  let suma = 0;
  for (let i = 0; i < 12; i++) {
    const valor = TABLA.indexOf(base[i]);
    if (valor < 0) return null;
    suma += valor * (13 - i);
  }
  const residuo = suma % 11;
  if (residuo === 0) return "0";
  const d = 11 - residuo;
  return d === 10 ? "A" : String(d);
}

export function validarRfc(entrada: string): ResultadoRfc {
  const rfc = normalizarRfc(entrada);
  if (!rfc) return { ok: false, error: "Escribe tu RFC." };
  if (GENERICOS.has(rfc)) return { ok: false, error: "Escribe tu RFC personal, no uno genérico." };

  const fisica = PERSONA_FISICA.test(rfc);
  const moral = PERSONA_MORAL.test(rfc);
  if (!fisica && !moral) {
    return { ok: false, error: "El RFC debe tener 13 caracteres (persona física) o 12 (persona moral)." };
  }

  const inicio = fisica ? 4 : 3;
  const aa = Number(rfc.slice(inicio, inicio + 2));
  const mm = Number(rfc.slice(inicio + 2, inicio + 4));
  const dd = Number(rfc.slice(inicio + 4, inicio + 6));
  if (!fechaValida(aa, mm, dd)) return { ok: false, error: "La fecha dentro del RFC no es válida." };

  // Si el dígito no coincide NO se bloquea (puede haber excepciones): se avisa para que revise.
  const digitoCoincide = digitoEsperado(rfc) === rfc[rfc.length - 1];
  return { ok: true, rfc, tipo: fisica ? "fisica" : "moral", digitoCoincide };
}
