'use client'

export function CalEmbed({ calLink }: { calLink: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-bg2/60 overflow-hidden">
      <iframe
        src={`${calLink}?embed=true&theme=dark`}
        className="w-full min-h-[600px]"
        frameBorder="0"
        title="Agendar sesión"
      />
    </div>
  )
}
