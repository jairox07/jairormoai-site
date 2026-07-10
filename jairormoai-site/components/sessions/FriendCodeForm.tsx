'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FRIEND_CODE = 'AMIGOSJR05'

export function FriendCodeForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim().toUpperCase() === FRIEND_CODE) {
      router.push('/sessions/amigos')
    } else {
      setError(true)
    }
  }

  if (!open) {
    return (
      <div className="mt-6 text-center">
        <button
          onClick={() => setOpen(true)}
          className="font-mono text-[10px] text-gray2 hover:text-gray2/70 uppercase tracking-wider transition-colors"
        >
          ¿Tienes un código?
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col items-center gap-2">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(false) }}
          placeholder="Código"
          className="font-mono text-xs bg-bg2 border border-white/[0.1] rounded-lg px-3 py-2 text-center uppercase tracking-wider w-40 focus:outline-none focus:border-cyan/40"
        />
        <button
          type="submit"
          className="font-mono text-[11px] uppercase tracking-wider bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2 hover:bg-white/[0.08] transition-colors"
        >
          Entrar
        </button>
      </div>
      {error && <p className="font-mono text-[10px] text-red-400">Código inválido</p>}
    </form>
  )
}
