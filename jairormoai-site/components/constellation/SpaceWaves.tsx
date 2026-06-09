// Ambient "space light" waves — soft animated aurora blobs using brand colors
// (cyan / mid-blue / purple). Pure CSS, sits behind all content (z-0).
// Inspired by aurora/wave hero backgrounds, adapted to jairoromo.ai's palette.
export function SpaceWaves() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Wave 1 — cyan, top-left */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full blur-[100px] opacity-40 animate-wave-drift-1"
        style={{ background: 'radial-gradient(circle, #4FC3F7 0%, transparent 65%)' }}
      />
      {/* Wave 2 — purple, bottom-right */}
      <div
        className="absolute -bottom-1/4 -right-1/4 w-[85vw] h-[85vw] max-w-[1000px] max-h-[1000px] rounded-full blur-[110px] opacity-35 animate-wave-drift-2"
        style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 65%)' }}
      />
      {/* Wave 3 — mid blue, center, slow drift */}
      <div
        className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full blur-[120px] opacity-30 animate-wave-drift-3"
        style={{ background: 'radial-gradient(circle, #6B8EF5 0%, transparent 65%)' }}
      />
    </div>
  )
}
