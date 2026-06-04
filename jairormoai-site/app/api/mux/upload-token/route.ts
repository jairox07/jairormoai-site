import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Mux upload via fetch — avoids @mux/mux-node which is incompatible with Turbopack
  const tokenId = process.env.MUX_TOKEN_ID
  const tokenSecret = process.env.MUX_TOKEN_SECRET

  if (!tokenId || !tokenSecret) {
    return NextResponse.json({ error: 'Mux not configured' }, { status: 503 })
  }

  const res = await fetch('https://api.mux.com/video/v1/uploads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${tokenId}:${tokenSecret}`).toString('base64')}`,
    },
    body: JSON.stringify({
      new_asset_settings: {
        playback_policy: ['public'],
        encoding_tier: 'smart',
      },
      cors_origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: 'Mux API error' }, { status: 502 })
  }

  return NextResponse.json({
    uploadUrl: data.data.url,
    uploadId: data.data.id,
  })
}
