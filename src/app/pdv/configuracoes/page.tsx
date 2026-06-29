'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Toast from '@/components/ui/Toast'

interface Estado { id: number; sigla: string; nome: string }
interface Cidade { id: number; nome: string }
interface TaxaEntrega { id: string; cidade: string; bairro: string; valor: number }

export default function ConfiguracoesPage() {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidadesSelecionadas, setCidadesSelecionadas] = useState<string[]>([])
  const [status, setStatus] = useState<'aberto' | 'fechado'>('aberto')
  const [estado, setEstado] = useState('')
  const [estados, setEstados] = useState<Estado[]>([])
  const [listaCidades, setListaCidades] = useState<Cidade[]>([])
  const [loadingCidades, setLoadingCidades] = useState(false)
  const [buscaCidade, setBuscaCidade] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [estId, setEstId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [taxas, setTaxas] = useState<TaxaEntrega[]>([])
  const [cidadeTaxa, setCidadeTaxa] = useState('')
  const [novoBairro, setNovoBairro] = useState('')
  const [novoValor, setNovoValor] = useState('')
  const [savingTaxa, setSavingTaxa] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('estabelecimentos').select('*').eq('owner_id', user.id).single()
      setLoading(false)
      if (data) {
        setEstId(data.id)
        setNome(data.nome || '')
        setTelefone(data.telefone || '')
        setEndereco(data.endereco || '')
        setCidadesSelecionadas(data.cidades || (data.cidade ? [data.cidade] : []))
        setStatus(data.status || 'aberto')
        setLogoUrl(data.logo_url || null)
        setEstado(data.estado || '')
        const { data: taxasData } = await supabase
          .from('taxas_entrega')
          .select('id, cidade, bairro, valor')
          .eq('estabelecimento_id', data.id)
          .order('cidade')
          .order('bairro')
        if (taxasData) setTaxas(taxasData)
      }
    }
    load()

    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(r => r.json())
      .then(setEstados)
  }, [])

  useEffect(() => {
    if (!estado) { setListaCidades([]); return }
    setLoadingCidades(true)
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then(data => { setListaCidades(data); setLoadingCidades(false) })
  }, [estado])

  const toggleCidade = (nome: string) => {
    setCidadesSelecionadas(prev => prev.includes(nome) ? prev.filter(c => c !== nome) : [...prev, nome])
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !estId) return

    setLogoPreview(URL.createObjectURL(file))
    setUploadingLogo(true)

    const ext = file.name.split('.').pop()
    const path = `${estId}/logo.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setToast({ msg: 'Erro ao enviar imagem', type: 'error' })
      setUploadingLogo(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)

    const { error: updateError } = await supabase
      .from('estabelecimentos')
      .update({ logo_url: publicUrl })
      .eq('id', estId)

    setUploadingLogo(false)

    if (updateError) {
      setToast({ msg: 'Erro ao salvar logo', type: 'error' })
      return
    }

    setLogoUrl(publicUrl)
    setToast({ msg: 'Logo atualizada!', type: 'success' })
  }

  const salvar = async () => {
    if (!estId) return
    setSaving(true)
    const { error } = await supabase
      .from('estabelecimentos')
      .update({ nome, telefone, endereco, estado, cidade: cidadesSelecionadas[0] || null, cidades: cidadesSelecionadas, status })
      .eq('id', estId)
    setSaving(false)
    if (error) { setToast({ msg: 'Erro ao salvar', type: 'error' }); return }
    setToast({ msg: 'Configurações salvas!', type: 'success' })
  }

  const adicionarTaxa = async () => {
    if (!cidadeTaxa || !novoBairro.trim() || !novoValor || !estId) return
    setSavingTaxa(true)
    const valor = parseFloat(novoValor.replace(',', '.'))
    const { data, error } = await supabase
      .from('taxas_entrega')
      .insert({ estabelecimento_id: estId, cidade: cidadeTaxa, bairro: novoBairro.trim(), valor })
      .select('id, cidade, bairro, valor')
      .single()
    setSavingTaxa(false)
    if (error) { setToast({ msg: 'Erro ao salvar taxa', type: 'error' }); return }
    setTaxas(prev => [...prev, data].sort((a, b) => a.cidade.localeCompare(b.cidade) || a.bairro.localeCompare(b.bairro)))
    setNovoBairro('')
    setNovoValor('')
  }

  const removerTaxa = async (id: string) => {
    await supabase.from('taxas_entrega').delete().eq('id', id)
    setTaxas(prev => prev.filter(t => t.id !== id))
  }

  const logoSrc = logoPreview || logoUrl

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm flex items-center justify-between h-16 px-6">
        <div>
          <h2 className="text-lg font-bold text-on-background">Configurações</h2>
          <p className="text-xs text-on-surface-variant">Dados do estabelecimento</p>
        </div>
        <button
          onClick={salvar}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-secondary-container text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
          Salvar Alterações
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-outline-variant border-t-secondary-container rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">

            {/* Logo */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-6">
              <h3 className="font-semibold text-on-background mb-4">Logo do Estabelecimento</h3>
              <div className="flex items-center gap-5">
                <div className="w-24 h-24 rounded-2xl bg-surface-container flex items-center justify-center overflow-hidden flex-shrink-0 border border-outline-variant">
                  {logoSrc ? (
                    <img src={logoSrc} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-4xl">store</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant mb-3">PNG, JPG ou WebP. Máximo 2MB.</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold text-on-background hover:border-secondary-container hover:text-secondary-container transition-all disabled:opacity-50"
                  >
                    {uploadingLogo ? (
                      <div className="w-4 h-4 border-2 border-outline-variant border-t-secondary-container rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">upload</span>
                    )}
                    {uploadingLogo ? 'Enviando...' : logoSrc ? 'Trocar logo' : 'Enviar logo'}
                  </button>
                </div>
              </div>
            </div>

            {/* Informações Básicas */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-6">
              <h3 className="font-semibold text-on-background mb-4">Informações Básicas</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Nome do Estabelecimento</label>
                  <input value={nome} onChange={(e) => setNome(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                    placeholder="Nome do seu restaurante" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Telefone</label>
                  <input value={telefone} onChange={(e) => setTelefone(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                    placeholder="(11) 9 9999-9999" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Endereço</label>
                  <input value={endereco} onChange={(e) => setEndereco(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                    placeholder="Rua, número, bairro" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Estado</label>
                  <div className="relative">
                    <select value={estado} onChange={(e) => { setEstado(e.target.value); setCidadesSelecionadas([]); setBuscaCidade('') }}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container appearance-none">
                      <option value="">Selecione o estado</option>
                      {estados.map((e) => <option key={e.id} value={e.sigla}>{e.nome}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">
                    Cidades de atuação {cidadesSelecionadas.length > 0 && <span className="text-secondary-container normal-case font-normal">({cidadesSelecionadas.length} selecionada{cidadesSelecionadas.length > 1 ? 's' : ''})</span>}
                  </label>
                  {cidadesSelecionadas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {cidadesSelecionadas.map(c => (
                        <span key={c} className="flex items-center gap-1 px-2.5 py-1 bg-secondary-container/15 text-secondary-container text-xs font-semibold rounded-lg">
                          {c}
                          <button onClick={() => toggleCidade(c)} className="hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {!estado ? (
                    <p className="text-xs text-on-surface-variant py-2">Selecione o estado primeiro.</p>
                  ) : loadingCidades ? (
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-4 h-4 border-2 border-outline-variant border-t-secondary-container rounded-full animate-spin" />
                      <span className="text-xs text-on-surface-variant">Carregando cidades...</span>
                    </div>
                  ) : (
                    <>
                      <input value={buscaCidade} onChange={(e) => setBuscaCidade(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container mb-2"
                        placeholder="Buscar cidade..." />
                      <div className="max-h-44 overflow-y-auto rounded-xl border border-outline-variant divide-y divide-outline-variant/50">
                        {listaCidades.filter(c => c.nome.toLowerCase().includes(buscaCidade.toLowerCase())).map(c => (
                          <button key={c.id} onClick={() => toggleCidade(c.nome)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                              cidadesSelecionadas.includes(c.nome)
                                ? 'bg-secondary-container/10 text-secondary-container font-semibold'
                                : 'text-on-background hover:bg-surface-container'
                            }`}
                          >
                            {c.nome}
                            {cidadesSelecionadas.includes(c.nome) && <span className="material-symbols-outlined text-[18px]">check</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Taxas de Entrega */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-6">
              <h3 className="font-semibold text-on-background mb-1">Taxas de Entrega por Bairro</h3>
              <p className="text-xs text-on-surface-variant mb-4">Selecione a cidade e cadastre a taxa de cada bairro.</p>

              {/* Seletor de cidade */}
              <div className="relative mb-4">
                <select
                  value={cidadeTaxa}
                  onChange={(e) => { setCidadeTaxa(e.target.value); setNovoBairro(''); setNovoValor('') }}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container appearance-none"
                >
                  <option value="">Selecione a cidade</option>
                  {cidadesSelecionadas.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">expand_more</span>
              </div>

              {cidadeTaxa && (
                <>
                  {/* Lista de bairros da cidade selecionada */}
                  {taxas.filter(t => t.cidade === cidadeTaxa).length > 0 ? (
                    <div className="rounded-xl border border-outline-variant divide-y divide-outline-variant/50 mb-4">
                      {taxas.filter(t => t.cidade === cidadeTaxa).map(t => (
                        <div key={t.id} className="flex items-center justify-between px-4 py-3">
                          <span className="text-sm text-on-background font-medium">{t.bairro}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-secondary-container">
                              R$ {t.valor.toFixed(2).replace('.', ',')}
                            </span>
                            <button onClick={() => removerTaxa(t.id)} className="text-error/50 hover:text-error transition-colors">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant mb-4">Nenhuma taxa cadastrada para {cidadeTaxa}.</p>
                  )}

                  {/* Adicionar novo bairro */}
                  <div className="flex gap-2">
                    <input
                      value={novoBairro}
                      onChange={(e) => setNovoBairro(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && adicionarTaxa()}
                      className="flex-1 px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                      placeholder="Nome do bairro"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">R$</span>
                      <input
                        type="text" inputMode="decimal"
                        value={novoValor}
                        onChange={(e) => setNovoValor(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && adicionarTaxa()}
                        className="w-24 pl-8 pr-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                        placeholder="0,00"
                      />
                    </div>
                    <button
                      onClick={adicionarTaxa}
                      disabled={savingTaxa || !novoBairro.trim() || !novoValor}
                      className="flex items-center gap-1 px-4 py-2.5 bg-secondary-container text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {savingTaxa
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <span className="material-symbols-outlined text-[18px]">add</span>
                      }
                      Adicionar
                    </button>
                  </div>
                </>
              )}

              {cidadesSelecionadas.length === 0 && (
                <p className="text-xs text-on-surface-variant">Cadastre as cidades de atuação primeiro em Informações Básicas.</p>
              )}
            </div>

            {/* Status */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-6">
              <h3 className="font-semibold text-on-background mb-4">Status do Estabelecimento</h3>
              <div className="flex gap-3">
                {(['aberto', 'fechado'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
                      status === s
                        ? s === 'aberto'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-error bg-error-container text-on-error-container'
                        : 'border-outline-variant text-on-surface-variant hover:border-outline'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{s === 'aberto' ? 'store' : 'store_mall_directory'}</span>
                    {s === 'aberto' ? 'Aberto' : 'Fechado'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
