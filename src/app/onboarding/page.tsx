'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Estado { id: number; sigla: string; nome: string }
interface Cidade { id: number; nome: string }

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [nomeEst, setNomeEst] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [tipo, setTipo] = useState<'pizzaria' | 'restaurante' | 'lanchonete' | 'outro'>('restaurante')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [nomeUsuario, setNomeUsuario] = useState('')

  const [estados, setEstados] = useState<Estado[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [loadingCidades, setLoadingCidades] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/cadastro'); return }
      setUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('nome').eq('id', user.id).single()
      if (profile) setNomeUsuario(profile.nome)
    }
    load()

    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(r => r.json())
      .then(setEstados)
  }, [])

  useEffect(() => {
    if (!estado) { setCidades([]); setCidade(''); return }
    setLoadingCidades(true)
    setCidade('')
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then(data => { setCidades(data); setLoadingCidades(false) })
  }, [estado])

  const handleSalvar = async () => {
    if (!nomeEst.trim()) { setErro('Informe o nome do estabelecimento.'); return }
    if (!estado) { setErro('Selecione o estado.'); return }
    if (!cidade) { setErro('Selecione a cidade.'); return }
    if (!userId) return

    setLoading(true)
    setErro('')

    const { data: est, error } = await supabase
      .from('estabelecimentos')
      .insert({ nome: nomeEst, telefone, endereco, estado, cidade, owner_id: userId, status: 'aberto' })
      .select('id')
      .single()

    if (error) {
      setLoading(false)
      setErro('Erro ao salvar estabelecimento. Tente novamente.')
      return
    }

    await supabase.from('profiles').update({ estabelecimento_id: est.id }).eq('id', userId)
    setLoading(false)
    router.push('/pdv')
  }

  const tiposEstabelecimento = [
    { value: 'restaurante', label: 'Restaurante', icon: 'restaurant' },
    { value: 'pizzaria', label: 'Pizzaria', icon: 'local_pizza' },
    { value: 'lanchonete', label: 'Lanchonete', icon: 'lunch_dining' },
    { value: 'outro', label: 'Outro', icon: 'storefront' },
  ] as const

  const selectClass = "w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container appearance-none"

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[560px]">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white text-3xl">store</span>
          </div>
          <h1 className="text-2xl font-bold text-on-background">
            {nomeUsuario ? `Olá, ${nomeUsuario}!` : 'Novo estabelecimento'}
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Cadastre um estabelecimento para começar a gerenciar pedidos.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                step >= s ? 'bg-secondary-container text-white' : 'bg-surface-container text-on-surface-variant'
              }`}>
                {step > s ? <span className="material-symbols-outlined text-[16px]">check</span> : s}
              </div>
              <span className={`text-xs font-semibold ${step >= s ? 'text-on-background' : 'text-on-surface-variant'}`}>
                {s === 1 ? 'Tipo' : 'Dados'}
              </span>
              {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-secondary-container' : 'bg-outline-variant'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-6">

          {step === 1 && (
            <div>
              <h2 className="font-bold text-on-background text-lg mb-1">Que tipo de estabelecimento é esse?</h2>
              <p className="text-on-surface-variant text-sm mb-6">Isso nos ajuda a personalizar a experiência.</p>
              <div className="grid grid-cols-2 gap-3">
                {tiposEstabelecimento.map((t) => (
                  <button key={t.value} onClick={() => setTipo(t.value)}
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                      tipo === t.value ? 'border-secondary-container bg-secondary-container/5' : 'border-outline-variant hover:border-outline'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-3xl ${tipo === t.value ? 'text-secondary-container' : 'text-on-surface-variant'}`}>
                      {t.icon}
                    </span>
                    <span className={`text-sm font-semibold ${tipo === t.value ? 'text-secondary-container' : 'text-on-surface-variant'}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)}
                className="w-full mt-6 bg-secondary-container text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Continuar
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-bold text-on-background text-lg mb-1">Dados do estabelecimento</h2>
              <p className="text-on-surface-variant text-sm mb-6">Você poderá editar essas informações depois em Configurações.</p>

              {erro && (
                <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {erro}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Nome do estabelecimento *</label>
                  <input type="text" value={nomeEst} onChange={(e) => setNomeEst(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                    placeholder="Ex: Pizzaria do João" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Telefone</label>
                  <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                    placeholder="(11) 9 9999-9999" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Endereço</label>
                  <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                    placeholder="Rua, número, bairro" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Estado *</label>
                  <div className="relative">
                    <select value={estado} onChange={(e) => setEstado(e.target.value)} className={selectClass}>
                      <option value="">Selecione o estado</option>
                      {estados.map((e) => (
                        <option key={e.id} value={e.sigla}>{e.nome}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Cidade *</label>
                  <div className="relative">
                    <select value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={!estado || loadingCidades} className={selectClass + (!estado ? ' opacity-50 cursor-not-allowed' : '')}>
                      <option value="">
                        {!estado ? 'Selecione o estado primeiro' : loadingCidades ? 'Carregando cidades...' : 'Selecione a cidade'}
                      </option>
                      {cidades.map((c) => (
                        <option key={c.id} value={c.nome}>{c.nome}</option>
                      ))}
                    </select>
                    {loadingCidades
                      ? <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-outline-variant border-t-secondary-container rounded-full animate-spin" />
                      : <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">expand_more</span>
                    }
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)}
                  className="flex items-center gap-1 px-4 py-3 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-semibold hover:border-outline transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Voltar
                </button>
                <button onClick={handleSalvar} disabled={loading}
                  className="flex-1 bg-secondary-container text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span className="material-symbols-outlined text-[18px]">check_circle</span> Concluir cadastro</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
