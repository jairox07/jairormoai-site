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

// Lazily initialised — only created when ANTHROPIC_API_KEY is present at call time.
let _client: Anthropic | null = null;

function getClient(apiKey: string): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

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

  const client = getClient(apiKey);
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
            const raw = block.input as Record<string, unknown>;
            if (
              typeof raw.subject !== "string" ||
              typeof raw.description !== "string" ||
              typeof raw.priority !== "string" ||
              typeof raw.contactHandle !== "string"
            ) {
              resultContent = JSON.stringify({ error: "Entrada inválida para create_ticket" });
              toolResults.push({ type: "tool_result", tool_use_id: block.id, content: resultContent });
              continue;
            }
            const result = await handleCreateTicket(
              raw as unknown as CreateTicketInput,
              input.baseUrl
            );
            resultContent = JSON.stringify(result);
          } else if (block.name === "handoff_human") {
            const raw = block.input as Record<string, unknown>;
            if (
              typeof raw.reason !== "string" ||
              typeof raw.contactHandle !== "string"
            ) {
              resultContent = JSON.stringify({ error: "Entrada inválida para handoff_human" });
              toolResults.push({ type: "tool_result", tool_use_id: block.id, content: resultContent });
              continue;
            }
            const result = await handleHandoffHuman(
              raw as unknown as HandoffHumanInput,
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

      // Per spec, we do not loop further after one tool round-trip.
      // If Claude calls a tool again in the follow-up, log and return fallback.
      if (followUp.stop_reason === "tool_use") {
        console.warn("[supportAgent] Unexpected second tool_use in follow-up; returning fallback.");
        return FALLBACK_REPLY;
      }
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
