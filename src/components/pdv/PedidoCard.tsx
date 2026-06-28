'use client'

import { Pedido } from '@/types'
import StatusBadge from './StatusBadge'

interface PedidoCardProps {
  pedido: Pedido
  selecionado?: boolean
  onClick: () => void
  novo?: boolean
}

export default function PedidoCard({ pedido, selecionado, onClick, novo }: PedidoCardProps) {
  const time = new Date(pedido.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        selecionado
          ? 'border-primary-container bg-surface-container-low shadow-md'
          : 'border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant hover:shadow-sm'
      } ${novo ? 'animate-pulse border-secondary-container' : ''}`}
    >
      {novo && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-secondary-container animate-ping" />
      )}
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs font-bold text-on-surface-variant">#{pedido.numero}</span>
          <p className="font-semibold text-on-background text-sm mt-0.5">{pedido.cliente_nome}</p>
        </div>
        <StatusBadge status={pedido.status} />
      </div>
      <p className="text-xs text-on-surface-variant line-clamp-1 mb-2">{pedido.endereco_entrega}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-on-background">
          R$ {pedido.total.toFixed(2).replace('.', ',')}
        </span>
        <span className="text-xs text-on-surface-variant">{time}</span>
      </div>
    </div>
  )
}
