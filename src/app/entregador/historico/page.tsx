'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Pedido } from '@/types'
import Spinner from '@/components/ui/Spinner'

interface GrupoData {
  data: string
  pedidos: Pedido[]
  total: number
}

export default function HistoricoPage() {
  const [grupos, setGrupos] = useState<GrupoData[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/entregador'); return }

      const { data: ent } = await supabase.from('entregadores').select('id').eq('user_id', user.id).single()
      if (!ent) { router.push('/entregador'); return }

      const { data: ganhos } = await supabase
        .from('ganhos_entregadores')
        .select('*, pedidos(numero, endereco_entrega, bairro, taxa_entrega, entregue_em, criado_em, cliente_nome)')
        .eq('entregador_id', ent.id)
        .order('criado_em', { ascending: false })
        .limit(100)

      setLoading(false)
      if (!ganhos) return

      const byDate: Record<string, { pedidos: Pedido[]; total: number }> = {}
      ganhos.forEach((g) => {
        const date = g.data
        if (!byDate[date]) byDate[date] = { pedidos: [], total: 0 }
        byDate[date].pedidos.push((g.pedidos as unknown as Pedido))
        byDate[date].total += g.valor
      })

      setGrupos(Object.entries(byDate).map(([data, v]) => ({ data, ...v })))
    }
    load()
  }, [])

  const formatData = (d: string) => {
    const hoje = new Date().toISOString().split('T')[0]
    const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (d === hoje) return 'Hoje'
    if (d === ontem) return 'Ontem'
    return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
  }

  const totalGeral = grupos.reduce((acc, g) => acc + g.total, 0)
  const totalEntregas = grupos.reduce((acc, g) => acc + g.pedidos.length, 0)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-on-background px-4 pt-6 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-surface-variant text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-surface-container-lowest text-xl font-bold">Histórico</h1>
            <p className="text-on-primary-container text-xs">Suas entregas e ganhos</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary-container/20 rounded-xl p-4">
            <p className="text-on-primary-container text-xs mb-1">Total ganho</p>
            <p className="text-surface-container-lowest text-xl font-bold">R$ {totalGeral.toFixed(2).replace('.', ',')}</p>
          </div>
          <div className="bg-primary-container/20 rounded-xl p-4">
            <p className="text-on-primary-container text-xs mb-1">Total entregas</p>
            <p className="text-surface-container-lowest text-xl font-bold">{totalEntregas}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-background p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : grupos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-3 opacity-20">history</span>
            <p className="font-medium opacity-50">Nenhuma entrega ainda</p>
          </div>
        ) : (
          grupos.map((grupo) => (
            <div key={grupo.data} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
              <div className="px-4 py-3 bg-surface-container-low flex justify-between items-center">
                <p className="font-semibold text-on-background text-sm">{formatData(grupo.data)}</p>
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant">{grupo.pedidos.length} entregas</p>
                  <p className="text-sm font-bold text-green-600">R$ {grupo.total.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {grupo.pedidos.map((p, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-background">
                        {p.cliente_nome || `Pedido #${p.numero}`}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">{p.endereco_entrega}</p>
                    </div>
                    <span className="text-sm font-bold text-green-600 ml-3">+R$ {p.taxa_entrega?.toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
