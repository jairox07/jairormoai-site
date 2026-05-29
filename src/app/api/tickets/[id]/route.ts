import { NextRequest, NextResponse } from "next/server";
import { TICKETS, type Ticket } from "@/lib/data";

let store: Ticket[] = [...TICKETS];

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const ticket = store.find(t => t.id === id);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: ticket });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const patch = await req.json();
  const idx = store.findIndex(t => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store[idx] = { ...store[idx], ...patch };
  return NextResponse.json({ data: store[idx] });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const idx = store.findIndex(t => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store.splice(idx, 1);
  return NextResponse.json({ success: true });
}
