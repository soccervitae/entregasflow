'use client'

import { StatusPedido } from '@/types'

const filtros: { value: StatusPedido | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'novo', label: 'Novos' },
  { value: 'em_preparo', label: 'Em Preparo' },
  { value: 'pronto', label: 'Prontos' },
  { value: 'em_rota', label: 'Em Rota' },
  { value: 'entregue', label: 'Entregues' },
  { value: 'cancelado', label: 'Cancelados' },
]

interface FiltroPedidosProps {
  filtroAtivo: StatusPedido | 'todos'
  onChange: (f: StatusPedido | 'todos') => void
}

export default function FiltroPedidos({ filtroAtivo, onChange }: FiltroPedidosProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filtros.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filtroAtivo === f.value
              ? 'bg-primary-container text-on-primary-container shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
