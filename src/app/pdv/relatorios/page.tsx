'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pedido, Entregador, FormaPagamento } from '@/types'
import Spinner from '@/components/ui/Spinner'

type Periodo = 'hoje' | 'semana' | 'mes'

const getRange = (p: Periodo) => {
  const now = new Date()
  const inicio = new Date()
  if (p === 'semana') inicio.setDate(now.getDate() - 7)
  else if (p === 'mes') inicio.setDate(now.getDate() - 30)
  else inicio.setHours(0, 0, 0, 0)
  return inicio.toISOString()
}

const formaPagamentoLabel: Record<FormaPagamento, string> = {
  pix: 'PIX', dinheiro: 'Dinheiro', cartao_credito: 'Cartão Créd.', cartao_debito: 'Cartão Déb.',
}

const formaColors: Record<FormaPagamento, string> = {
  pix: '#008cc7', dinheiro: '#16a34a', cartao_credito: '#9d4300', cartao_debito: '#7c3aed',
}

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState<Periodo>('hoje')
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [entregadores, setEntregadores] = useState<Entregador[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: est } = await supabase.from('estabelecimentos').select('id').eq('owner_id', user.id).single()
      if (!est) return

      const desde = getRange(periodo)
      const [{ data: peds }, { data: ents }] = await Promise.all([
        supabase.from('pedidos').select('*').eq('estabelecimento_id', est.id).gte('criado_em', desde),
        supabase.from('entregadores').select('*').eq('estabelecimento_id', est.id),
      ])
      setLoading(false)
      if (peds) setPedidos(peds as Pedido[])
      if (ents) setEntregadores(ents as Entregador[])
    }
    load()
  }, [periodo])

  const entregues = pedidos.filter(p => p.status === 'entregue')
  const totalPedidos = pedidos.length
  const totalValor = pedidos.reduce((acc, p) => acc + p.total, 0)
  const ticketMedio = totalPedidos > 0 ? totalValor / totalPedidos : 0

  const tempoMedioMs = entregues
    .filter(p => p.entregue_em && p.criado_em)
    .reduce((acc, p, _, arr) => acc + (new Date(p.entregue_em!).getTime() - new Date(p.criado_em).getTime()) / arr.length, 0)
  const tempoMedioMin = Math.round(tempoMedioMs / 60000)

  // Pedidos por entregador
  const porEntregador = entregadores.map(e => ({
    nome: e.nome,
    qtd: pedidos.filter(p => p.entregador_id === e.id && p.status === 'entregue').length,
    ganhos: pedidos.filter(p => p.entregador_id === e.id && p.status === 'entregue').reduce((acc, p) => acc + p.taxa_entrega, 0),
  })).filter(e => e.qtd > 0).sort((a, b) => b.qtd - a.qtd)

  // Por forma de pagamento
  const porPagamento = (['pix', 'dinheiro', 'cartao_credito', 'cartao_debito'] as FormaPagamento[]).map(fp => ({
    forma: fp,
    qtd: pedidos.filter(p => p.forma_pagamento === fp).length,
    valor: pedidos.filter(p => p.forma_pagamento === fp).reduce((acc, p) => acc + p.total, 0),
  })).filter(f => f.qtd > 0)

  const totalPorPagamento = porPagamento.reduce((acc, f) => acc + f.qtd, 0)

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-6">
        <div>
          <h2 className="text-lg font-bold text-on-background">Relatórios de Performance</h2>
          <p className="text-xs text-on-surface-variant">Métricas do período selecionado</p>
        </div>
        <div className="flex gap-1 bg-surface-container-low rounded-xl p-1">
          {([['hoje', 'Hoje'], ['semana', '7 dias'], ['mes', '30 dias']] as [Periodo, string][]).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setPeriodo(v)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                periodo === v ? 'bg-surface-container-lowest text-on-background shadow-sm' : 'text-on-surface-variant hover:text-on-background'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total de Pedidos', value: totalPedidos, icon: 'receipt_long', color: 'border-primary-container' },
                { label: 'Faturamento Total', value: `R$ ${totalValor.toFixed(2).replace('.', ',')}`, icon: 'payments', color: 'border-green-500' },
                { label: 'Ticket Médio', value: `R$ ${ticketMedio.toFixed(2).replace('.', ',')}`, icon: 'trending_up', color: 'border-secondary-container' },
                { label: 'Tempo Médio', value: entregues.length ? `${tempoMedioMin} min` : '-', icon: 'schedule', color: 'border-on-tertiary-container' },
              ].map((kpi) => (
                <div key={kpi.label} className={`bg-surface-container-lowest rounded-xl p-5 border-l-4 ${kpi.color} shadow-sm`}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs text-on-surface-variant uppercase font-bold">{kpi.label}</p>
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{kpi.icon}</span>
                  </div>
                  <p className="text-2xl font-bold text-on-background">{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ranking entregadores */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-5">
                <h3 className="font-semibold text-on-background mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-secondary-container">leaderboard</span>
                  Ranking de Entregadores
                </h3>
                {porEntregador.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-6">Sem dados para o período</p>
                ) : (
                  <div className="space-y-3">
                    {porEntregador.map((e, i) => (
                      <div key={e.nome} className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-surface-container text-on-surface-variant' : 'bg-surface-container-low text-on-surface-variant'
                        }`}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-on-background truncate">{e.nome}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                              <div
                                className="h-full bg-secondary-container rounded-full"
                                style={{ width: `${(e.qtd / (porEntregador[0]?.qtd || 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-on-background">{e.qtd} entregas</p>
                          <p className="text-xs text-green-600">R$ {e.ganhos.toFixed(2).replace('.', ',')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagamentos */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-5">
                <h3 className="font-semibold text-on-background mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-secondary-container">pie_chart</span>
                  Pedidos por Forma de Pagamento
                </h3>
                {porPagamento.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-6">Sem dados para o período</p>
                ) : (
                  <div className="space-y-3">
                    {porPagamento.map((f) => {
                      const pct = Math.round((f.qtd / totalPorPagamento) * 100)
                      return (
                        <div key={f.forma}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-on-background">{formaPagamentoLabel[f.forma]}</span>
                            <span className="text-on-surface-variant">{f.qtd} pedidos ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: formaColors[f.forma] }}
                            />
                          </div>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            R$ {f.valor.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Status breakdown */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-5">
              <h3 className="font-semibold text-on-background mb-4">Distribuição por Status</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {(['novo', 'em_preparo', 'pronto', 'em_rota', 'entregue', 'cancelado'] as const).map(s => {
                  const count = pedidos.filter(p => p.status === s).length
                  const pct = totalPedidos ? Math.round((count / totalPedidos) * 100) : 0
                  return (
                    <div key={s} className="bg-surface-container-low rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-on-background">{count}</p>
                      <p className="text-xs text-on-surface-variant capitalize">{s.replace('_', ' ')}</p>
                      <p className="text-xs text-on-surface-variant">{pct}%</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
