'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pedido } from '@/types'

export function usePedidosRealtime(estabelecimentoId: string | null) {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [novoPedidoId, setNovoPedidoId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchPedidos = useCallback(async () => {
    if (!estabelecimentoId) return
    const { data } = await supabase
      .from('pedidos')
      .select('*, entregadores(*)')
      .eq('estabelecimento_id', estabelecimentoId)
      .order('criado_em', { ascending: false })
    setLoading(false)
    if (data) setPedidos(data as Pedido[])
  }, [estabelecimentoId])

  useEffect(() => {
    fetchPedidos()
  }, [fetchPedidos])

  useEffect(() => {
    if (!estabelecimentoId) return

    const channel = supabase
      .channel('pedidos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNovoPedidoId((payload.new as Pedido).id)
          try { new Audio('/notification.mp3').play() } catch {}
        }
        fetchPedidos()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [estabelecimentoId, fetchPedidos])

  return { pedidos, loading, novoPedidoId, refetch: fetchPedidos }
}
