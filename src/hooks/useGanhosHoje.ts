'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useGanhosHoje(entregadorId: string | null) {
  const [total, setTotal] = useState(0)
  const [quantidade, setQuantidade] = useState(0)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!entregadorId) return
    const hoje = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('ganhos_entregadores')
      .select('valor')
      .eq('entregador_id', entregadorId)
      .eq('data', hoje)

    if (data) {
      setQuantidade(data.length)
      setTotal(data.reduce((acc, g) => acc + g.valor, 0))
    }
  }, [entregadorId])

  useEffect(() => { fetch() }, [fetch])

  return { total, quantidade, refetch: fetch }
}
