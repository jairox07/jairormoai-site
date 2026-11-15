import "server-only";
import type { NotaSoap } from "@/lib/types";

// System prompt exacto solicitado.
export const SYSTEM_PROMPT_SOAP =
  "Eres un asistente médico experto. Se te entregará una transcripción cruda y sin formato de una consulta entre un médico y un paciente. Tu tarea es extraer la información médica relevante, ignorar la plática casual, y redactar una nota clínica profesional en formato SOAP (Subjetivo, Objetivo, Análisis, Plan). Usa terminología médica adecuada, sé conciso y estructurado en viñetas. Si algún dato del formato SOAP no se mencionó, escribe 'No especificado en la consulta'.";

// Instrucción de formato aparte (no altera el system prompt) para poder parsear la respuesta.
const FORMATO_JSON =
  'Devuelve ÚNICAMENTE un objeto JSON válido con esta forma exacta: {"subjetivo": string[], "objetivo": string[], "analisis": string[], "plan": string[]}. Cada string es una viñeta, sin el símbolo de viñeta.';

const NO_ESPECIFICADO = "No especificado en la consulta";

// ─────────────────────────────────────────────
// Selección de proveedor (variables de entorno)
//   STT_PROVIDER: openai | local | mock   (auto: openai si hay key, local si hay STT_LOCAL_URL, si no mock)
//   LLM_PROVIDER: gemini | openai | ollama | mock (auto: gemini > openai > ollama si hay OLLAMA_MODEL > mock)
// ─────────────────────────────────────────────
// `preferido` viene de la configuración del admin (app_config); "auto" o vacío = usa el entorno.
function proveedorStt(preferido?: string): "openai" | "local" | "mock" {
  const p = preferido && preferido !== "auto" ? preferido : process.env.STT_PROVIDER;
  if (p === "openai" || p === "local" || p === "mock") return p;
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.STT_LOCAL_URL) return "local";
  return "mock";
}

function proveedorLlm(preferido?: string): "gemini" | "openai" | "ollama" | "mock" {
  const p = preferido && preferido !== "auto" ? preferido : process.env.LLM_PROVIDER;
  if (p === "gemini" || p === "openai" || p === "ollama" || p === "mock") return p;
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.OLLAMA_MODEL) return "ollama";
  return "mock";
}

// ─────────────────────────────────────────────
// STT — Whisper (OpenAI) | faster-whisper local | simulado
// ─────────────────────────────────────────────
// Consumo de una llamada a la IA (para el admin). 0 cuando el proveedor no lo reporta o es demo.
export type Uso = { entrada: number; salida: number };

