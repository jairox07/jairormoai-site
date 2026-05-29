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
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/tickets`, {
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
  } catch (err) {
    throw new Error(`No se pudo conectar con el servidor de tickets: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!res.ok) {
    throw new Error(`Error creando ticket: ${res.status}`);
  }

  const json = await res.json().catch(() => {
    throw new Error(`Respuesta no-JSON del servidor (${res.status})`);
  });
  const { data } = json;

  if (!data?.id) {
    throw new Error("Respuesta inesperada del servidor: falta data.id");
  }

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
    // TODO: unreachable in v1 — presence check not implemented yet
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
