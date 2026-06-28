import { StatusPedido } from '@/types'

const config: Record<StatusPedido, { label: string; classes: string; dot: string }> = {
  novo: {
    label: 'Novo',
    classes: 'bg-surface-container text-on-surface-variant border border-outline-variant',
    dot: 'bg-outline',
  },
  em_preparo: {
    label: 'Em Preparo',
    classes: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500 animate-pulse',
  },
  pronto: {
    label: 'Pronto',
    classes: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500 animate-pulse',
  },
  em_rota: {
    label: 'Em Rota',
    classes: 'bg-purple-50 text-purple-700 border border-purple-200',
    dot: 'bg-purple-500 animate-pulse',
  },
  entregue: {
    label: 'Entregue',
    classes: 'bg-green-50 text-green-700 border border-green-200',
    dot: 'bg-green-500',
  },
  cancelado: {
    label: 'Cancelado',
    classes: 'bg-error-container text-on-error-container border border-error/20',
    dot: 'bg-error',
  },
}

export default function StatusBadge({ status }: { status: StatusPedido }) {
  const { label, classes, dot } = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
