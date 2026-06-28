'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ItemPedido, FormaPagamento } from '@/types'
import Toast from '@/components/ui/Toast'

const steps = ['Cliente', 'Itens', 'Pagamento']

const formasPagamento: { value: FormaPagamento; label: string; icon: string }[] = [
  { value: 'pix', label: 'PIX', icon: 'qr_code' },
  { value: 'dinheiro', label: 'Dinheiro', icon: 'payments' },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: 'credit_card' },
  { value: 'cartao_debito', label: 'Cartão de Débito', icon: 'credit_card' },
]

export default function NovoPedidoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [estabelecimentoId, setEstabelecimentoId] = useState<string | null>(null)

  // Step 1
  const [clienteNome, setClienteNome] = useState('')
  const [clienteTel, setClienteTel] = useState('')
  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [obs, setObs] = useState('')

  // Step 2
  const [itens, setItens] = useState<ItemPedido[]>([{ nome: '', quantidade: 1, valor_unitario: 0 }])

  // Step 3
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix')
  const [taxaEntrega, setTaxaEntrega] = useState(5)
  const [pagoAntecipado, setPagoAntecipado] = useState(false)
  const [trocoPara, setTrocoPara] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('estabelecimentos').select('id').eq('owner_id', user.id).single().then(({ data }) => {
        if (data) setEstabelecimentoId(data.id)
      })
    })
  }, [])

  const subtotal = itens.reduce((acc, item) => acc + item.quantidade * item.valor_unitario, 0)
  const total = subtotal + taxaEntrega

  const addItem = () => setItens([...itens, { nome: '', quantidade: 1, valor_unitario: 0 }])
  const removeItem = (i: number) => setItens(itens.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof ItemPedido, value: string | number) => {
    const updated = [...itens]
    updated[i] = { ...updated[i], [field]: value }
    setItens(updated)
  }

  const salvar = async () => {
    if (!estabelecimentoId) return
    setSaving(true)
    const { error } = await supabase.from('pedidos').insert({
      estabelecimento_id: estabelecimentoId,
      cliente_nome: clienteNome,
      cliente_telefone: clienteTel || null,
      endereco_entrega: endereco,
      bairro: bairro || null,
      observacao: obs || null,
      itens,
      subtotal,
      taxa_entrega: taxaEntrega,
      total,
      forma_pagamento: formaPagamento,
      pago_antecipado: pagoAntecipado,
      troco_para: formaPagamento === 'dinheiro' && trocoPara ? parseFloat(trocoPara) : null,
      status: 'novo',
    })
    setSaving(false)
    if (error) { setToast({ msg: 'Erro ao criar pedido', type: 'error' }); return }
    setToast({ msg: 'Pedido criado com sucesso!', type: 'success' })
    setTimeout(() => router.push('/pdv'), 1500)
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm flex items-center gap-4 h-16 px-6">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <h2 className="text-lg font-bold text-on-background">Novo Pedido</h2>
          <p className="text-xs text-on-surface-variant">Passo {step + 1} de {steps.length}: {steps[step]}</p>
        </div>
      </header>

      {/* Step indicators */}
      <div className="px-6 py-4 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-secondary-container text-white' : 'bg-surface-container text-on-surface-variant'
            }`}>
              {i < step ? <span className="material-symbols-outlined text-[16px]">check</span> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'font-semibold text-on-background' : 'text-on-surface-variant'}`}>{s}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-outline-variant mx-1" />}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 max-w-2xl">
        {/* Step 1: Cliente */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Nome do Cliente *</label>
              <input
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Telefone</label>
              <input
                value={clienteTel}
                onChange={(e) => setClienteTel(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none"
                placeholder="(11) 9 9999-9999"
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
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Observações</label>
              <textarea
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none resize-none"
                placeholder="Sem cebola, campainha não funciona..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Itens */}
        {step === 1 && (
          <div className="space-y-4">
            {itens.map((item, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-on-background">Item {i + 1}</p>
                  {itens.length > 1 && (
                    <button onClick={() => removeItem(i)} className="text-error text-xs hover:underline">
                      Remover
                    </button>
                  )}
                </div>
                <input
                  value={item.nome}
                  onChange={(e) => updateItem(i, 'nome', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none"
                  placeholder="Nome do item"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-on-surface-variant mb-1 block">Qtd</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(e) => updateItem(i, 'quantidade', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant mb-1 block">Valor unitário (R$)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.valor_unitario}
                      onChange={(e) => updateItem(i, 'valor_unitario', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none"
                    />
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant text-right">
                  Subtotal: R$ {(item.quantidade * item.valor_unitario).toFixed(2).replace('.', ',')}
                </p>
              </div>
            ))}

            <button
              onClick={addItem}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant text-sm hover:border-secondary-container hover:text-secondary-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Adicionar item
            </button>

            <div className="bg-surface-container-low rounded-xl p-4 text-sm">
              <div className="flex justify-between text-on-surface-variant mb-1">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between font-bold text-on-background">
                <span>Total (sem frete)</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Pagamento */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-3">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-3">
                {formasPagamento.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFormaPagamento(f.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                      formaPagamento === f.value
                        ? 'border-secondary-container bg-secondary-fixed/20'
                        : 'border-outline-variant hover:border-outline'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{f.icon}</span>
                    <span className="text-sm font-medium">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Taxa de Entrega (R$)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={taxaEntrega}
                onChange={(e) => setTaxaEntrega(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
              <div>
                <p className="text-sm font-semibold text-on-background">Pago antecipado (ex: PIX)</p>
                <p className="text-xs text-on-surface-variant">Marque se o cliente já pagou</p>
              </div>
              <button
                onClick={() => setPagoAntecipado(!pagoAntecipado)}
                className={`relative w-11 h-6 rounded-full transition-colors ${pagoAntecipado ? 'bg-green-500' : 'bg-outline-variant'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${pagoAntecipado ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {formaPagamento === 'dinheiro' && !pagoAntecipado && (
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Troco para (R$)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={trocoPara}
                  onChange={(e) => setTrocoPara(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none"
                  placeholder="50.00"
                />
              </div>
            )}

            <div className="bg-primary-container rounded-xl p-5 text-surface-container-lowest">
              <p className="text-xs font-bold uppercase mb-3 text-on-primary-container">Resumo do Pedido</p>
              <div className="space-y-1 text-sm text-on-primary-container">
                <div className="flex justify-between">
                  <span>Subtotal ({itens.length} item{itens.length > 1 ? 's' : ''})</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de entrega</span>
                  <span>R$ {taxaEntrega.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-on-primary-container/20 text-surface-container-lowest">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-6 py-4 border-t border-outline-variant flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-semibold hover:bg-surface-container transition-colors"
          >
            Voltar
          </button>
        )}
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 0 && (!clienteNome || !endereco)}
            className="flex-1 py-3 rounded-xl bg-secondary-container text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            Próximo
          </button>
        ) : (
          <button
            onClick={salvar}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-secondary-container text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {saving ? 'Criando...' : 'Criar Pedido'}
          </button>
        )}
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
