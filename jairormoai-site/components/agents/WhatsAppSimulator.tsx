'use client'
import { useEffect, useState } from 'react'
import type { AgentChatMessage } from '@/lib/agents-data'

interface Props {
  messages: AgentChatMessage[]
}

export function WhatsAppSimulator({ messages }: Props) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    setVisibleCount(0)
    setTyping(false)
    if (messages.length === 0) return

    let cancelled = false
    let i = 0

    function showNext() {
      if (cancelled || i >= messages.length) return
      setTyping(true)
      const delay = messages[i].delayMs ?? 1100
      setTimeout(() => {
        if (cancelled) return
        setTyping(false)
        i += 1
        setVisibleCount(i)
        setTimeout(showNext, 700)
      }, delay)
    }

    const start = setTimeout(showNext, 500)
    return () => { cancelled = true; clearTimeout(start) }
  }, [messages])

  return (
    <div className="w-full max-w-sm mx-auto rounded-[2rem] border border-white/[0.08] bg-[#0B141A] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
      {/* WhatsApp header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1F2C34] border-b border-black/20">
        <div className="w-9 h-9 rounded-full bg-brand-grad flex items-center justify-center text-sm font-bold text-white shrink-0">
          IA
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sora text-sm font-bold text-white truncate">Asistente IA</p>
          <p className="font-sora text-[11px] text-green-400">{typing ? 'escribiendo…' : 'en línea'}</p>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8696A0" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </div>

      {/* Chat body */}
      <div
        className="flex flex-col gap-2 p-4 min-h-[360px]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {messages.slice(0, visibleCount).map((m, i) => (
          <div key={i} className={`flex ${m.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl font-sora text-[13px] leading-relaxed ${
                m.from === 'bot'
                  ? 'bg-[#1F2C34] text-white rounded-tl-sm'
                  : 'bg-[#005C4B] text-white rounded-tr-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-[#1F2C34] px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray2 animate-pulse-dot" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray2 animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray2 animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
