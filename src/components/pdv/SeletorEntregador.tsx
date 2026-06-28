'use client'

import { Entregador } from '@/types'

const veiculoIcon: Record<string, string> = {
  moto: 'two_wheeler',
  bike: 'pedal_bike',
  carro: 'directions_car',
  a_pe: 'directions_walk',
}

interface SeletorEntregadorProps {
  entregadores: Entregador[]
  selecionado: string | null
  onChange: (id: string) => void
}

export default function SeletorEntregador({ entregadores, selecionado, onChange }: SeletorEntregadorProps) {
  if (entregadores.length === 0) {
    return (
      <div className="text-center py-6 text-on-surface-variant text-sm">
        <span className="material-symbols-outlined text-4xl mb-2 block">directions_bike</span>
        Nenhum entregador disponível no momento
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entregadores.map((e) => (
        <button
          key={e.id}
          onClick={() => onChange(e.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
            selecionado === e.id
              ? 'border-secondary-container bg-secondary-fixed/30 shadow-sm'
              : 'border-outline-variant/30 hover:border-outline-variant bg-surface-container-lowest'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
              {veiculoIcon[e.veiculo || 'moto']}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-on-background text-sm">{e.nome}</p>
            <p className="text-xs text-on-surface-variant capitalize">{(e.veiculo || 'moto').replace('_', ' ')}</p>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        </button>
      ))}
    </div>
  )
}
