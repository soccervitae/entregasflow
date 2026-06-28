import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/ui/Sidebar'

export default async function PdvLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: estabelecimento } = await supabase
    .from('estabelecimentos')
    .select('nome')
    .eq('owner_id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        nomeEstabelecimento={estabelecimento?.nome || 'EntregasFlow'}
        nomeUsuario={user.email?.split('@')[0] || 'Admin'}
      />
      <main className="ml-[280px] flex-1 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  )
}
