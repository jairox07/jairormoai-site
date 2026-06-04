import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { SESSION_PACKAGES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  // Course purchase branch
  if (body.courseSlug && body.stripePriceId) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: body.stripePriceId, quantity: 1 }],
      success_url: `${siteUrl}/courses/${body.courseSlug}?enrolled=true`,
      cancel_url: `${siteUrl}/courses/${body.courseSlug}`,
      metadata: {
        courseSlug: body.courseSlug,
        userId: user.id,
      },
    })
    return NextResponse.json({ url: session.url })
  }

  // Sessions package purchase branch (existing)
  const { packageId } = body
  const pkg = SESSION_PACKAGES.find((p) => p.id === packageId)
  if (!pkg) return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
  if (!pkg.stripePriceId) return NextResponse.json({ error: 'Price not configured' }, { status: 400 })

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
    success_url: `${siteUrl}/sessions/success?session_id={CHECKOUT_SESSION_ID}&pkg=${pkg.id}`,
    cancel_url: `${siteUrl}/sessions`,
    metadata: { packageId: pkg.id, calLink: pkg.calLink },
  })

  return NextResponse.json({ url: session.url })
}
