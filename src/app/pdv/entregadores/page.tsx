'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Entregador, VeiculoEntregador } from '@/types'
import Modal from '@/components/ui/Modal'
import Toast from '@/components/ui/Toast'
import Spinner from '@/components/ui/Spinner'

const statusConfig = {
  livre: { label: 'Disponível', classes: 'bg-green-50 text-green-700 border border-green-200', dot: 'bg-green-500 animate-pulse' },
  em_rota: { label: 'Em Rota', classes: 'bg-purple-50 text-purple-700 border border-purple-200', dot: 'bg-purple-500 animate-pulse' },
  inativo: { label: 'Inativo', classes: 'bg-surface-container text-on-surface-variant border border-outline-variant', dot: 'bg-outline' },
}

const veiculoIcon: Record<string, string> = { moto: 'two_wheeler', bike: 'pedal_bike', carro: 'directions_car', a_pe: 'directions_walk' }

export default function EntregadoresPage() {
  const [entregadores, setEntregadores] = useState<Entregador[]>([])
  const [loading, setLoading] = useState(true)
  const [estabelecimentoId, setEstabelecimentoId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)
  const [ganhosHoje, setGanhosHoje] = useState<Record<string, { total: number; qtd: number }>>({})

  const [form, setForm] = useState({ nome: '', telefone: '', veiculo: 'moto' as VeiculoEntregador, email: '', senha: '' })
  const supabase = createClient()

  const loadEntregadores = async (estId: string) => {
    const { data } = await supabase
      .from('entregadores')
      .select('*')
      .eq('estabelecimento_id', estId)
      .order('nome')
    setLoading(false)
    if (data) setEntregadores(data as Entregador[])
  }

  const loadGanhos = async (ids: string[]) => {
    if (!ids.length) return
    const hoje = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('ganhos_entregadores')
      .select('entregador_id, valor')
      .in('entregador_id', ids)
      .eq('data', hoje)
    if (!data) return
    const acc: Record<string, { total: number; qtd: number }> = {}
    data.forEach((g) => {
      if (!acc[g.entregador_id]) acc[g.entregador_id] = { total: 0, qtd: 0 }
      acc[g.entregador_id].total += g.valor
      acc[g.entregador_id].qtd += 1
    })
    setGanhosHoje(acc)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('estabelecimentos').select('id').eq('owner_id', user.id).single().then(({ data }) => {
        if (data) { setEstabelecimentoId(data.id); loadEntregadores(data.id) }
      })
    })
  }, [])

  useEffect(() => {
    if (entregadores.length) loadGanhos(entregadores.map(e => e.id))
  }, [entregadores])

  const criarEntregador = async () => {
    if (!estabelecimentoId) return
    setSaving(true)

    let userId: string | null = null
    if (form.email && form.senha) {
      const resp = await fetch('/api/entregadores/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, senha: form.senha }),
      })
      const json = await resp.json()
      userId = json.userId || null
    }

    const { error } = await supabase.from('entregadores').insert({
      estabelecimento_id: estabelecimentoId,
      nome: form.nome,
      telefone: form.telefone || null,
      veiculo: form.veiculo,
      user_id: userId,
      status: 'livre',
    })

    setSaving(false)
    if (error) { setToast({ msg: 'Erro ao criar entregador', type: 'error' }); return }
    setToast({ msg: `${form.nome} adicionado com sucesso!`, type: 'success' })
    setShowModal(false)
    setForm({ nome: '', telefone: '', veiculo: 'moto', email: '', senha: '' })
    loadEntregadores(estabelecimentoId)
  }

  const toggleStatus = async (e: Entregador) => {
    if (e.status === 'em_rota') { setToast({ msg: 'Entregador com entrega em andamento', type: 'error' }); return }
    const novoStatus = e.status === 'livre' ? 'inativo' : 'livre'
    await supabase.from('entregadores').update({ status: novoStatus }).eq('id', e.id)
    if (estabelecimentoId) loadEntregadores(estabelecimentoId)
  }

  const ativos = entregadores.filter(e => e.status === 'livre').length
  const emRota = entregadores.filter(e => e.status === 'em_rota').length
  const inativos = entregadores.filter(e => e.status === 'inativo').length

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-6">
        <div>
          <h2 className="text-lg font-bold text-on-background">Gestão de Entregadores</h2>
          <p className="text-xs text-on-surface-variant">{entregadores.length} entregadores cadastrados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-secondary-container text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Adicionar Entregador
        </button>
      </header>

      {/* Stats */}
      <div className="px-6 py-4 grid grid-cols-4 gap-4 border-b border-outline-variant">
        {[
          { label: 'Total', value: entregadores.length, border: 'border-primary-container' },
          { label: 'Disponíveis', value: ativos, border: 'border-green-500' },
          { label: 'Em Entrega', value: emRota, border: 'border-secondary-container' },
          { label: 'Inativos', value: inativos, border: 'border-outline-variant' },
        ].map((s) => (
          <div key={s.label} className={`bg-surface-container-lowest rounded-xl px-5 py-4 border-l-4 ${s.border} shadow-sm`}>
            <p className="text-2xl font-bold text-on-background">{s.value}</p>
            <p className="text-xs text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {entregadores.map((e) => {
              const ganhos = ganhosHoje[e.id] || { total: 0, qtd: 0 }
              const sc = statusConfig[e.status]
              return (
                <div key={e.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface-variant">
                        {e.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-on-background">{e.nome}</p>
                        {e.telefone && <p className="text-xs text-on-surface-variant">{e.telefone}</p>}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${sc.classes}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{veiculoIcon[e.veiculo || 'moto']}</span>
                    <span className="text-xs text-on-surface-variant capitalize">{(e.veiculo || 'moto').replace('_', ' ')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-surface-container-low rounded-xl px-3 py-2.5 text-center">
                      <p className="text-lg font-bold text-on-background">{ganhos.qtd}</p>
                      <p className="text-xs text-on-surface-variant">Entregas hoje</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl px-3 py-2.5 text-center">
                      <p className="text-lg font-bold text-green-600">R$ {ganhos.total.toFixed(2).replace('.', ',')}</p>
                      <p className="text-xs text-on-surface-variant">Ganhos hoje</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStatus(e)}
                    disabled={e.status === 'em_rota'}
                    className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                      e.status === 'livre'
                        ? 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        : e.status === 'inativo'
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-surface-container text-on-surface-variant opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {e.status === 'livre' ? 'Desativar' : e.status === 'inativo' ? 'Ativar' : 'Em entrega'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title="Adicionar Entregador"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-sm hover:bg-surface-container">
                Cancelar
              </button>
              <button
                onClick={criarEntregador}
                disabled={saving || !form.nome}
                className="px-5 py-2.5 rounded-xl bg-secondary-container text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Criando...' : 'Criar Entregador'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Nome *</label>
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none"
                placeholder="Nome do entregador" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Telefone</label>
              <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none"
                placeholder="(11) 9 9999-9999" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Veículo</label>
              <select value={form.veiculo} onChange={(e) => setForm({ ...form, veiculo: e.target.value as VeiculoEntregador })}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none">
                <option value="moto">Moto</option>
                <option value="bike">Bicicleta</option>
                <option value="carro">Carro</option>
                <option value="a_pe">A pé</option>
              </select>
            </div>
            <div className="border-t border-outline-variant pt-4">
              <p className="text-xs font-bold text-on-surface-variant uppercase mb-3">Login do App (opcional)</p>
              <div className="space-y-3">
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none"
                  placeholder="email@entregador.com" type="email" />
                <input value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none"
                  placeholder="Senha do app" type="password" />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
