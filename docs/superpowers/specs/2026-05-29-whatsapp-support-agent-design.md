# WhatsApp Support Agent — Design Spec

**Date:** 2026-05-29
**Scope:** v1 single-brand WhatsApp-facing customer support agent

---

## Overview

A stateless, prompt-chained AI agent that handles inbound WhatsApp customer support messages. Each message triggers one Claude API call with RAG-retrieved context and two available tools: `create_ticket` and `handoff_human`. No persistent agent process; all conversation state lives in the existing data layer.

---

## Architecture

```
WhatsApp → /api/webhooks/meta → supportAgent()
                                    ├── RAG search (top-3 KB chunks)
                                    ├── Build system prompt
                                    ├── Claude API call (tool_use)
                                    │     ├── [text] → send reply to WhatsApp
                                    │     ├── [create_ticket] → POST /api/tickets → send confirmation
                                    │     └── [handoff_human] → check presence → route or fallback to ticket
                                    └── Return reply text
```

The existing `/api/webhooks/meta/route.ts` is extended to call `supportAgent()` after parsing the inbound message and send the result back via the WhatsApp Cloud API.

---

## New Files

| File | Purpose |
|------|---------|
| `src/lib/agent/supportAgent.ts` | Core agent function: RAG → prompt → Claude call → tool execution → reply |
| `src/lib/agent/tools.ts` | Tool schemas (JSON) + server-side handlers for `create_ticket` and `handoff_human` |
| `src/lib/agent/prompt.ts` | Builds the system prompt from brand config + injected KB chunks |

---

## Tool Definitions

### `create_ticket`
Creates a support ticket in the existing system.

**Input:** `{ subject: string, description: string, contactId: string, priority: "low" | "medium" | "high" }`

**Handler:** POSTs to `/api/tickets`. Returns the created ticket ID.

**Claude receives:** `{ ticketId: string, message: "Ticket #X creado exitosamente" }`

---

### `handoff_human`
Escalates the conversation to a live human agent.

**Input:** `{ reason: string, contactId: string }`

**Handler:**
1. Check if any agent is online (presence logic via AppContext)
2. If online: route conversation to chat dock, return `{ status: "routed" }`
3. If offline: auto-call `create_ticket` handler, return `{ status: "ticket_created", ticketId: string }`

---

## System Prompt Structure

```
[Brand persona — name, tone, language]
[Business context — industry, products/services summary]
[Knowledge base context — top-3 RAG chunks for current query]
[Tool instructions — when to create a ticket vs. hand off to human]
[Hard rules — never make up prices, always confirm ticket creation, respond in same language as customer]
```

---

## Data Flow

### Happy path
1. Inbound WhatsApp message received at webhook
2. Last 10 messages fetched for conversation history
3. RAG search returns top-3 KB chunks relevant to the message
4. System prompt built and Claude called with `messages` array
5. Claude returns `text` → sent directly to WhatsApp

### Tool call path
1. Claude returns `create_ticket` → server creates ticket → result returned to Claude → Claude sends confirmation text
2. Claude returns `handoff_human` → presence check → route or auto-ticket → Claude sends appropriate reply

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| RAG returns no results | Claude answers from general knowledge + adds disclaimer |
| Claude API error | Send static fallback message + auto-create ticket |
| WhatsApp send failure | Log error, no retry (Meta handles delivery) |
| Tool handler failure | Log error, Claude informed via tool result, sends apology + ticket fallback |

---

## Out of Scope (v1)

- Multi-tenant / white-label support
- Order status or inventory lookups
- Appointment scheduling
- Stripe payment link initiation
- Proactive outbound messages
- Agent loop (multi-step tool chaining)

---

## Success Criteria

- Agent replies to inbound WhatsApp messages within 3 seconds
- Creates tickets correctly when Claude calls `create_ticket`
- Routes to human (or falls back to ticket) when Claude calls `handoff_human`
- Static fallback fires reliably on Claude API errors
- No hallucinated prices or policies (enforced via system prompt hard rules)
