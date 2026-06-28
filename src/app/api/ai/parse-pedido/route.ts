import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const { texto } = await req.json()

  if (!texto?.trim()) {
    return NextResponse.json({ error: 'Texto vazio' }, { status: 400 })
  }

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Você é um assistente de um sistema de delivery. Extraia as informações do pedido abaixo e retorne SOMENTE um JSON válido, sem markdown, sem explicações.

Texto do pedido:
${texto}

Retorne exatamente neste formato JSON:
{
  "cliente_nome": "nome do cliente ou null",
  "endereco": "endereço completo sem bairro ou null",
  "bairro": "bairro ou null",
  "valor": número com o valor total ou 0,
  "forma_pagamento": "pix" | "dinheiro" | "cartao_credito" | "cartao_debito" | "pix",
  "numero_externo": "número do pedido externo ex #123 ou null",
  "observacao": "observações relevantes para entrega ou null",
  "itens": [{ "nome": "nome do item", "quantidade": número, "valor_unitario": número }]
}

Regras:
- forma_pagamento: se mencionar PIX use "pix", cartão crédito use "cartao_credito", cartão débito use "cartao_debito", dinheiro use "dinheiro". Padrão: "pix"
- Se não encontrar um campo, use null ou 0 para números
- itens: extraia os itens do pedido com nome, quantidade e valor unitário. Se não houver itens, retorne []
- Retorne APENAS o JSON, nada mais`,
      },
    ],
  })

  try {
    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Resposta inválida')
    const parsed = JSON.parse(content.text.trim())
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Não foi possível interpretar o texto' }, { status: 422 })
  }
}
