import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EyebrowPill } from '@/components/ui/EyebrowPill'
import { GateBox } from '@/components/blog/GateBox'
import { SessionCTA } from '@/components/blog/SessionCTA'
import type { Post, PostContent } from '@/lib/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) return { title: 'Nota no encontrada — jairoromo.ai' }
  return { title: `${post.title} — jairoromo.ai`, description: post.excerpt }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const { data: authData } = await supabase.auth.getUser()
  const isLoggedIn = !!authData?.user

  let content: PostContent | null = null
  if (isLoggedIn) {
    const { data } = await supabase
      .from('post_content')
      .select('*')
      .eq('post_id', (post as Post).id)
      .single()
    content = data as PostContent | null
  }

  const typedPost = post as Post
  const date = new Date(typedPost.published_at).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <article className="max-w-2xl mx-auto">
        <Link href="/blog" className="font-mono text-[11px] uppercase tracking-wider text-gray2 hover:text-cyan transition-colors mb-8 inline-flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Todas las notas
        </Link>

        {typedPost.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={typedPost.cover_image_url}
            alt=""
            className="w-full h-56 md:h-72 object-cover rounded-2xl border border-white/[0.07] mb-8"
          />
        )}

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {typedPost.newsletter_number && (
            <EyebrowPill>Newsletter Nº {String(typedPost.newsletter_number).padStart(3, '0')}</EyebrowPill>
          )}
          <span className="font-mono text-[11px] text-gray2">{date}</span>
        </div>

        <h1 className="font-sora font-black text-3xl md:text-4xl text-white leading-tight mb-6">
          {typedPost.title}
        </h1>

        <p className="font-sora text-lg text-gray leading-relaxed mb-10">
          {typedPost.excerpt}
        </p>

        {isLoggedIn && content ? (
          <div
            className="font-sora text-[15px] text-gray leading-[1.8] [&_h2]:font-sora [&_h2]:font-black [&_h2]:text-white [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-4 [&_strong]:text-white [&_a]:text-cyan [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: content.body_html }}
          />
        ) : (
          <GateBox slug={typedPost.slug} />
        )}

        <SessionCTA focus={typedPost.session_focus} />
      </article>
    </div>
  )
}
