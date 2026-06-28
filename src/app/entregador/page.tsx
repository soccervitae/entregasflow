'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EntregadorLoginPage() {
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
    if (error) { setErro('E-mail ou senha inválidos'); return }
    router.push('/entregador/corridas')
  }

  return (
    <div className="min-h-screen bg-on-background flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-secondary-container flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white text-4xl">two_wheeler</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-container-lowest">App do Entregador</h1>
          <p className="text-on-primary-container text-sm mt-1">Entre para ver suas corridas</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-6">
          {erro && (
            <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-xl mb-4">
              {erro}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl text-base outline-none focus:ring-2 focus:ring-secondary-container"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl text-base outline-none focus:ring-2 focus:ring-secondary-container"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary-container text-white py-4 rounded-xl font-bold text-base hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-[56px]"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-xs text-on-surface-variant mt-4">
            <a href="/login" className="text-on-tertiary-container hover:underline">Acesso ao PDV do estabelecimento</a>
          </p>
        </div>
      </div>
    </div>
  )
}
