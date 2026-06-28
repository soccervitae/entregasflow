'use client'

import { useState } from 'react'
import { Pedido } from '@/types'
import { createClient } from '@/lib/supabase/client'

const formaPagamentoLabel: Record<string, string> = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão Créd.',
  cartao_debito: 'Cartão Déb.',
}

interface CorridaCardProps {
  pedido: Pedido
  entregadorId: string
  onUpdate: () => void
  onToast: (msg: string, type?: 'success' | 'error') => void
}

export default function CorridaCard({ pedido, entregadorId, onUpdate, onToast }: CorridaCardProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const confirmarEntrega = async () => {
    setLoading(true)
    const now = new Date().toISOString()

    const { error } = await supabase
      .from('pedidos')
      .update({ status: 'entregue', entregue_em: now })
      .eq('id', pedido.id)

    if (!error) {
      await supabase.from('ganhos_entregadores').insert({
        entregador_id: entregadorId,
        pedido_id: pedido.id,
        valor: pedido.taxa_entrega,
        data: now.split('T')[0],
      })
      await supabase.from('entregadores').update({ status: 'livre' }).eq('id', entregadorId)
    }

    setLoading(false)
    if (error) { onToast('Erro ao confirmar entrega', 'error'); return }
    onToast('Entrega confirmada! +R$ ' + pedido.taxa_entrega.toFixed(2).replace('.', ','), 'success')
    onUpdate()
  }

  const precisaCobranca = !pedido.pago_antecipado

  return (
    <div className="mx-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs font-bold text-secondary-container uppercase">Pedido #{pedido.numero}</span>
            <p className="font-bold text-on-background text-base mt-0.5">{pedido.cliente_nome}</p>
          </div>
          <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full font-semibold">Em rota</span>
        </div>

        <div className="flex items-start gap-2 mb-2">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5">location_on</span>
          <div>
            <p className="text-sm text-on-background">{pedido.endereco_entrega}</p>
            {pedido.bairro && <p className="text-xs text-on-surface-variant">{pedido.bairro}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 mt-3">
          <span className="flex items-center gap-1 bg-surface-container text-on-surface-variant text-xs px-2.5 py-1 rounded-full">
            <span className="material-symbols-outlined text-[14px]">payments</span>
            {pedido.forma_pagamento ? formaPagamentoLabel[pedido.forma_pagamento] : 'N/A'}
          </span>
          <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold">
            Taxa: R$ {pedido.taxa_entrega.toFixed(2).replace('.', ',')}
          </span>
          {precisaCobranca && (
            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-semibold">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              Cobrar R$ {pedido.total.toFixed(2).replace('.', ',')}
            </span>
          )}
          {pedido.troco_para && !pedido.pago_antecipado && (
            <span className="flex items-center gap-1 bg-secondary-fixed text-secondary text-xs px-2.5 py-1 rounded-full font-semibold">
              Troco para R$ {pedido.troco_para.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <a
            href={`https://www.google.com/maps/search/?q=${encodeURIComponent(pedido.endereco_entrega + ' ' + (pedido.bairro || ''))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-outline-variant text-on-surface-variant text-sm font-semibold hover:bg-surface-container transition-colors min-h-[48px]"
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            Ver no mapa
          </a>
          <button
            onClick={confirmarEntrega}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 min-h-[48px]"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {loading ? 'Confirmando...' : 'Confirmar Entrega'}
          </button>
        </div>
      </div>
    </div>
  )
}
