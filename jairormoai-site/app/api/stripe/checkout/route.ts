import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { SESSION_PACKAGES } from '@/lib/constants'

export async function POST(request: Request) {
  const { packageId } = await request.json()

  const pkg = SESSION_PACKAGES.find((p) => p.id === packageId)
  if (!pkg) return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
  if (!pkg.stripePriceId) return NextResponse.json({ error: 'Price not configured' }, { status: 400 })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
    success_url: `${siteUrl}/sessions/success?session_id={CHECKOUT_SESSION_ID}&pkg=${pkg.id}`,
    cancel_url: `${siteUrl}/sessions`,
    metadata: { packageId: pkg.id, calLink: pkg.calLink },
  })

  return NextResponse.json({ url: session.url })
}
