'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Toast from '@/components/ui/Toast'

const formasPagamento = [
  { value: 'pix', label: 'PIX', icon: 'qr_code' },
  { value: 'dinheiro', label: 'Dinheiro', icon: 'payments' },
  { value: 'cartao_credito', label: 'Crédito', icon: 'credit_card' },
  { value: 'cartao_debito', label: 'Débito', icon: 'credit_card' },
]

interface Entregador {
  id: string
  nome: string
  status: string
}

export default function NovoPedidoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [estabelecimentoId, setEstabelecimentoId] = useState<string | null>(null)
  const [entregadores, setEntregadores] = useState<Entregador[]>([])

  const [clienteNome, setClienteNome] = useState('')
  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [valor, setValor] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('pix')
  const [entregadorId, setEntregadorId] = useState('')
  const [numeroExterno, setNumeroExterno] = useState('')
  const [obs, setObs] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('estabelecimentos').select('id').eq('owner_id', user.id).single().then(({ data }) => {
        if (!data) return
        setEstabelecimentoId(data.id)
        supabase.from('entregadores').select('id, nome, status').eq('estabelecimento_id', data.id).eq('ativo', true).then(({ data: ents }) => {
          if (ents) setEntregadores(ents)
        })
      })
    })
  }, [])

  const salvar = async () => {
    if (!clienteNome.trim()) { setToast({ msg: 'Informe o nome do cliente', type: 'error' }); return }
    if (!endereco.trim()) { setToast({ msg: 'Informe o endereço de entrega', type: 'error' }); return }
    if (!estabelecimentoId) return

    const valorNum = parseFloat(valor.replace(',', '.')) || 0

    setSaving(true)
    const { error } = await supabase.from('pedidos').insert({
      estabelecimento_id: estabelecimentoId,
      cliente_nome: clienteNome.trim(),
      endereco_entrega: endereco.trim(),
      bairro: bairro.trim() || null,
      total: valorNum,
      forma_pagamento: formaPagamento,
      entregador_id: entregadorId || null,
      numero_externo: numeroExterno.trim() || null,
      observacao: obs.trim() || null,
      status: entregadorId ? 'em_rota' : 'novo',
    })
    setSaving(false)

    if (error) { setToast({ msg: 'Erro ao criar pedido', type: 'error' }); return }
    setToast({ msg: 'Pedido criado!', type: 'success' })
    setTimeout(() => router.push('/pdv'), 1200)
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm flex items-center gap-4 h-16 px-6">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <h2 className="text-lg font-bold text-on-background">Novo Pedido</h2>
          <p className="text-xs text-on-surface-variant">Preencha os dados para despachar</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5 max-w-2xl space-y-5">

        {/* Cliente e endereço */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary-container">person</span>
            Dados do cliente
          </h3>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Nome do Cliente *</label>
            <input
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none"
              placeholder="Ex: João Silva"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Endereço de Entrega *</label>
            <input
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none"
              placeholder="Rua, número, complemento"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Bairro</label>
            <input
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none"
              placeholder="Nome do bairro"
            />
          </div>
        </div>

        {/* Valor e pagamento */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary-container">payments</span>
            Valor e pagamento
          </h3>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Valor do Pedido (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Forma de Pagamento</label>
            <div className="grid grid-cols-4 gap-2">
              {formasPagamento.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormaPagamento(f.value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                    formaPagamento === f.value
                      ? 'border-secondary-container bg-secondary-container/10 text-secondary-container'
                      : 'border-outline-variant text-on-surface-variant hover:border-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{f.icon}</span>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Entregador */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary-container">two_wheeler</span>
            Entregador
          </h3>

          {entregadores.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Nenhum entregador ativo cadastrado.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setEntregadorId('')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  !entregadorId ? 'border-secondary-container bg-secondary-container/10 text-secondary-container' : 'border-outline-variant text-on-surface-variant hover:border-outline'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                Despachar depois
              </button>
              {entregadores.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setEntregadorId(e.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    entregadorId === e.id ? 'border-secondary-container bg-secondary-container/10 text-secondary-container' : 'border-outline-variant text-on-surface-variant hover:border-outline'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {e.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{e.nome}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Extras */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary-container">info</span>
            Informações adicionais
          </h3>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Nº do Pedido Externo</label>
            <input
              value={numeroExterno}
              onChange={(e) => setNumeroExterno(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none"
              placeholder="Ex: #1234 (iFood, Rappi...)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Observações</label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none resize-none"
              placeholder="Sem cebola, campainha não funciona..."
            />
          </div>
        </div>

      </div>

      <div className="px-6 py-4 border-t border-outline-variant">
        <button
          onClick={salvar}
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-secondary-container text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><span className="material-symbols-outlined text-[20px]">send</span> {entregadorId ? 'Criar e Despachar' : 'Criar Pedido'}</>
          }
        </button>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
