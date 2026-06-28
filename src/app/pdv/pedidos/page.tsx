'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pedido, StatusPedido } from '@/types'
import StatusBadge from '@/components/pdv/StatusBadge'
import Spinner from '@/components/ui/Spinner'

const formaPagamentoLabel: Record<string, string> = {
  pix: 'PIX', dinheiro: 'Dinheiro', cartao_credito: 'Cartão Créd.', cartao_debito: 'Cartão Déb.',
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<StatusPedido | 'todos'>('todos')
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: est } = await supabase.from('estabelecimentos').select('id').eq('owner_id', user.id).single()
      if (!est) return
      const { data } = await supabase
        .from('pedidos')
        .select('*, entregadores(nome)')
        .eq('estabelecimento_id', est.id)
        .order('criado_em', { ascending: false })
        .limit(200)
      setLoading(false)
      if (data) setPedidos(data as Pedido[])
    }
    load()
  }, [])

  const filtrados = pedidos.filter(p => {
    const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus
    const matchBusca = !busca || p.cliente_nome.toLowerCase().includes(busca.toLowerCase()) || String(p.numero).includes(busca)
    return matchStatus && matchBusca
  })

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-6">
        <div>
          <h2 className="text-lg font-bold text-on-background">Histórico de Pedidos</h2>
          <p className="text-xs text-on-surface-variant">{pedidos.length} pedidos encontrados</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
              placeholder="Buscar por nome ou número..."
            />
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusPedido | 'todos')}
            className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none"
          >
            <option value="todos">Todos os status</option>
            <option value="novo">Novo</option>
            <option value="em_preparo">Em Preparo</option>
            <option value="pronto">Pronto</option>
            <option value="em_rota">Em Rota</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/30">
                  {['#', 'Cliente', 'Endereço', 'Total', 'Pagamento', 'Entregador', 'Status', 'Data'].map(col => (
                    <th key={col} className="px-5 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtrados.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-5 py-4 text-sm font-bold text-on-surface-variant">#{p.numero}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-on-background">{p.cliente_nome}</p>
                      {p.cliente_telefone && <p className="text-xs text-on-surface-variant">{p.cliente_telefone}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant max-w-[200px] truncate">{p.endereco_entrega}</td>
                    <td className="px-5 py-4 text-sm font-bold text-on-background">R$ {p.total.toFixed(2).replace('.', ',')}</td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">{p.forma_pagamento ? formaPagamentoLabel[p.forma_pagamento] : '-'}</td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">{(p.entregadores as { nome?: string } | null)?.nome || '-'}</td>
                    <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-4 text-xs text-on-surface-variant">
                      {new Date(p.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtrados.length === 0 && (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-3 block">inbox</span>
                <p className="text-sm">Nenhum pedido encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
