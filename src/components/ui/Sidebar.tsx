'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/pdv', label: 'Dashboard', icon: 'dashboard', exact: true },
  { href: '/pdv/entregadores', label: 'Entregadores', icon: 'group' },
  { href: '/pdv/pedidos', label: 'Pedidos', icon: 'local_shipping' },
  { href: '/pdv/relatorios', label: 'Relatórios', icon: 'payments' },
  { href: '/pdv/configuracoes', label: 'Configurações', icon: 'settings' },
]

interface SidebarProps {
  nomeEstabelecimento?: string
  nomeUsuario?: string
}

export default function Sidebar({ nomeEstabelecimento = 'EntregasFlow', nomeUsuario = 'Admin' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-on-background shadow-md flex flex-col p-4 z-50">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-surface-container-lowest">{nomeEstabelecimento}</h1>
        <p className="text-on-primary-container/60 text-sm">Operações de Entrega</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(item.href, item.exact)
                ? 'bg-primary-container text-on-primary-container'
                : 'text-surface-variant hover:text-surface-container-lowest hover:bg-primary-container/20'
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] ${isActive(item.href, item.exact) ? 'material-symbols-filled' : ''}`}>
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}

        <Link
          href="/pdv/novo"
          className="flex items-center gap-3 px-4 py-3 mt-4 rounded-lg bg-secondary-container text-white transition-all hover:opacity-90 active:scale-95"
        >
          <span className="material-symbols-outlined text-[22px]">add_circle</span>
          <span className="text-sm font-semibold">Novo Pedido</span>
        </Link>
      </nav>

      <div className="mt-auto p-3 bg-primary-container/10 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold text-sm">
            {nomeUsuario.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-surface-container-lowest text-sm font-semibold truncate">{nomeUsuario}</p>
            <p className="text-on-primary-container/50 text-xs">Gestor</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-surface-variant hover:text-surface-container-lowest transition-colors"
            title="Sair"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
