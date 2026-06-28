'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setLoading(false)

    if (error) {
      setErro('E-mail ou senha inválidos')
      return
    }
    router.push('/pdv')
  }

  return (
    <div className="min-h-screen bg-on-background flex">
      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-center items-start p-16 w-[45%] bg-gradient-to-br from-on-background to-primary-container">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-surface-container-lowest mb-3">EntregasFlow</h1>
          <p className="text-on-primary-container text-lg">Gestão inteligente de delivery para o seu negócio</p>
        </div>
        <div className="space-y-6">
          {[
            { icon: 'local_shipping', text: 'Pedidos em tempo real' },
            { icon: 'group', text: 'Gestão de entregadores' },
            { icon: 'payments', text: 'Relatórios financeiros' },
          ].map((item) => (
            <div key={item.icon} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary-container">{item.icon}</span>
              </div>
              <span className="text-surface-variant text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold text-on-background">EntregasFlow</h1>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-on-background mb-1">Entrar no PDV</h2>
            <p className="text-on-surface-variant text-sm mb-8">Acesse o painel do estabelecimento</p>

            {erro && (
              <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {erro}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">E-mail</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Senha</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-secondary-container outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary-container text-white py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    Entrar
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-on-surface-variant">
              É entregador?{' '}
              <a href="/entregador" className="text-on-tertiary-container font-semibold hover:underline">
                Acesse o app de corridas
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
