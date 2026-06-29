'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Toast from '@/components/ui/Toast'

interface TaxaEntrega { id: string; cidade: string; bairro: string; valor: number }

export default function TaxasPage() {
  const supabase = createClient()

  const [estId, setEstId] = useState<string | null>(null)
  const [estado, setEstado] = useState('')
  const [cidades, setCidades] = useState<string[]>([])
  const [cidadeAtiva, setCidadeAtiva] = useState('')

  const [taxas, setTaxas] = useState<TaxaEntrega[]>([])
  const [bairrosDisponiveis, setBairrosDisponiveis] = useState<string[]>([])
  const [loadingBairros, setLoadingBairros] = useState(false)
  const [buscaBairro, setBuscaBairro] = useState('')
  const [bairroSelecionado, setBairroSelecionado] = useState('')
  const [novoValor, setNovoValor] = useState('')
  const [savingTaxa, setSavingTaxa] = useState(false)

  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: est } = await supabase
        .from('estabelecimentos')
        .select('id, estado, cidades, cidade')
        .eq('owner_id', user.id)
        .single()

      if (!est) { setLoading(false); return }

      setEstId(est.id)
      setEstado(est.estado || '')
      const listaCidades: string[] = est.cidades || (est.cidade ? [est.cidade] : [])
      setCidades(listaCidades)

      const { data: taxasData } = await supabase
        .from('taxas_entrega')
        .select('id, cidade, bairro, valor')
        .eq('estabelecimento_id', est.id)
        .order('cidade')
        .order('bairro')
      if (taxasData) setTaxas(taxasData)

      if (listaCidades.length > 0) {
        setCidadeAtiva(listaCidades[0])
        carregarBairrosDaCidade(listaCidades[0], est.estado || '')
      }

      setLoading(false)
    }
    load()
  }, [])

  const carregarBairrosDaCidade = async (cidade: string, est: string) => {
    setLoadingBairros(true)
    setBairrosDisponiveis([])
    setBuscaBairro('')
    setBairroSelecionado('')
    setNovoValor('')
    try {
      const res = await fetch(`/api/bairros?cidade=${encodeURIComponent(cidade)}&estado=${encodeURIComponent(est)}`)
      const data = await res.json()
      setBairrosDisponiveis(data.bairros || [])
    } catch {
      setBairrosDisponiveis([])
    }
    setLoadingBairros(false)
  }

  const selecionarCidade = (cidade: string) => {
    setCidadeAtiva(cidade)
    setBairroSelecionado('')
    setNovoValor('')
    carregarBairrosDaCidade(cidade, estado)
  }

  const adicionarTaxa = async () => {
    if (!cidadeAtiva || !bairroSelecionado || !novoValor || !estId) return
    setSavingTaxa(true)
    const valor = parseFloat(novoValor.replace(',', '.'))
    const { data, error } = await supabase
      .from('taxas_entrega')
      .insert({ estabelecimento_id: estId, cidade: cidadeAtiva, bairro: bairroSelecionado, valor })
      .select('id, cidade, bairro, valor')
      .single()
    setSavingTaxa(false)
    if (error) { setToast({ msg: 'Erro ao salvar taxa', type: 'error' }); return }
    setTaxas(prev => [...prev, data].sort((a, b) => a.cidade.localeCompare(b.cidade) || a.bairro.localeCompare(b.bairro)))
    setBairroSelecionado('')
    setNovoValor('')
    setToast({ msg: `Taxa de ${bairroSelecionado} salva!`, type: 'success' })
  }

  const removerTaxa = async (id: string) => {
    await supabase.from('taxas_entrega').delete().eq('id', id)
    setTaxas(prev => prev.filter(t => t.id !== id))
  }

  const taxasDaCidade = taxas.filter(t => t.cidade === cidadeAtiva)
  const bairrosJaCadastrados = new Set(taxasDaCidade.map(t => t.bairro))
  const bairrosFiltrados = bairrosDisponiveis.filter(
    b => b.toLowerCase().includes(buscaBairro.toLowerCase()) && !bairrosJaCadastrados.has(b)
  )

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm flex items-center h-16 px-6">
          <h2 className="text-lg font-bold text-on-background">Taxas de Entrega</h2>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-outline-variant border-t-secondary-container rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm flex items-center justify-between h-16 px-6">
        <div>
          <h2 className="text-lg font-bold text-on-background">Taxas de Entrega</h2>
          <p className="text-xs text-on-surface-variant">Defina o valor da taxa por bairro</p>
        </div>
      </header>

      {cidades.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-4xl">location_city</span>
          </div>
          <div>
            <p className="font-semibold text-on-background mb-1">Nenhuma cidade cadastrada</p>
            <p className="text-sm text-on-surface-variant">Cadastre as cidades de atuação em Configurações primeiro.</p>
          </div>
          <a href="/pdv/configuracoes" className="px-4 py-2 bg-secondary-container text-white rounded-xl text-sm font-semibold hover:opacity-90">
            Ir para Configurações
          </a>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar de cidades */}
          <div className="w-56 border-r border-outline-variant bg-surface-container-lowest flex-shrink-0 overflow-y-auto">
            <div className="p-3">
              <p className="text-xs font-bold text-on-surface-variant uppercase px-2 mb-2">Cidades</p>
              {cidades.map(c => {
                const count = taxas.filter(t => t.cidade === c).length
                return (
                  <button
                    key={c}
                    onClick={() => selecionarCidade(c)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 text-left ${
                      cidadeAtiva === c
                        ? 'bg-secondary-container/15 text-secondary-container'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-background'
                    }`}
                  >
                    <span className="truncate">{c}</span>
                    {count > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-1 ${
                        cidadeAtiva === c ? 'bg-secondary-container text-white' : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 overflow-y-auto p-6">
            {cidadeAtiva && (
              <div className="max-w-2xl space-y-5">

                {/* Taxas já cadastradas */}
                {taxasDaCidade.length > 0 && (
                  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm">
                    <div className="px-5 py-4 border-b border-outline-variant/50">
                      <h3 className="font-semibold text-on-background flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-secondary-container">check_circle</span>
                        Bairros com taxa em {cidadeAtiva}
                      </h3>
                    </div>
                    <div className="divide-y divide-outline-variant/50">
                      {taxasDaCidade.map(t => (
                        <div key={t.id} className="flex items-center justify-between px-5 py-3.5">
                          <span className="text-sm text-on-background font-medium">{t.bairro}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-secondary-container">
                              R$ {t.valor.toFixed(2).replace('.', ',')}
                            </span>
                            <button
                              onClick={() => removerTaxa(t.id)}
                              className="text-error/40 hover:text-error transition-colors"
                              title="Remover taxa"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Adicionar bairro */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm">
                  <div className="px-5 py-4 border-b border-outline-variant/50">
                    <h3 className="font-semibold text-on-background flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-secondary-container">add_location</span>
                      {loadingBairros ? `Buscando bairros de ${cidadeAtiva}...` : `Adicionar bairro em ${cidadeAtiva}`}
                    </h3>
                  </div>

                  <div className="p-5 space-y-4">
                    {loadingBairros ? (
                      <div className="flex items-center gap-3 py-4">
                        <div className="w-5 h-5 border-2 border-outline-variant border-t-secondary-container rounded-full animate-spin" />
                        <span className="text-sm text-on-surface-variant">Buscando bairros no OpenStreetMap...</span>
                      </div>
                    ) : bairrosDisponiveis.length === 0 ? (
                      <p className="text-sm text-on-surface-variant py-2">Nenhum bairro encontrado para esta cidade.</p>
                    ) : (
                      <>
                        <input
                          value={buscaBairro}
                          onChange={(e) => { setBuscaBairro(e.target.value); setBairroSelecionado('') }}
                          className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                          placeholder="Buscar bairro..."
                        />

                        <div className="max-h-64 overflow-y-auto rounded-xl border border-outline-variant divide-y divide-outline-variant/50">
                          {bairrosFiltrados.length === 0 ? (
                            <p className="text-sm text-on-surface-variant px-4 py-3">
                              {buscaBairro ? 'Nenhum bairro encontrado.' : 'Todos os bairros já possuem taxa cadastrada.'}
                            </p>
                          ) : (
                            bairrosFiltrados.map(b => (
                              <button
                                key={b}
                                onClick={() => { setBairroSelecionado(prev => prev === b ? '' : b); setNovoValor('') }}
                                className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                                  bairroSelecionado === b
                                    ? 'bg-secondary-container/10 text-secondary-container font-semibold'
                                    : 'text-on-background hover:bg-surface-container'
                                }`}
                              >
                                {b}
                                {bairroSelecionado === b && (
                                  <span className="material-symbols-outlined text-[18px]">check</span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}

                    {bairroSelecionado && (
                      <div className="flex items-center gap-3 p-4 bg-secondary-container/5 border border-secondary-container/20 rounded-xl">
                        <span className="material-symbols-outlined text-secondary-container text-[20px]">location_on</span>
                        <span className="flex-1 text-sm font-semibold text-on-background">{bairroSelecionado}</span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant font-medium">R$</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={novoValor}
                            onChange={(e) => setNovoValor(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && adicionarTaxa()}
                            autoFocus
                            className="w-32 pl-9 pr-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                            placeholder="0,00"
                          />
                        </div>
                        <button
                          onClick={adicionarTaxa}
                          disabled={savingTaxa || !novoValor}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary-container text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                          {savingTaxa
                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <span className="material-symbols-outlined text-[18px]">save</span>
                          }
                          Salvar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
