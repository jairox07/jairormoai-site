import { NextRequest, NextResponse } from "next/server";
import { AI_SYSTEM_PROMPT } from "@/lib/knowledge";

export async function POST(req: NextRequest) {
  const { messages, systemExtra } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    const simulated = simulateResponse(messages);
    return NextResponse.json({ reply: simulated, model: "simulated", inputTokens: 0, outputTokens: 0 });
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const systemPrompt = [AI_SYSTEM_PROMPT, systemExtra].filter(Boolean).join("\n\n---\n\n");

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages ?? [],
    });

    const reply = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({
      reply,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function simulateResponse(messages: { role: string; content: string }[]): string {
  const last = messages?.[messages.length - 1]?.content?.toLowerCase() ?? "";
  if (last.includes("precio") || last.includes("cuánto") || last.includes("costo"))
    return "Los precios varían según el procedimiento y la evaluación del cirujano. Por ejemplo, una rinoplastia va de $55,000 a $85,000 MXN, y la liposucción por zona de $25,000 a $45,000 MXN. ¿Te puedo agendar una consulta gratuita para darte un precio exacto?";
  if (last.includes("cita") || last.includes("consulta") || last.includes("agendar"))
    return "¡Con mucho gusto! La consulta inicial es sin costo para procedimientos quirúrgicos. Tenemos disponibilidad esta semana. ¿Qué horario te acomoda: mañana (10:00–13:00) o tarde (15:00–18:00)?";
  if (last.includes("rinoplastia") || last.includes("nariz"))
    return "La rinoplastia es uno de nuestros procedimientos más solicitados. El tiempo quirúrgico es 2–3 horas, recuperación 2–3 semanas y resultados definitivos al año. ¿Te gustaría una valoración sin costo?";
  if (last.includes("mama") || last.includes("seno") || last.includes("pecho") || last.includes("busto"))
    return "Trabajamos con implantes Motiva y Mentor, ambas con garantía de por vida. El precio incluye cirujano, anestesiólogo, quirófano y seguimiento. ¿Agendamos una valoración gratuita con la Dra. Mondragón?";
  if (last.includes("lipo") || last.includes("grasa") || last.includes("abdomen"))
    return "La liposucción modela zonas específicas: abdomen, flancos, espalda, muslos. Precio por zona: $25,000–$45,000 MXN. Muchas pacientes la combinan con abdominoplastia. ¿Agendamos una valoración?";
  if (last.includes("botox") || last.includes("toxina") || last.includes("arrugas"))
    return "La toxina botulínica la aplica el Dr. Sergio Vargas. Efecto 4–6 meses, sin recuperación. Precio $4,500–$9,000 MXN según zonas. ¿Te agendamos una cita?";
  if (last.includes("pago") || last.includes("meses") || last.includes("financiamiento"))
    return "Aceptamos efectivo, transferencia y tarjeta. 3, 6 y 12 MSI con BBVA, Banamex y Santander. Anticipo del 30% para apartar fecha quirúrgica. ¿Te genero una liga de pago?";
  return "Gracias por contactarnos. Para darte información precisa sobre tu caso, te recomiendo una consulta de valoración (sin costo para procedimientos mayores). ¿Qué tratamiento tienes en mente?";
}
