import { NextRequest, NextResponse } from "next/server";
import { LEADS, type Lead } from "@/lib/data";

// In-memory store (resets on server restart; replace with DB for prod)
let store: Lead[] = [...LEADS];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const column = searchParams.get("column");
  const q      = searchParams.get("q")?.toLowerCase();

  let results = store;
  if (column) results = results.filter(l => l.column === column);
  if (q)      results = results.filter(l =>
    l.name.toLowerCase().includes(q) ||
    l.intent.toLowerCase().includes(q) ||
    l.handle.toLowerCase().includes(q)
  );

  return NextResponse.json({ data: results, total: results.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const lead: Lead = {
    ...body,
    id: `l-${Date.now()}`,
    messages: body.messages ?? [],
    column: body.column ?? "new",
  };
  store.unshift(lead);
  return NextResponse.json({ data: lead }, { status: 201 });
}
