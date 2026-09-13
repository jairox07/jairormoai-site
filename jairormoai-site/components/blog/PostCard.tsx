import Link from 'next/link'
import type { Post } from '@/lib/types'

export function PostCard({ post }: { post: Post }) {
  const date = new Date(post.published_at).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-white/[0.07] bg-bg2/40 overflow-hidden transition-all hover:-translate-y-1 hover:border-cyan/25 hover:bg-bg2/70"
    >
      {post.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover_image_url} alt={post.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-brand-grad opacity-20" />
      )}
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {post.newsletter_number && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan bg-cyan/10 border border-cyan/20 px-2 py-0.5 rounded-full">
              Nº {String(post.newsletter_number).padStart(3, '0')}
            </span>
          )}
          <span className="font-mono text-[10px] text-gray2">{date}</span>
        </div>
        <h3 className="font-sora font-black text-lg text-white mb-2 leading-snug group-hover:text-cyan transition-colors">
          {post.title}
        </h3>
        <p className="font-sora text-sm text-gray leading-relaxed line-clamp-3 mb-4">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-cyan">
          Leer la nota completa
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
