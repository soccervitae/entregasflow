'use client'

import { useState } from 'react'
import { Pedido, Entregador, StatusPedido } from '@/types'
import StatusBadge from './StatusBadge'
import SeletorEntregador from './SeletorEntregador'
import { createClient } from '@/lib/supabase/client'

const formaPagamentoLabel: Record<string, string> = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
}

const proximoStatus: Partial<Record<StatusPedido, StatusPedido>> = {
  novo: 'em_preparo',
  em_preparo: 'pronto',
}

interface PedidoDetalheProps {
  pedido: Pedido
  entregadores: Entregador[]
  onUpdate: () => void
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void
}

export default function PedidoDetalhe({ pedido, entregadores, onUpdate, onToast }: PedidoDetalheProps) {
  const [entregadorSelecionado, setEntregadorSelecionado] = useState<string | null>(pedido.entregador_id)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const avancarStatus = async () => {
    const next = proximoStatus[pedido.status]
    if (!next) return
    setLoading(true)
    const { error } = await supabase.from('pedidos').update({ status: next }).eq('id', pedido.id)
    setLoading(false)
    if (error) { onToast('Erro ao atualizar status', 'error'); return }
    onToast(`Pedido #${pedido.numero} → ${next.replace('_', ' ')}`, 'success')
    onUpdate()
  }

  const despachar = async () => {
    if (!entregadorSelecionado) { onToast('Selecione um entregador', 'error'); return }

    const jaEmRota = await supabase
      .from('pedidos')
      .select('id')
      .eq('entregador_id', entregadorSelecionado)
      .eq('status', 'em_rota')
      .single()

    if (jaEmRota.data) { onToast('Este entregador já possui uma entrega em rota', 'error'); return }

    setLoading(true)
    const { error: e1 } = await supabase
      .from('pedidos')
      .update({ status: 'em_rota', entregador_id: entregadorSelecionado })
      .eq('id', pedido.id)

    if (!e1) {
      await supabase.from('entregadores').update({ status: 'em_rota' }).eq('id', entregadorSelecionado)
    }

    setLoading(false)
    if (e1) { onToast('Erro ao despachar pedido', 'error'); return }
    onToast(`Pedido #${pedido.numero} despachado!`, 'success')
    onUpdate()
  }

  const cancelar = async () => {
    if (!confirm('Cancelar este pedido?')) return
    setLoading(true)
    await supabase.from('pedidos').update({ status: 'cancelado' }).eq('id', pedido.id)
    setLoading(false)
    onToast('Pedido cancelado', 'info')
    onUpdate()
  }

  const entregadoresLivres = entregadores.filter((e) => e.status === 'livre')
  const podDespachar = pedido.status === 'pronto'
  const next = proximoStatus[pedido.status]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-outline-variant">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-xs font-bold text-on-surface-variant">PEDIDO #{pedido.numero}</p>
            <h3 className="text-lg font-bold text-on-background mt-0.5">{pedido.cliente_nome}</h3>
          </div>
          <StatusBadge status={pedido.status} />
        </div>
        {pedido.cliente_telefone && (
          <p className="text-sm text-on-surface-variant">{pedido.cliente_telefone}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Endereço */}
        <div className="p-5 border-b border-outline-variant">
          <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Endereço</p>
          <p className="text-sm text-on-background">{pedido.endereco_entrega}</p>
          {pedido.bairro && <p className="text-sm text-on-surface-variant">{pedido.bairro}</p>}
          <a
            href={`https://www.google.com/maps/search/?q=${encodeURIComponent(pedido.endereco_entrega + ' ' + (pedido.bairro || ''))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-on-tertiary-container mt-2 hover:underline"
          >
            <span className="material-symbols-outlined text-[14px]">map</span>
            Ver no mapa
          </a>
        </div>

        {/* Itens */}
        <div className="p-5 border-b border-outline-variant">
          <p className="text-xs font-bold text-on-surface-variant uppercase mb-3">Itens do Pedido</p>
          <div className="space-y-2">
            {pedido.itens.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-on-background">
                  {item.quantidade}x {item.nome}
                </span>
                <span className="text-on-surface-variant font-medium">
                  R$ {(item.quantidade * item.valor_unitario).toFixed(2).replace('.', ',')}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-outline-variant space-y-1">
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span>R$ {pedido.subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Taxa de entrega</span>
              <span>R$ {pedido.taxa_entrega.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-on-background pt-1">
              <span>Total</span>
              <span>R$ {pedido.total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>

        {/* Pagamento */}
        <div className="p-5 border-b border-outline-variant">
          <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Pagamento</p>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">payments</span>
            <span className="text-sm text-on-background">
              {pedido.forma_pagamento ? formaPagamentoLabel[pedido.forma_pagamento] : 'Não informado'}
            </span>
          </div>
          {pedido.pago_antecipado ? (
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[12px]">check_circle</span>
              Pago antecipado
            </span>
          ) : (
            <span className="text-xs text-on-surface-variant">Cobrar na entrega</span>
          )}
          {pedido.troco_para && !pedido.pago_antecipado && (
            <p className="text-sm text-secondary mt-1">
              Troco para R$ {pedido.troco_para.toFixed(2).replace('.', ',')}
            </p>
          )}
        </div>

        {/* Observação */}
        {pedido.observacao && (
          <div className="p-5 border-b border-outline-variant">
            <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Observação</p>
            <p className="text-sm text-on-background">{pedido.observacao}</p>
          </div>
        )}

        {/* Seletor de entregador */}
        {podDespachar && (
          <div className="p-5">
            <p className="text-xs font-bold text-on-surface-variant uppercase mb-3">Selecionar Entregador</p>
            <SeletorEntregador
              entregadores={entregadoresLivres}
              selecionado={entregadorSelecionado}
              onChange={setEntregadorSelecionado}
            />
          </div>
        )}

        {pedido.status === 'em_rota' && pedido.entregadores && (
          <div className="p-5">
            <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Entregador</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-on-background">{pedido.entregadores.nome}</p>
                <p className="text-xs text-on-surface-variant">{pedido.entregadores.telefone}</p>
              </div>
              <span className="ml-auto flex items-center gap-1 bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                Em rota
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
        <div className="p-4 border-t border-outline-variant space-y-2">
          {podDespachar && (
            <button
              onClick={despachar}
              disabled={loading || !entregadorSelecionado}
              className="w-full flex items-center justify-center gap-2 bg-secondary-container text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              {loading ? 'Despachando...' : 'Despachar Pedido'}
            </button>
          )}
          {next && (
            <button
              onClick={avancarStatus}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-container text-on-primary-container py-3 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              {loading ? 'Salvando...' : `Avançar → ${next.replace('_', ' ')}`}
            </button>
          )}
          <button
            onClick={cancelar}
            disabled={loading}
            className="w-full text-error text-sm py-2 hover:bg-error-container/30 rounded-xl transition-colors"
          >
            Cancelar pedido
          </button>
        </div>
      )}
    </div>
  )
}
