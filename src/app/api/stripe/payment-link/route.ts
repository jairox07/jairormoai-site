import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amount, currency = "mxn", description, leadId } = await req.json();

  // If Stripe key is configured, create a real payment link
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-04-22.dahlia" as const });

      const price = await stripe.prices.create({
        currency,
        unit_amount: Math.round(amount * 100),
        product_data: { name: description ?? "Pago CRM Conversacional" },
      });

      const link = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
        metadata: { leadId: leadId ?? "" },
      });

      return NextResponse.json({ url: link.url, id: link.id });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  // Simulate: return a fake URL
  const fakeId = `pl_${Date.now()}`;
  return NextResponse.json({
    url: `https://buy.stripe.com/test/${fakeId}`,
    id: fakeId,
    simulated: true,
  });
}
