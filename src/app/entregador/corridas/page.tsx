'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pedido, Entregador } from '@/types'
import CorridaCard from '@/components/entregador/CorridaCard'
import GanhosHoje from '@/components/entregador/GanhosHoje'
import ToggleOnline from '@/components/entregador/ToggleOnline'
import Toast from '@/components/ui/Toast'
import Spinner from '@/components/ui/Spinner'
import Link from 'next/link'

export default function CorridasPage() {
  const [entregador, setEntregador] = useState<Entregador | null>(null)
  const [corridas, setCorridas] = useState<Pedido[]>([])
  const [ganhosTotal, setGanhosTotal] = useState(0)
  const [ganhosQtd, setGanhosQtd] = useState(0)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const supabase = createClient()

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: ent } = await supabase.from('entregadores').select('*').eq('user_id', user.id).single()
    if (!ent) return
    setEntregador(ent as Entregador)

    const { data: peds } = await supabase
      .from('pedidos')
      .select('*')
      .eq('entregador_id', ent.id)
      .eq('status', 'em_rota')
    if (peds) setCorridas(peds as Pedido[])

    const hoje = new Date().toISOString().split('T')[0]
    const { data: ganhos } = await supabase
      .from('ganhos_entregadores')
      .select('valor')
      .eq('entregador_id', ent.id)
      .eq('data', hoje)
    if (ganhos) {
      setGanhosQtd(ganhos.length)
      setGanhosTotal(ganhos.reduce((acc, g) => acc + g.valor, 0))
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!entregador) return
    const channel = supabase
      .channel('corridas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => loadData())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [entregador, loadData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/entregador'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!entregador) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3">error</span>
        <p className="text-on-surface-variant">Entregador não encontrado</p>
        <button onClick={handleLogout} className="mt-4 text-sm text-error">Sair</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="bg-on-background px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-on-primary-container text-xs">Olá,</p>
            <h1 className="text-surface-container-lowest text-xl font-bold">{entregador.nome}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/entregador/historico" className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-surface-variant text-[20px]">history</span>
            </Link>
            <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-surface-variant text-[20px]">logout</span>
            </button>
          </div>
        </div>
        <ToggleOnline
          entregadorId={entregador.id}
          statusAtual={entregador.status}
          onUpdate={loadData}
        />
      </div>

      {/* Ganhos */}
      <div className="py-4 bg-on-background pb-6">
        <GanhosHoje total={ganhosTotal} quantidade={ganhosQtd} />
      </div>

      {/* Corridas */}
      <div className="flex-1 bg-background">
        <div className="px-4 py-4 flex items-center justify-between">
          <h2 className="font-bold text-on-background">Corridas Ativas</h2>
          <span className="bg-secondary-container text-white text-xs px-2.5 py-1 rounded-full font-bold">
            {corridas.length}
          </span>
        </div>

        {corridas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">two_wheeler</span>
            <p className="font-medium opacity-50">Nenhuma corrida ativa</p>
            <p className="text-sm opacity-30 mt-1">Aguarde novos pedidos</p>
            {entregador.status === 'inativo' && (
              <p className="text-sm text-amber-600 mt-4 font-medium">Você está offline</p>
            )}
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            {corridas.map((c) => (
              <CorridaCard
                key={c.id}
                pedido={c}
                entregadorId={entregador.id}
                onUpdate={loadData}
                onToast={(msg, type) => setToast({ msg, type: type || 'success' })}
              />
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
