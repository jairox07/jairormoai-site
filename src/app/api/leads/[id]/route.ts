import { NextRequest, NextResponse } from "next/server";
import { LEADS, type Lead } from "@/lib/data";

let store: Lead[] = [...LEADS];

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const lead = store.find(l => l.id === id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: lead });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const patch = await req.json();
  const idx = store.findIndex(l => l.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store[idx] = { ...store[idx], ...patch };
  return NextResponse.json({ data: store[idx] });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const idx = store.findIndex(l => l.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store.splice(idx, 1);
  return NextResponse.json({ success: true });
}
