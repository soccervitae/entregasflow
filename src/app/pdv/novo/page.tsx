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

interface Item { nome: string; quantidade: number; valor_unitario: number }
interface Entregador { id: string; nome: string }

export default function NovoPedidoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [estabelecimentoId, setEstabelecimentoId] = useState<string | null>(null)
  const [entregadores, setEntregadores] = useState<Entregador[]>([])

  // Campo IA
  const [textoIA, setTextoIA] = useState('')

  // Campos do pedido
  const [clienteNome, setClienteNome] = useState('')
  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [valor, setValor] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('pix')
  const [entregadorId, setEntregadorId] = useState('')
  const [numeroExterno, setNumeroExterno] = useState('')
  const [obs, setObs] = useState('')
  const [itens, setItens] = useState<Item[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('estabelecimentos').select('id').eq('owner_id', user.id).single().then(({ data }) => {
        if (!data) return
        setEstabelecimentoId(data.id)
        supabase.from('entregadores').select('id, nome').eq('estabelecimento_id', data.id).eq('ativo', true).then(({ data: ents }) => {
          if (ents) setEntregadores(ents)
        })
      })
    })
  }, [])

  const interpretarComIA = async () => {
    if (!textoIA.trim()) return
    setParsing(true)
    try {
      const res = await fetch('/api/ai/parse-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: textoIA }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.cliente_nome) setClienteNome(data.cliente_nome)
      if (data.endereco) setEndereco(data.endereco)
      if (data.bairro) setBairro(data.bairro)
      if (data.valor) setValor(String(data.valor).replace('.', ','))
      if (data.forma_pagamento) setFormaPagamento(data.forma_pagamento)
      if (data.numero_externo) setNumeroExterno(data.numero_externo)
      if (data.observacao) setObs(data.observacao)
      if (data.itens?.length) setItens(data.itens)
      setToast({ msg: 'Pedido interpretado com sucesso!', type: 'success' })
    } catch {
      setToast({ msg: 'Não foi possível interpretar. Preencha manualmente.', type: 'error' })
    }
    setParsing(false)
  }

  const addItem = () => setItens([...itens, { nome: '', quantidade: 1, valor_unitario: 0 }])
  const removeItem = (i: number) => setItens(itens.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof Item, value: string | number) => {
    const updated = [...itens]
    updated[i] = { ...updated[i], [field]: value }
    setItens(updated)
  }

  const total = itens.reduce((acc, it) => acc + it.quantidade * it.valor_unitario, 0) || parseFloat(valor.replace(',', '.')) || 0

  const salvar = async () => {
    if (!clienteNome.trim()) { setToast({ msg: 'Informe o nome do cliente', type: 'error' }); return }
    if (!endereco.trim()) { setToast({ msg: 'Informe o endereço de entrega', type: 'error' }); return }
    if (!estabelecimentoId) return

    setSaving(true)
    const { error } = await supabase.from('pedidos').insert({
      estabelecimento_id: estabelecimentoId,
      cliente_nome: clienteNome.trim(),
      endereco_entrega: endereco.trim(),
      bairro: bairro.trim() || null,
      total,
      itens: itens.length ? itens : [],
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
          <p className="text-xs text-on-surface-variant">Cole o texto ou preencha manualmente</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5 max-w-2xl space-y-5">

        {/* Campo IA */}
        <div className="bg-gradient-to-br from-primary-container/30 to-secondary-container/10 rounded-2xl border border-secondary-container/30 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">auto_awesome</span>
            </div>
            <div>
              <p className="font-semibold text-on-background text-sm">Interpretar com IA</p>
              <p className="text-xs text-on-surface-variant">Cole o texto do pedido (iFood, WhatsApp, etc.) e a IA preenche tudo</p>
            </div>
          </div>
          <textarea
            value={textoIA}
            onChange={(e) => setTextoIA(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none resize-none"
            placeholder={`Cole aqui o texto do pedido. Exemplo:\n\nCliente: João Silva\nEndereço: Rua das Flores, 123 - Centro\n1x Pizza Margherita R$ 45,00\n1x Refrigerante R$ 8,00\nTotal: R$ 53,00 - PIX`}
          />
          <button
            onClick={interpretarComIA}
            disabled={parsing || !textoIA.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary-container text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {parsing
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Interpretando...</>
              : <><span className="material-symbols-outlined text-[18px]">auto_awesome</span> Preencher com IA</>
            }
          </button>
        </div>

        {/* Divisor */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-outline-variant" />
          <span className="text-xs text-on-surface-variant font-medium">ou preencha manualmente</span>
          <div className="flex-1 h-px bg-outline-variant" />
        </div>

        {/* Cliente e endereço */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary-container">person</span>
            Dados do cliente
          </h3>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Nome do Cliente *</label>
            <input value={clienteNome} onChange={(e) => setClienteNome(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none"
              placeholder="Ex: João Silva" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Endereço de Entrega *</label>
            <input value={endereco} onChange={(e) => setEndereco(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none"
              placeholder="Rua, número, complemento" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Bairro</label>
            <input value={bairro} onChange={(e) => setBairro(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none"
              placeholder="Nome do bairro" />
          </div>
        </div>

        {/* Itens */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary-container">receipt_long</span>
            Itens do pedido
          </h3>

          {itens.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Nenhum item. Use a IA ou adicione manualmente.</p>
          ) : (
            <div className="space-y-3">
              {itens.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-surface-container-low rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <input
                      value={item.nome}
                      onChange={(e) => updateItem(i, 'nome', e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-on-background outline-none placeholder:text-on-surface-variant"
                      placeholder="Nome do item"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number" min={1} value={item.quantidade}
                        onChange={(e) => updateItem(i, 'quantidade', parseInt(e.target.value) || 1)}
                        className="w-12 bg-transparent text-xs text-on-surface-variant outline-none"
                      />
                      <span className="text-xs text-on-surface-variant">x</span>
                      <span className="text-xs text-on-surface-variant">R$</span>
                      <input
                        type="number" min={0} step={0.01} value={item.valor_unitario}
                        onChange={(e) => updateItem(i, 'valor_unitario', parseFloat(e.target.value) || 0)}
                        className="w-16 bg-transparent text-xs text-on-surface-variant outline-none"
                      />
                      <span className="text-xs text-secondary-container font-semibold ml-auto">
                        R$ {(item.quantidade * item.valor_unitario).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(i)} className="text-error/60 hover:text-error transition-colors flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addItem}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant text-sm hover:border-secondary-container hover:text-secondary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Adicionar item
          </button>

          {itens.length > 0 && (
            <div className="flex justify-between text-sm font-bold text-on-background pt-2 border-t border-outline-variant">
              <span>Total dos itens</span>
              <span>R$ {itens.reduce((acc, it) => acc + it.quantidade * it.valor_unitario, 0).toFixed(2).replace('.', ',')}</span>
            </div>
          )}
        </div>

        {/* Valor e pagamento */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary-container">payments</span>
            Valor e pagamento
          </h3>
          {itens.length === 0 && (
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Valor do Pedido (R$)</label>
              <input
                type="text" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none"
                placeholder="0,00"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Forma de Pagamento</label>
            <div className="grid grid-cols-4 gap-2">
              {formasPagamento.map((f) => (
                <button key={f.value} onClick={() => setFormaPagamento(f.value)}
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
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-5 space-y-3">
          <h3 className="font-semibold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary-container">two_wheeler</span>
            Entregador
          </h3>
          {entregadores.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Nenhum entregador ativo cadastrado.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setEntregadorId('')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  !entregadorId ? 'border-secondary-container bg-secondary-container/10 text-secondary-container' : 'border-outline-variant text-on-surface-variant hover:border-outline'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                Despachar depois
              </button>
              {entregadores.map((e) => (
                <button key={e.id} onClick={() => setEntregadorId(e.id)}
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
            <input value={numeroExterno} onChange={(e) => setNumeroExterno(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none"
              placeholder="Ex: #1234 (iFood, Rappi...)" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Observações</label>
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none resize-none"
              placeholder="Sem cebola, campainha não funciona..." />
          </div>
        </div>

      </div>

      <div className="px-6 py-4 border-t border-outline-variant">
        <button onClick={salvar} disabled={saving}
          className="w-full py-3.5 rounded-xl bg-secondary-container text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><span className="material-symbols-outlined text-[20px]">send</span>{entregadorId ? ' Criar e Despachar' : ' Criar Pedido'}</>
          }
        </button>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
