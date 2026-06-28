'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePedidosRealtime } from '@/hooks/usePedidosRealtime'
import { useEntregadoresRealtime } from '@/hooks/useEntregadoresRealtime'
import PedidoCard from '@/components/pdv/PedidoCard'
import PedidoDetalhe from '@/components/pdv/PedidoDetalhe'
import FiltroPedidos from '@/components/pdv/FiltroPedidos'
import Toast from '@/components/ui/Toast'
import Spinner from '@/components/ui/Spinner'
import Link from 'next/link'
import { Pedido, StatusPedido } from '@/types'

export default function PdvPage() {
  const [estabelecimentoId, setEstabelecimentoId] = useState<string | null>(null)
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)
  const [filtro, setFiltro] = useState<StatusPedido | 'todos'>('todos')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('estabelecimentos').select('id').eq('owner_id', user.id).single().then(({ data }) => {
        if (data) setEstabelecimentoId(data.id)
      })
    })
  }, [])

  const { pedidos, loading, novoPedidoId, refetch } = usePedidosRealtime(estabelecimentoId)
  const { entregadores } = useEntregadoresRealtime(estabelecimentoId)

  const pedidosFiltrados = filtro === 'todos'
    ? pedidos.filter(p => p.status !== 'entregue' && p.status !== 'cancelado')
    : pedidos.filter(p => p.status === filtro)

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type })
  }

  const handleUpdate = () => {
    refetch()
    if (pedidoSelecionado) {
      const updated = pedidos.find(p => p.id === pedidoSelecionado.id)
      if (updated) setPedidoSelecionado(updated)
    }
  }

  // stats
  const novos = pedidos.filter(p => p.status === 'novo').length
  const emRota = pedidos.filter(p => p.status === 'em_rota').length
  const prontos = pedidos.filter(p => p.status === 'pronto').length
  const entregues = pedidos.filter(p => p.status === 'entregue').length

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-6">
        <div>
          <h2 className="text-lg font-bold text-on-background">Painel de Operações</h2>
          <p className="text-xs text-on-surface-variant">Pedidos em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Realtime ativo
          </div>
          <Link
            href="/pdv/novo"
            className="flex items-center gap-2 bg-secondary-container text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Novo Pedido
          </Link>
        </div>
      </header>

      {/* Metrics bar */}
      <div className="px-6 py-3 grid grid-cols-4 gap-4 border-b border-outline-variant bg-surface-container-low/50">
        {[
          { label: 'Novos', value: novos, color: 'text-on-surface-variant', bg: 'bg-surface-container' },
          { label: 'Prontos', value: prontos, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Em Rota', value: emRota, color: 'text-purple-700', bg: 'bg-purple-50' },
          { label: 'Entregues hoje', value: entregues, color: 'text-green-700', bg: 'bg-green-50' },
        ].map((m) => (
          <div key={m.label} className={`${m.bg} rounded-xl px-4 py-2.5 text-center`}>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-on-surface-variant">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Main 3-col layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* List */}
        <div className="w-[340px] border-r border-outline-variant flex flex-col">
          <div className="p-4 border-b border-outline-variant">
            <FiltroPedidos filtroAtivo={filtro} onChange={setFiltro} />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-3 block">inbox</span>
                <p className="text-sm">Nenhum pedido {filtro !== 'todos' ? `com status "${filtro}"` : 'ativo'}</p>
              </div>
            ) : (
              pedidosFiltrados.map((p) => (
                <PedidoCard
                  key={p.id}
                  pedido={p}
                  selecionado={pedidoSelecionado?.id === p.id}
                  onClick={() => setPedidoSelecionado(p)}
                  novo={p.id === novoPedidoId}
                />
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 overflow-hidden">
          {pedidoSelecionado ? (
            <PedidoDetalhe
              key={pedidoSelecionado.id}
              pedido={pedidoSelecionado}
              entregadores={entregadores}
              onUpdate={handleUpdate}
              onToast={showToast}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-7xl mb-4 opacity-20">receipt_long</span>
              <p className="text-lg font-medium opacity-40">Selecione um pedido para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
