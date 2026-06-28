export type StatusPedido = 'novo' | 'em_preparo' | 'pronto' | 'em_rota' | 'entregue' | 'cancelado'
export type StatusEntregador = 'livre' | 'em_rota' | 'inativo'
export type VeiculoEntregador = 'moto' | 'bike' | 'carro' | 'a_pe'
export type FormaPagamento = 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito'

export interface Estabelecimento {
  id: string
  nome: string
  telefone: string | null
  endereco: string | null
  cidade: string | null
  status: 'aberto' | 'fechado'
  owner_id: string
  criado_em: string
}

export interface Entregador {
  id: string
  estabelecimento_id: string
  nome: string
  telefone: string | null
  veiculo: VeiculoEntregador | null
  status: StatusEntregador
  user_id: string | null
  criado_em: string
}

export interface ItemPedido {
  nome: string
  quantidade: number
  valor_unitario: number
}

export interface Pedido {
  id: string
  estabelecimento_id: string
  numero: number
  cliente_nome: string
  cliente_telefone: string | null
  endereco_entrega: string
  bairro: string | null
  observacao: string | null
  itens: ItemPedido[]
  subtotal: number
  taxa_entrega: number
  total: number
  forma_pagamento: FormaPagamento | null
  pago_antecipado: boolean
  troco_para: number | null
  status: StatusPedido
  entregador_id: string | null
  criado_em: string
  atualizado_em: string
  entregue_em: string | null
  entregadores?: Entregador
}

export interface GanhoEntregador {
  id: string
  entregador_id: string
  pedido_id: string
  valor: number
  data: string
  criado_em: string
}
