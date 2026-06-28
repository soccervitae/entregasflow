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

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, sobrenome },
      },
    })

    if (error) {
      setLoading(false)
      if (error.message.includes('already registered')) {
        setErro('Este e-mail já está cadastrado.')
      } else {
        setErro('Erro ao criar conta. Tente novamente.')
      }
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        nome,
        sobrenome,
        email,
        role: 'useradmin',
      })

      if (profileError) {
        setLoading(false)
        setErro('Erro ao salvar perfil. Tente novamente.')
        return
      }
    }

    setLoading(false)
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
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">Confirmar senha</label>
              <input
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary-container"
                placeholder="Repita a senha"
              />
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
