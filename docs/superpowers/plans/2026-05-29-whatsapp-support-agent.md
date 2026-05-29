# WhatsApp Support Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire a prompt-chained Claude tool-use agent into the existing Meta webhook so inbound WhatsApp messages receive AI-generated support replies, can create tickets, and can escalate to a human agent.

**Architecture:** Each inbound WhatsApp message triggers `supportAgent()`, which builds a system prompt from the brand KB, calls Claude with two tool definitions (`create_ticket`, `handoff_human`), executes any tool calls server-side, and returns the final reply text. The existing `/api/webhooks/meta` POST handler calls this function and sends the result back via the WhatsApp Cloud API.

**Tech Stack:** Next.js 14 App Router, TypeScript, `@anthropic-ai/sdk`, existing `/api/tickets` route, existing `Ticket` type from `@/lib/data`.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/agent/prompt.ts` | Builds the system prompt string from brand config + KB |
| Create | `src/lib/agent/tools.ts` | Tool JSON schemas + server-side handlers |
| Create | `src/lib/agent/supportAgent.ts` | Core agent: prompt → Claude call → tool execution → reply |
| Modify | `src/app/api/webhooks/meta/route.ts` | Replace TODO block with `supportAgent()` call |
| Modify | `src/lib/knowledge.ts` | Add automotive KB + configurable `AgentConfig` type |

---

## Task 1: Add `AgentConfig` type and automotive KB to `knowledge.ts`

**Files:**
- Modify: `src/lib/knowledge.ts`

- [ ] **Step 1: Add `AgentConfig` type and Karrott automotive config**

Open `src/lib/knowledge.ts` and append the following at the end of the file (keep all existing content):

```typescript
// ─── Configurable agent brand ────────────────────────────────────

export interface AgentConfig {
  agentName: string;       // Name shown in WhatsApp replies
  brandName: string;       // Business name
  industry: string;        // e.g. "agencia automotriz"
  knowledgeBase: string;   // Full KB text injected into system prompt
  language: string;        // e.g. "español mexicano"
  toneRules: string[];     // Hard rules for the model
}

export const KARROTT_AUTOMOTIVE_KB = `
# KARROTT — BASE DE CONOCIMIENTO AUTOMOTRIZ

## IDENTIDAD
Karrott es una plataforma de gestión para agencias automotrices. Las agencias que usan Karrott venden vehículos nuevos y seminuevos, ofrecen servicios de posventa y financiamiento.

## INVENTARIO TÍPICO
- Vehículos nuevos: modelos del año vigente y anterior con precio de lista
- Seminuevos certificados: revisión de 150 puntos, garantía 6–12 meses
- Precio de lista es orientativo — el precio final incluye descuentos, accesorios y plan de financiamiento

## FINANCIAMIENTO
- Crédito automotriz: enganche desde 10–20%, plazos 12–60 meses
- Mensualidades aproximadas calculadas al cierre de la operación
- Instituciones: BBVA, Banorte, Santander, Scotiabank, financiera de la marca
- Seguro de auto incluible en el crédito

## PROCESO DE COMPRA
1. Cliente expresa interés en modelo/versión
2. Agente presenta opciones de inventario disponible
3. Prueba de manejo agendada en agencia
4. Cotización formal con opciones de financiamiento
5. Separación con anticipo
6. Trámites y entrega

## POSVENTA Y SERVICIO
- Citas de servicio (mantenimiento, garantía, hojalatería)
- Refacciones originales y alternativas
- Tiempo de respuesta en taller: según carga, 1–5 días hábiles

## POLÍTICAS
- Precios sujetos a disponibilidad y tipo de cambio en vehículos de importación
- Seminuevos: no se aceptan devoluciones tras firma, solo garantías
- Cancelación de separado: reembolsable con 48h de anticipación
`;

