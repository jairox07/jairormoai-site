import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

// GET  /api/webhooks/meta  — verificación del webhook de Meta (subscribe step)
// POST /api/webhooks/meta  — recibe eventos de WA/IG/FB firmados con HMAC-SHA256
//
// Variables de entorno requeridas:
//   META_VERIFY_TOKEN  — token que configuras en Meta App Dashboard
//   META_APP_SECRET    — App Secret de tu Meta App (para validar firma HMAC)
//   ANTHROPIC_API_KEY  — para que la IA responda automáticamente

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode       = searchParams.get("hub.mode");
  const token      = searchParams.get("hub.verify_token");
  const challenge  = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    console.log("[Meta Webhook] Verificación exitosa");
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return NextResponse.json({ error: "Verificación fallida" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  // Validar firma HMAC-SHA256
  const rawBody  = await req.text();
  const signature = req.headers.get("x-hub-signature-256") ?? "";
  const appSecret = process.env.META_APP_SECRET ?? "";

  if (appSecret) {
    const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");
    if (signature !== expected) {
      console.error("[Meta Webhook] Firma inválida");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
  }

  let body: MetaWebhookPayload;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Procesar eventos
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field === "messages") {
        const messages = change.value?.messages ?? [];
        for (const msg of messages) {
          await handleIncomingMessage({
            phoneNumberId: change.value.metadata?.phone_number_id,
            from: msg.from,
            text: msg.text?.body ?? "",
            channel: "whatsapp",
          });
        }
      }

      // Instagram DM
      if (change.field === "messages" && change.value?.messaging) {
        for (const event of change.value.messaging ?? []) {
          if (event.message?.text) {
            await handleIncomingMessage({
              pageId: entry.id,
              from: event.sender?.id ?? "",
              text: event.message.text,
              channel: "instagram",
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ status: "ok" });
}

// ─── Handler principal de mensaje entrante ───────────────────────
interface IncomingMsg {
  phoneNumberId?: string;
  pageId?: string;
  from: string;
  text: string;
  channel: "whatsapp" | "instagram" | "facebook";
}

async function handleIncomingMessage(msg: IncomingMsg) {
  console.log(`[${msg.channel}] Mensaje de ${msg.from}: ${msg.text}`);

  // TODO:
  // 1. Buscar/crear Conversation en DB
  // 2. Guardar Message{from: 'lead', ...}
  // 3. Si autopilot ON → llamar a POST /api/ai/reply con historial + RAG context
  // 4. Enviar respuesta vía Meta Graph API
  // 5. Emitir evento WebSocket → frontend actualiza en vivo

  // Ejemplo de respuesta automática con Claude:
  if (process.env.ANTHROPIC_API_KEY) {
    const aiRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/ai/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: msg.text }],
      }),
    });
    if (aiRes.ok) {
      const { reply } = await aiRes.json();
      await sendMetaMessage(msg, reply);
    }
  }
}

// ─── Enviar mensaje vía Meta Graph API ───────────────────────────
async function sendMetaMessage(msg: IncomingMsg, text: string) {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token || !msg.phoneNumberId) return;

  const url = `https://graph.facebook.com/v21.0/${msg.phoneNumberId}/messages`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: msg.from,
      type: "text",
      text: { body: text },
    }),
  });
}

// ─── Tipos de payload de Meta ────────────────────────────────────
interface MetaWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      field: string;
      value: {
        metadata?: { phone_number_id: string };
        messages?: Array<{ from: string; text?: { body: string } }>;
        messaging?: Array<{
          sender?: { id: string };
          message?: { text?: string };
        }>;
      };
    }>;
  }>;
}
