import { createClient } from '@/lib/supabase/server'
import { EyebrowPill } from '@/components/ui/EyebrowPill'
import { BlogListClient } from '@/components/blog/BlogListClient'
import type { Post } from '@/lib/types'

export const metadata = {
  title: 'Blog — IA al día, sin ruido | jairoromo.ai',
  description: 'El archivo del newsletter semanal: noticias de IA con ángulo de implementación real para PyMEs y profesionistas en LATAM.',
}

export const revalidate = 300

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <EyebrowPill live className="mb-5">Blog · IA al día, sin ruido</EyebrowPill>
          <h1 className="font-sora font-black text-3xl md:text-5xl mb-4">
            El archivo del <span className="text-cyan">newsletter</span>.
          </h1>
          <p className="font-sora text-gray max-w-2xl">
            Cada martes mando un resumen corto por correo. Aquí está la nota completa de cada número —
            libre para quien se registra con su correo, gratis, sin tarjeta.
          </p>
        </div>

        <BlogListClient posts={(posts as Post[]) ?? []} />
      </div>
    </div>
  )
}
