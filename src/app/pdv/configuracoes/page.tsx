'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Toast from '@/components/ui/Toast'

interface Estado { id: number; sigla: string; nome: string }
interface Cidade { id: number; nome: string }

export default function ConfiguracoesPage() {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [status, setStatus] = useState<'aberto' | 'fechado'>('aberto')
  const [estado, setEstado] = useState('')
  const [estados, setEstados] = useState<Estado[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [loadingCidades, setLoadingCidades] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [estId, setEstId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
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
        setCidade(data.cidade || '')
        setStatus(data.status || 'aberto')
        setLogoUrl(data.logo_url || null)
        setEstado(data.estado || '')
      }
    }
    load()

    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(r => r.json())
      .then(setEstados)
  }, [])

  useEffect(() => {
    if (!estado) { setCidades([]); return }
    setLoadingCidades(true)
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then(data => { setCidades(data); setLoadingCidades(false) })
  }, [estado])

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
      .update({ nome, telefone, endereco, estado, cidade, status })
      .eq('id', estId)
    setSaving(false)
    if (error) { setToast({ msg: 'Erro ao salvar', type: 'error' }); return }
    setToast({ msg: 'Configurações salvas!', type: 'success' })
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
                    <select value={estado} onChange={(e) => { setEstado(e.target.value); setCidade('') }}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container appearance-none">
                      <option value="">Selecione o estado</option>
                      {estados.map((e) => <option key={e.id} value={e.sigla}>{e.nome}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Cidade</label>
                  <div className="relative">
                    <select value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={!estado || loadingCidades}
                      className={`w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container appearance-none ${!estado ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <option value="">{!estado ? 'Selecione o estado primeiro' : loadingCidades ? 'Carregando...' : 'Selecione a cidade'}</option>
                      {cidades.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                    </select>
                    {loadingCidades
                      ? <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-outline-variant border-t-secondary-container rounded-full animate-spin" />
                      : <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">expand_more</span>
                    }
                  </div>
                </div>
              </div>
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
