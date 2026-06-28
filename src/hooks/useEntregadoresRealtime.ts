'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Entregador } from '@/types'

export function useEntregadoresRealtime(estabelecimentoId: string | null) {
  const [entregadores, setEntregadores] = useState<Entregador[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchEntregadores = useCallback(async () => {
    if (!estabelecimentoId) return
    const { data } = await supabase
      .from('entregadores')
      .select('*')
      .eq('estabelecimento_id', estabelecimentoId)
      .neq('status', 'inativo')
      .order('nome')
    setLoading(false)
    if (data) setEntregadores(data as Entregador[])
  }, [estabelecimentoId])

  useEffect(() => {
    fetchEntregadores()
  }, [fetchEntregadores])

  useEffect(() => {
    if (!estabelecimentoId) return

    const channel = supabase
      .channel('entregadores-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entregadores' }, () => {
        fetchEntregadores()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [estabelecimentoId, fetchEntregadores])

  return { entregadores, loading, refetch: fetchEntregadores }
}
