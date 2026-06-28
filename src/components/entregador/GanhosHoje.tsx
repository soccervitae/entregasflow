'use client'

interface GanhosHojeProps {
  total: number
  quantidade: number
}

export default function GanhosHoje({ total, quantidade }: GanhosHojeProps) {
  return (
    <div className="bg-gradient-to-r from-on-background to-primary-container rounded-2xl p-5 text-white mx-4">
      <p className="text-xs font-bold uppercase tracking-wider text-on-primary-container mb-3">Ganhos de Hoje</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold">R$ {total.toFixed(2).replace('.', ',')}</p>
          <p className="text-on-primary-container text-sm mt-1">{quantidade} entrega{quantidade !== 1 ? 's' : ''} realizada{quantidade !== 1 ? 's' : ''}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-white material-symbols-filled">payments</span>
        </div>
      </div>
    </div>
  )
}
