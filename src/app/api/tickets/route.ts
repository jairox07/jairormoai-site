import { NextRequest, NextResponse } from "next/server";
import { TICKETS, type Ticket } from "@/lib/data";

let store: Ticket[] = [...TICKETS];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const column   = searchParams.get("column");
  const priority = searchParams.get("priority");
  const q        = searchParams.get("q")?.toLowerCase();

  let results = store;
  if (column)   results = results.filter(t => t.column === column);
  if (priority) results = results.filter(t => t.priority === priority);
  if (q)        results = results.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.subject.toLowerCase().includes(q) ||
    t.handle.toLowerCase().includes(q)
  );

  return NextResponse.json({ data: results, total: results.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ticket: Ticket = {
    ...body,
    id: `t-${Date.now()}`,
    messages: body.messages ?? [],
    column: body.column ?? "new",
  };
  store.unshift(ticket);
  return NextResponse.json({ data: ticket }, { status: 201 });
}