export async function transcribirAudio(
  audio: File,
  proveedorElegido?: string
): Promise<{ texto: string; simulado: boolean; duracion: number | null }> {
  const proveedor = proveedorStt(proveedorElegido);

  if (proveedor === "mock") {
    await new Promise((r) => setTimeout(r, 1200));
    return { texto: TRANSCRIPCION_DEMO, simulado: true, duracion: null };
  }

  if (proveedor === "local") {
    const base = process.env.STT_LOCAL_URL || "http://127.0.0.1:8787";
    const bytes = new Uint8Array(await audio.arrayBuffer());
    const res = await fetch(`${base}/transcribe`, {
      method: "POST",
      headers: { "Content-Type": audio.type || "application/octet-stream" },
      body: bytes,
      signal: AbortSignal.timeout(2 * 60 * 60 * 1000), // el servidor manda latidos; ver scripts/stt-server.py
    });
    if (!res.ok) throw new Error(`STT local ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { text?: string; error?: string; duration?: number };
    if (data.error) throw new Error(`STT local: ${data.error}`);
    return { texto: (data.text ?? "").trim(), simulado: false, duracion: typeof data.duration === "number" ? data.duration : null };
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("STT_PROVIDER=openai requiere OPENAI_API_KEY");

  const fd = new FormData();
  fd.append("file", audio, audio.name || "consulta.webm");
  fd.append("model", "whisper-1");
  fd.append("language", "es");
  fd.append("response_format", "text");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: fd,
  });
  if (!res.ok) throw new Error(`Whisper ${res.status}: ${await res.text()}`);
  return { texto: (await res.text()).trim(), simulado: false, duracion: null };
}

// ─────────────────────────────────────────────
// LLM — Gemini | OpenAI | Ollama (local) | simulado
// ─────────────────────────────────────────────
export async function generarNotaSoap(
  transcripcion: string,
  opciones: { proveedor?: string; ollamaModel?: string } = {}
): Promise<{ nota: NotaSoap; simulado: boolean; uso: Uso }> {
  const usuario = `${FORMATO_JSON}\n\nTRANSCRIPCIÓN:\n"""\n${transcripcion}\n"""`;
  const proveedor = proveedorLlm(opciones.proveedor);

  if (proveedor === "ollama") {
    const base = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
    // Contexto según el largo de la transcripción (~3 chars/token + prompt y respuesta), tope 32k.
    const numCtx =
      Number(process.env.OLLAMA_NUM_CTX) ||
      Math.min(32768, Math.max(4096, Math.ceil((transcripcion.length / 3 + 2500) / 2048) * 2048));
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: opciones.ollamaModel || process.env.OLLAMA_MODEL || "qwen2.5:7b",
        stream: true, // streaming: los primeros bytes llegan pronto y no salta el timeout de 5 min de Node
        format: "json",
        keep_alive: "30m",
        options: { temperature: 0.2, num_ctx: numCtx },
        messages: [
          { role: "system", content: SYSTEM_PROMPT_SOAP },
          { role: "user", content: usuario },
        ],
      }),
      signal: AbortSignal.timeout(30 * 60 * 1000),
    });
    if (!res.ok || !res.body) throw new Error(`Ollama ${res.status}: ${await res.text()}`);

    let contenido = "";
    let resto = "";
    let uso: Uso = { entrada: 0, salida: 0 };
    const decoder = new TextDecoder();
    const leer = (linea: string) => {
      if (!linea.trim()) return;
      const j = JSON.parse(linea);
      if (j.error) throw new Error(`Ollama: ${j.error}`);
      contenido += j.message?.content ?? "";
      // El último fragmento (done: true) trae los conteos de tokens.
      if (j.done) uso = { entrada: j.prompt_eval_count ?? 0, salida: j.eval_count ?? 0 };
    };
    for await (const trozo of res.body as unknown as AsyncIterable<Uint8Array>) {
      resto += decoder.decode(trozo, { stream: true });
      const lineas = resto.split("\n");
      resto = lineas.pop() ?? "";
      lineas.forEach(leer);
    }
    leer(resto);
    return { nota: normalizarNota(contenido), simulado: false, uso };
  }

  if (proveedor === "gemini") {
    if (!process.env.GEMINI_API_KEY) throw new Error("LLM_PROVIDER=gemini requiere GEMINI_API_KEY");
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT_SOAP }] },
          contents: [{ role: "user", parts: [{ text: usuario }] }],
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const texto: string = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    const um = data.usageMetadata ?? {};
    return {
      nota: normalizarNota(texto),
      simulado: false,
      uso: { entrada: um.promptTokenCount ?? 0, salida: um.candidatesTokenCount ?? 0 },
    };
  }

  if (proveedor === "openai") {
    if (!process.env.OPENAI_API_KEY) throw new Error("LLM_PROVIDER=openai requiere OPENAI_API_KEY");
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT_SOAP },
          { role: "user", content: usuario },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return {
      nota: normalizarNota(data.choices?.[0]?.message?.content ?? ""),
      simulado: false,
      uso: { entrada: data.usage?.prompt_tokens ?? 0, salida: data.usage?.completion_tokens ?? 0 },
    };
  }

  await new Promise((r) => setTimeout(r, 1500));
  return { nota: NOTA_DEMO, simulado: true, uso: { entrada: 0, salida: 0 } };
}

function normalizarNota(raw: string): NotaSoap {
  let obj: Record<string, unknown> = {};
  try {
    obj = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ""));
  } catch {
    throw new Error("El modelo devolvió un formato inválido.");
  }
  const lista = (v: unknown): string[] => {
    const arr = (Array.isArray(v) ? v : typeof v === "string" ? [v] : [])
      .map((x) => String(x).replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);
    return arr.length ? arr : [NO_ESPECIFICADO];
  };
  return {
    subjetivo: lista(obj.subjetivo),
    objetivo: lista(obj.objetivo),
    analisis: lista(obj.analisis ?? obj["análisis"]),
    plan: lista(obj.plan),
  };
}

// ─────────────────────────────────────────────
// Datos demo (modo sin API keys)
// ─────────────────────────────────────────────
const TRANSCRIPCION_DEMO =
  "Buenos días, pase. ¿Cómo le fue con el tráfico? Uf, terrible. Bueno, cuénteme. Desde hace tres días tengo dolor de garganta, fiebre de 38.5 en la noche y me duele al tragar. No tengo tos. ¿Alergias a medicamentos? Ninguna. A ver, abra la boca. Amígdalas hipertróficas con exudado blanquecino, ganglios cervicales anteriores dolorosos. Temperatura 38.2, frecuencia cardiaca 96. Parece una faringoamigdalitis bacteriana. Le voy a dar amoxicilina 500 mg cada 8 horas por 10 días, paracetamol 500 mg cada 6 horas si hay fiebre, mucho líquido y regresa si no mejora en 72 horas.";

const NOTA_DEMO: NotaSoap = {
  subjetivo: [
    "Odinofagia de 3 días de evolución.",
    "Fiebre nocturna referida de hasta 38.5 °C.",
    "Niega tos.",
    "Niega alergias medicamentosas.",
  ],
  objetivo: [
    "Temp. 38.2 °C, FC 96 lpm.",
    "Amígdalas hipertróficas con exudado blanquecino.",
    "Adenopatías cervicales anteriores dolorosas a la palpación.",
  ],
  analisis: ["Faringoamigdalitis aguda, probable etiología bacteriana (criterios de Centor elevados)."],
  plan: [
    "Amoxicilina 500 mg VO c/8 h por 10 días.",
    "Paracetamol 500 mg VO c/6 h PRN fiebre.",
    "Hidratación abundante.",
    "Revaloración si no hay mejoría en 72 h.",
  ],
};
