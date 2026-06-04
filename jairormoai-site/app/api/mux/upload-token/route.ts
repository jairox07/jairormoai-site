import { NextResponse } from 'next/server'
import { mux } from '@/lib/mux'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ['public'],
      encoding_tier: 'smart',
    },
    cors_origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  })

  return NextResponse.json({
    uploadUrl: upload.url,
    uploadId: upload.id,
  })
}
