'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function CadastroPage() {
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (senha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    // Cria o usuário via API route (usa service role para confirmar e-mail automaticamente)
    const res = await fetch('/api/auth/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, sobrenome, email, senha }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      setLoading(false)
      setErro(error || 'Erro ao criar conta. Tente novamente.')
      return
    }

    // Faz login automático com as credenciais recém-criadas
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password: senha })
    setLoading(false)

    if (loginError) {
      setErro('Conta criada! Faça login para continuar.')
      router.push('/login')
      return
    }

    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-on-background flex">
      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12 bg-gradient-to-br from-on-background to-primary-container/30">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[20px]">local_shipping</span>
          </div>
          <span className="text-xl font-bold text-surface-container-lowest">EntregasFlow</span>
        </div>

        <div>
          <p className="text-secondary-container text-xs font-bold uppercase tracking-wider mb-4">Por que usar o EntregasFlow?</p>
          <div className="space-y-5">
            {[
              { icon: 'receipt_long', title: 'Sem notas de pedido', desc: 'Histórico digital e automático para cada entregador.' },
              { icon: 'sensors', title: 'Tempo real', desc: 'Pedidos e entregas atualizados ao vivo.' },
              { icon: 'bar_chart', title: 'Relatórios completos', desc: 'Faturamento, ranking e métricas em um painel.' },
              { icon: 'two_wheeler', title: 'App para entregadores', desc: 'Corridas, ganhos e histórico no celular.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary-container/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-secondary-container text-[18px]">{item.icon}</span>
                </div>
                <div>
                  <p className="text-surface-container-lowest font-semibold text-sm">{item.title}</p>
                  <p className="text-on-primary-container text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-on-primary-container text-xs">
          © {new Date().getFullYear()} EntregasFlow. Gestão de delivery para food service.
        </p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-[460px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">local_shipping</span>
            </div>
            <span className="font-bold text-on-background">EntregasFlow</span>
          </div>

          <h1 className="text-2xl font-bold text-on-background mb-1">Criar conta</h1>
          <p className="text-on-surface-variant text-sm mb-8">
            Cadastre-se e configure seu estabelecimento em minutos.
          </p>

          {erro && (
            <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {erro}
            </div>
          )}

          <form onSubmit={handleCadastro} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                  placeholder="João"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Sobrenome</label>
                <input
                  type="text"
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                  placeholder="Silva"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-11 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-background transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{mostrarSenha ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Confirmar senha</label>
              <div className="relative">
                <input
                  type={mostrarConfirmar ? 'text' : 'password'}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-11 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                  placeholder="Repita a senha"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-background transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{mostrarConfirmar ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary-container text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  Criar minha conta
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-secondary-container font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