export const KARROTT_AGENT_CONFIG: AgentConfig = {
  agentName: "Karla",
  brandName: "Karrott",
  industry: "agencia automotriz",
  knowledgeBase: KARROTT_AUTOMOTIVE_KB,
  language: "español mexicano",
  toneRules: [
    "Nunca confirmes precio exacto sin que el asesor de ventas lo valide primero",
    "No garantices disponibilidad de inventario — siempre di 'sujeto a existencia'",
    "Si el cliente pregunta por un modelo específico que no conoces, di que lo verificarás con el equipo",
    "Máximo 1 emoji por mensaje",
    "Responde siempre en español mexicano",
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/knowledge.ts
git commit -m "feat: add AgentConfig type and Karrott automotive KB"
```

---

## Task 2: Create `src/lib/agent/prompt.ts`

**Files:**
- Create: `src/lib/agent/prompt.ts`

- [ ] **Step 1: Create the file**

```typescript
import type { AgentConfig } from "@/lib/knowledge";

export function buildSystemPrompt(config: AgentConfig): string {
  const rules = config.toneRules.map((r, i) => `${i + 1}. ${r}`).join("\n");

  return `Eres ${config.agentName}, asistente virtual de soporte de ${config.brandName} (${config.industry}).

Tu rol es resolver dudas de clientes, crear tickets de soporte cuando sea necesario y escalar a un agente humano cuando el cliente lo solicite o la situación lo requiera.

REGLAS ESTRICTAS:
${rules}
${rules.length > 0 ? "" : "- Sé claro, conciso y profesional"}

HERRAMIENTAS DISPONIBLES:
- Usa \`create_ticket\` cuando el cliente reporte un problema que requiere seguimiento (falla, queja, solicitud de garantía)
- Usa \`handoff_human\` cuando: (a) el cliente lo pida explícitamente, (b) la conversación sea muy compleja, o (c) detectes frustración alta
- Si \`handoff_human\` regresa status "ticket_created", informa al cliente que no hay agentes disponibles pero se creó un ticket y le responderán pronto

BASE DE CONOCIMIENTO:
${config.knowledgeBase}`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/agent/prompt.ts
git commit -m "feat: add buildSystemPrompt for configurable agent"
```

---

## Task 3: Create `src/lib/agent/tools.ts`

**Files:**
- Create: `src/lib/agent/tools.ts`

- [ ] **Step 1: Create the file**

```typescript
import type { Tool } from "@anthropic-ai/sdk/resources/messages";

// ─── Tool schemas (sent to Claude) ──────────────────────────────

export const TOOL_DEFINITIONS: Tool[] = [
  {
    name: "create_ticket",
    description: "Crea un ticket de soporte en el sistema cuando el cliente reporta un problema que requiere seguimiento.",
    input_schema: {
      type: "object" as const,
      properties: {
        subject: {
          type: "string",
          description: "Asunto corto del ticket (máx 80 caracteres)",
        },
        description: {
          type: "string",
          description: "Descripción detallada del problema reportado por el cliente",
        },
        priority: {
          type: "string",
          enum: ["low", "normal", "high", "urgent"],
          description: "Prioridad del ticket según urgencia del cliente",
        },
        contactHandle: {
          type: "string",
          description: "Número de WhatsApp o identificador del cliente (e.g. +521234567890)",
        },
      },
      required: ["subject", "description", "priority", "contactHandle"],
    },
  },
  {
    name: "handoff_human",
    description: "Escala la conversación a un agente humano cuando el cliente lo solicita o la situación lo requiere.",
    input_schema: {
      type: "object" as const,
      properties: {
        reason: {
          type: "string",
          description: "Motivo de la escalación",
        },
        contactHandle: {
          type: "string",
          description: "Número de WhatsApp o identificador del cliente",
        },
      },
      required: ["reason", "contactHandle"],
    },
  },
];

// ─── Tool result types ───────────────────────────────────────────

export interface CreateTicketInput {
  subject: string;
  description: string;
  priority: "low" | "normal" | "high" | "urgent";
  contactHandle: string;
}

export interface HandoffHumanInput {
  reason: string;
  contactHandle: string;
}

// ─── Tool handlers ────────────────────────────────────────────────

export async function handleCreateTicket(
  input: CreateTicketInput,
  baseUrl: string
): Promise<{ ticketId: string; message: string }> {
  const res = await fetch(`${baseUrl}/api/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.contactHandle,
      handle: input.contactHandle,
      channel: "whatsapp",
      column: "new",
      priority: input.priority,
      category: "soporte",
      subject: input.subject,
      lastSeen: new Date().toISOString(),
      avatarHue: 210,
      assignee: null,
      tags: ["whatsapp-agent"],
      messages: [
        {
          from: "system",
          type: "system",
          t: new Date().toISOString(),
          text: input.description,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Error creando ticket: ${res.status}`);
  }

  const { data } = await res.json();
  return {
    ticketId: data.id,
    message: `Ticket #${data.id} creado exitosamente`,
  };
}

export async function handleHandoffHuman(
  input: HandoffHumanInput,
  baseUrl: string
): Promise<{ status: "routed" | "ticket_created"; ticketId?: string; message: string }> {
  // In v1 there is no real-time presence check — always fall back to ticket.
  // Replace this logic with a presence API call when available.
  const agentsOnline = false;

  if (agentsOnline) {
    // Future: emit WebSocket event to route conversation to chat dock
    return { status: "routed", message: "Conversación transferida a agente humano" };
  }

  // No agents online — create a ticket as fallback
  const ticketResult = await handleCreateTicket(
    {
      subject: `Escalación solicitada: ${input.reason}`,
      description: `El cliente solicitó hablar con un agente humano. Motivo: ${input.reason}`,
      priority: "high",
      contactHandle: input.contactHandle,
    },
    baseUrl
  );

  return {
    status: "ticket_created",
    ticketId: ticketResult.ticketId,
    message: `No hay agentes disponibles. ${ticketResult.message}`,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/agent/tools.ts
git commit -m "feat: add tool definitions and handlers for create_ticket and handoff_human"
```

---

## Task 4: Create `src/lib/agent/supportAgent.ts`

**Files:**
- Create: `src/lib/agent/supportAgent.ts`

- [ ] **Step 1: Create the file**

```typescript
import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { buildSystemPrompt } from "./prompt";
import {
  TOOL_DEFINITIONS,
  handleCreateTicket,
  handleHandoffHuman,
  type CreateTicketInput,
  type HandoffHumanInput,
} from "./tools";
import { KARROTT_AGENT_CONFIG } from "@/lib/knowledge";

const FALLBACK_REPLY =
  "Estamos teniendo problemas técnicos en este momento. Un agente te contactará pronto para ayudarte.";

export interface SupportAgentInput {
  contactHandle: string;           // WhatsApp number, e.g. "+521234567890"
  message: string;                 // Current inbound message text
  history: MessageParam[];         // Last N turns (alternating user/assistant)
  baseUrl: string;                 // e.g. "http://localhost:3000" — for internal API calls
}

export async function supportAgent(input: SupportAgentInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return FALLBACK_REPLY;
  }

  const client = new Anthropic({ apiKey });
  const systemPrompt = buildSystemPrompt(KARROTT_AGENT_CONFIG);

  // Append the current message to conversation history
  const messages: MessageParam[] = [
    ...input.history,
    { role: "user", content: input.message },
  ];

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      tools: TOOL_DEFINITIONS,
      messages,
    });

    // Handle tool use
    if (response.stop_reason === "tool_use") {
      const toolResults: MessageParam["content"] = [];

      for (const block of response.content) {
        if (block.type !== "tool_use") continue;

        let resultContent: string;

        try {
          if (block.name === "create_ticket") {
            const result = await handleCreateTicket(
              block.input as CreateTicketInput,
              input.baseUrl
            );
            resultContent = JSON.stringify(result);
          } else if (block.name === "handoff_human") {
            const result = await handleHandoffHuman(
              block.input as HandoffHumanInput,
              input.baseUrl
            );
            resultContent = JSON.stringify(result);
          } else {
            resultContent = JSON.stringify({ error: "Herramienta desconocida" });
          }
        } catch (err) {
          resultContent = JSON.stringify({
            error: err instanceof Error ? err.message : "Error ejecutando herramienta",
          });
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: resultContent,
        });
      }

      // Send tool results back to Claude for final reply
      const followUp = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        tools: TOOL_DEFINITIONS,
        messages: [
          ...messages,
          { role: "assistant", content: response.content },
          { role: "user", content: toolResults },
        ],
      });

      const text = followUp.content.find((b) => b.type === "text");
      return text?.type === "text" ? text.text : FALLBACK_REPLY;
    }

    // Plain text response (no tool call)
    const text = response.content.find((b) => b.type === "text");
    return text?.type === "text" ? text.text : FALLBACK_REPLY;
  } catch (err) {
    console.error("[supportAgent] Error:", err);
    return FALLBACK_REPLY;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/agent/supportAgent.ts
git commit -m "feat: add supportAgent core function with Claude tool-use loop"
```

---

## Task 5: Wire `supportAgent` into the Meta webhook

**Files:**
- Modify: `src/app/api/webhooks/meta/route.ts`

- [ ] **Step 1: Replace the TODO block in `handleIncomingMessage`**

Find the existing `handleIncomingMessage` function (lines 90–114) and replace it with:

```typescript
async function handleIncomingMessage(msg: IncomingMsg) {
  console.log(`[${msg.channel}] Mensaje de ${msg.from}: ${msg.text}`);

  if (!msg.text.trim()) return;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const reply = await supportAgent({
    contactHandle: msg.from,
    message: msg.text,
    history: [],   // v1: stateless — no conversation history persistence yet
    baseUrl,
  });

  await sendMetaMessage(msg, reply);
}
```

- [ ] **Step 2: Add the import at the top of the file**

Add after the existing imports:

```typescript
import { supportAgent } from "@/lib/agent/supportAgent";
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. Fix any type errors before continuing.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/webhooks/meta/route.ts
git commit -m "feat: wire supportAgent into Meta webhook handler"
```

---

## Task 6: Manual smoke test

- [ ] **Step 1: Set environment variables**

Ensure `.env.local` contains:

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
META_VERIFY_TOKEN=your-token
META_APP_SECRET=your-secret
META_ACCESS_TOKEN=your-access-token
```

- [ ] **Step 2: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 3: Simulate an inbound WhatsApp message**

```bash
curl -X POST http://localhost:3000/api/webhooks/meta \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123",
      "changes": [{
        "field": "messages",
        "value": {
          "metadata": { "phone_number_id": "PHONE_ID" },
          "messages": [{
            "from": "+521234567890",
            "text": { "body": "Hola, tengo un problema con mi cita de servicio" }
          }]
        }
      }]
    }]
  }'
```

Expected: `{"status":"ok"}` and a Claude-generated reply logged to console (WhatsApp send will fail without a real phone_number_id, that's OK in local dev).

- [ ] **Step 4: Simulate a ticket creation trigger**

```bash
curl -X POST http://localhost:3000/api/webhooks/meta \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123",
      "changes": [{
        "field": "messages",
        "value": {
          "metadata": { "phone_number_id": "PHONE_ID" },
          "messages": [{
            "from": "+521234567890",
            "text": { "body": "Quiero hablar con un agente humano por favor" }
          }]
        }
      }]
    }]
  }'
```

Expected: a new ticket appears when you call `GET /api/tickets`.

- [ ] **Step 5: Verify ticket was created**

```bash
curl http://localhost:3000/api/tickets
```

Expected: JSON array with a ticket whose `tags` includes `"whatsapp-agent"` and `handle` is `"+521234567890"`.

---

## Out of Scope (v1)

- Conversation history persistence (each message is stateless for now)
- Real-time human presence check in `handoff_human`
- Automotive-specific tools (inventory lookup, test drive scheduling)
- HMAC signature validation bypass in local dev (already handled by the existing `if (appSecret)` guard)
