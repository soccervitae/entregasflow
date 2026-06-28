'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ToggleOnlineProps {
  entregadorId: string
  statusAtual: 'livre' | 'em_rota' | 'inativo'
  onUpdate: () => void
}

export default function ToggleOnline({ entregadorId, statusAtual, onUpdate }: ToggleOnlineProps) {
  const [loading, setLoading] = useState(false)
  const online = statusAtual === 'livre'
  const supabase = createClient()

  const toggle = async () => {
    if (statusAtual === 'em_rota') {
      alert('Você não pode ir offline com uma entrega em andamento.')
      return
    }
    setLoading(true)
    await supabase
      .from('entregadores')
      .update({ status: online ? 'inativo' : 'livre' })
      .eq('id', entregadorId)
    setLoading(false)
    onUpdate()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95 min-h-[48px] ${
        online
          ? 'bg-green-50 text-green-700 border-2 border-green-200'
          : 'bg-surface-container text-on-surface-variant border-2 border-outline-variant'
      }`}
    >
      <div className={`w-11 h-6 rounded-full relative transition-colors ${online ? 'bg-green-500' : 'bg-outline-variant'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${online ? 'left-6' : 'left-1'}`} />
      </div>
      <span>{online ? 'Online' : 'Offline'}</span>
      {online && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
    </button>
  )
}
