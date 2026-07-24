'use client'
import { useEffect, useState } from 'react'
import type { AgentChatMessage, AgentDocument } from '@/lib/agents-data'

interface Props {
  messages: AgentChatMessage[]
}

const DOC_ICON: Record<AgentDocument['kind'], string> = {
  invoice: '🧾',
  receipt: '📋',
  payment: '✅',
  photo: '🖼️',
}

const STATUS_TONE: Record<'ok' | 'pending' | 'warn', string> = {
  ok: 'bg-green-400/15 text-green-400 border-green-400/30',
  pending: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
  warn: 'bg-red-400/15 text-red-400 border-red-400/30',
}

function DocumentBubble({ doc }: { doc: AgentDocument }) {
  return (
    <div className="w-56 rounded-xl overflow-hidden bg-[#111B21] border border-white/[0.08]">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]">
        <span className="text-lg">{DOC_ICON[doc.kind]}</span>
        <p className="font-sora text-[12px] font-bold text-white flex-1 truncate">{doc.title}</p>
      </div>
      <div className="px-3 py-2.5 flex flex-col gap-1">
        {doc.lines.map((line, i) => (
          <p key={i} className="font-mono text-[11px] text-gray2 leading-relaxed">{line}</p>
        ))}
        {doc.status && (
          <span className={`mt-1.5 self-start font-mono text-[9px] font-bold uppercase tracking-[1px] px-2 py-0.5 rounded-full border ${STATUS_TONE[doc.status.tone]}`}>
            {doc.status.label}
          </span>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ m }: { m: AgentChatMessage }) {
  const isBot = m.from === 'bot'
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl font-sora text-[13px] leading-relaxed ${
          isBot ? 'bg-[#1F2C34] text-white rounded-tl-sm' : 'bg-[#005C4B] text-white rounded-tr-sm'
        } ${m.document ? 'p-1.5' : ''}`}
      >
        {m.document && <DocumentBubble doc={m.document} />}
        {m.text && <p className={m.document ? 'px-1.5 pt-1.5' : ''}>{m.text}</p>}
        {m.time && (
          <div className={`flex items-center gap-1 mt-1 ${m.document ? 'px-1.5 pb-0.5' : ''} justify-end`}>
            <span className="font-sora text-[10px] text-white/45">{m.time}</span>
            {!isBot && (
              <svg width="14" height="10" viewBox="0 0 16 11" fill="none">
                <path d="M1 5.5L4.5 9L11 1.5" stroke="#53BDEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.5 5.5L9 9L15.5 1.5" stroke="#53BDEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  )
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
      const msg = messages[i]
      const isBot = msg.from === 'bot'
      const baseDelay = msg.document ? 1500 : 900
      const delay = msg.delayMs ?? baseDelay

      if (isBot) {
        setTyping(true)
        setTimeout(() => {
          if (cancelled) return
          setTyping(false)
          i += 1
          setVisibleCount(i)
          setTimeout(showNext, 550)
        }, delay)
      } else {
        setTimeout(() => {
          if (cancelled) return
          i += 1
          setVisibleCount(i)
          setTimeout(showNext, 400)
        }, Math.min(delay, 700))
      }
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
        className="flex flex-col gap-2 p-4 min-h-[420px]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {messages.slice(0, visibleCount).map((m, i) => (
          <MessageBubble key={i} m={m} />
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
