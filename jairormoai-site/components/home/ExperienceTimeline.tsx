const TIMELINE = [
  {
    year: '2022',
    title: 'Inicio en IA aplicada',
    desc: 'Primeras 1,000 horas experimentando con modelos de lenguaje, automatizaciones y herramientas emergentes. Sin manual. A prueba y error.',
  },
  {
    year: '2023',
    title: 'Primeros proyectos reales',
    desc: 'Implementación de sistemas RAG, pipelines de automatización y agentes para empresas en México y Latinoamérica.',
  },
  {
    year: '2024',
    title: 'Speaker y consultor',
    desc: 'Conferencias, talleres presenciales y consultoría estratégica de IA para equipos directivos y startups.',
  },
  {
    year: '2025',
    title: 'Plataforma y comunidad',
    desc: 'Lanzamiento de cursos, sesiones 1:1 y bóveda de proyectos open. +5K personas siguiendo el camino.',
  },
]

export function ExperienceTimeline() {
  return (
    <section className="py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-4">
          Trayectoria
        </div>
        <h2 className="font-sora font-black text-3xl md:text-4xl mb-16 leading-tight">
          El camino hasta aquí.
        </h2>

        <div className="relative">
          <div className="absolute left-[72px] top-0 bottom-0 w-px bg-white/[0.07]" />
          <div className="flex flex-col gap-12">
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-[72px] text-right">
                  <span className="font-mono text-sm font-bold text-cyan">{item.year}</span>
                </div>
                <div className="flex-shrink-0 relative mt-1">
                  <div className="w-3 h-3 rounded-full bg-bg2 border-2 border-cyan shadow-[0_0_8px_rgba(79,195,247,0.5)]" />
                </div>
                <div className="flex-1 pb-2">
                  <h3 className="font-sora font-bold text-lg mb-2">{item.title}</h3>
                  <p className="font-sora font-light text-gray text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
