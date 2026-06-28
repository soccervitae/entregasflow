'use client'

import Link from 'next/link'

const features = [
  {
    icon: 'receipt_long',
    title: 'PDV Completo',
    desc: 'Crie e gerencie pedidos em segundos. Formulário em etapas: cliente, itens e pagamento.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: 'sensors',
    title: 'Tempo Real',
    desc: 'Pedidos atualizados instantaneamente via Supabase Realtime. Sem precisar recarregar a página.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: 'two_wheeler',
    title: 'App do Entregador',
    desc: 'App mobile-first para os entregadores receberem corridas e confirmarem entregas.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: 'group',
    title: 'Gestão de Frota',
    desc: 'Cadastre entregadores, acompanhe status em tempo real e veja ganhos do dia.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: 'payments',
    title: 'Múltiplas Formas de Pagamento',
    desc: 'PIX, dinheiro, cartão de crédito e débito. Controle de troco e pagamento antecipado.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: 'bar_chart',
    title: 'Relatórios e Métricas',
    desc: 'Faturamento, ticket médio, ranking de entregadores e tempo médio de entrega.',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: 'map',
    title: 'Integração com Mapas',
    desc: 'Botão "Ver no mapa" abre o Google Maps diretamente com o endereço do cliente.',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    icon: 'lock',
    title: 'Segurança Total (RLS)',
    desc: 'Cada estabelecimento acessa apenas seus próprios dados. Entregadores veem só suas corridas.',
    color: 'bg-slate-50 text-slate-600',
  },
  {
    icon: 'install_mobile',
    title: 'PWA Instalável',
    desc: 'O app do entregador pode ser instalado no celular como um aplicativo nativo.',
    color: 'bg-indigo-50 text-indigo-600',
  },
]

const statusItems = [
  { label: 'Novo', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  { label: 'Em Preparo', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  { label: 'Pronto', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  { label: 'Em Rota', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  { label: 'Entregue', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  { label: 'Cancelado', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
]

const steps = [
  { num: '01', title: 'Crie sua conta', desc: 'Cadastre o estabelecimento no sistema em menos de 2 minutos.' },
  { num: '02', title: 'Adicione entregadores', desc: 'Cadastre sua equipe com nome, veículo e login para o app.' },
  { num: '03', title: 'Receba pedidos', desc: 'Crie pedidos pelo PDV e acompanhe tudo em tempo real.' },
  { num: '04', title: 'Despache e monitore', desc: 'Atribua entregadores, acompanhe o status e confirme entregas.' },
]

const stats = [
  { value: 'Realtime', label: 'Atualizações instantâneas', icon: 'bolt' },
  { value: '6', label: 'Status de pedido', icon: 'track_changes' },
  { value: 'PWA', label: 'App instalável', icon: 'install_mobile' },
  { value: '100%', label: 'Dados protegidos por RLS', icon: 'shield' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background font-sans">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-surface-container-lowest/90 backdrop-blur border-b border-outline-variant shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">local_shipping</span>
            </div>
            <span className="text-lg font-bold text-on-background">EntregasFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-on-surface-variant">
            <a href="#funcionalidades" className="hover:text-on-background transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="hover:text-on-background transition-colors">Como funciona</a>
            <a href="#pdv" className="hover:text-on-background transition-colors">PDV</a>
            <a href="#entregador" className="hover:text-on-background transition-colors">App Entregador</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-on-surface-variant hover:text-on-background transition-colors">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="bg-secondary-container text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-on-background pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-on-background via-primary-container to-[#1a2a45] opacity-80" />
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-secondary-container/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-on-tertiary-container/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-secondary-container/20 text-secondary-fixed-dim text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-secondary-container/30">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse" />
            Sistema completo para delivery próprio
          </span>

          <h1 className="text-5xl md:text-6xl font-bold text-surface-container-lowest leading-tight mb-6">
            Gerencie seu delivery<br />
            <span className="text-secondary-container">com inteligência</span>
          </h1>

          <p className="text-on-primary-container text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            PDV completo para pizzarias, restaurantes e lanchonetes. Pedidos em tempo real,
            gestão de entregadores e app mobile — tudo em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/cadastro"
              className="flex items-center gap-2 bg-secondary-container text-white px-8 py-4 rounded-2xl text-base font-bold hover:opacity-90 active:scale-95 transition-all shadow-2xl shadow-secondary-container/30 min-w-[200px] justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
              Começar grátis
            </Link>
            <Link
              href="/entregador"
              className="flex items-center gap-2 bg-white/10 text-surface-container-lowest border border-white/20 px-8 py-4 rounded-2xl text-base font-semibold hover:bg-white/20 transition-all min-w-[200px] justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
              App do Entregador
            </Link>
          </div>

          {/* Mini mockup PDV */}
          <div className="max-w-4xl mx-auto bg-surface-container-lowest/5 border border-white/10 rounded-2xl p-1">
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-2xl">
              {/* Fake topbar */}
              <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-on-surface-variant ml-2">entregasflow.com/pdv</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Realtime ativo
                </div>
              </div>
              {/* Fake content */}
              <div className="flex h-48">
                {/* Fake sidebar */}
                <div className="w-14 bg-on-background flex flex-col items-center py-3 gap-3">
                  {['dashboard','local_shipping','group','payments','settings'].map((ic, i) => (
                    <div key={ic} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 1 ? 'bg-secondary-container/30' : ''}`}>
                      <span className="material-symbols-outlined text-surface-variant text-[16px]">{ic}</span>
                    </div>
                  ))}
                </div>
                {/* Fake order list */}
                <div className="w-44 border-r border-outline-variant p-2 space-y-2">
                  {[
                    { num: 42, nome: 'Carlos M.', status: 'pronto', valor: 'R$ 68,00' },
                    { num: 41, nome: 'Ana Paula', status: 'em_rota', valor: 'R$ 45,50' },
                    { num: 40, nome: 'João S.', status: 'entregue', valor: 'R$ 92,00' },
                  ].map((p) => (
                    <div key={p.num} className={`p-2 rounded-lg border text-left ${p.num === 42 ? 'border-primary-container bg-surface-container-low' : 'border-outline-variant/30'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-on-surface-variant font-bold">#{p.num}</span>
                        <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold ${
                          p.status === 'pronto' ? 'bg-amber-100 text-amber-700' :
                          p.status === 'em_rota' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        }`}>{p.status.replace('_',' ')}</span>
                      </div>
                      <p className="text-[9px] font-semibold text-on-background">{p.nome}</p>
                      <p className="text-[8px] text-on-surface-variant">{p.valor}</p>
                    </div>
                  ))}
                </div>
                {/* Fake detail */}
                <div className="flex-1 p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[8px] text-on-surface-variant font-bold">PEDIDO #42</p>
                      <p className="text-sm font-bold text-on-background">Carlos Mendes</p>
                    </div>
                    <span className="bg-amber-100 text-amber-700 text-[7px] px-2 py-0.5 rounded-full font-bold">PRONTO</span>
                  </div>
                  <p className="text-[8px] text-on-surface-variant mb-2">Rua das Flores, 123 — Centro</p>
                  <div className="space-y-1 mb-3">
                    {['2x Pizza Grande', '1x Refrigerante'].map(i => (
                      <div key={i} className="flex justify-between text-[8px]">
                        <span className="text-on-surface-variant">{i}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-secondary-container/20 rounded-lg p-1.5 text-[8px] text-center font-bold text-secondary-container">
                    DESPACHAR PEDIDO →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-secondary-container text-[22px]">{s.icon}</span>
              </div>
              <p className="text-2xl font-bold text-on-background">{s.value}</p>
              <p className="text-sm text-on-surface-variant mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="funcionalidades" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-secondary-container uppercase tracking-wider">Funcionalidades</span>
          <h2 className="text-4xl font-bold text-on-background mt-2 mb-4">Tudo que você precisa para o delivery</h2>
          <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
            Um sistema completo pensado para o dia a dia do food service com entrega própria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${f.color}`}>
                <span className="material-symbols-outlined text-[22px]">{f.icon}</span>
              </div>
              <h3 className="font-bold text-on-background text-lg mb-2">{f.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATUS PIPELINE */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="text-xs font-bold text-secondary-container uppercase tracking-wider">Rastreamento</span>
          <h2 className="text-3xl font-bold text-on-background mt-2 mb-4">Ciclo completo do pedido</h2>
          <p className="text-on-surface-variant mb-12">Acompanhe cada etapa com badges coloridos em tempo real</p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {statusItems.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${s.color}`}>
                  <span className={`w-2 h-2 rounded-full ${s.dot} ${i < 4 ? 'animate-pulse' : ''}`} />
                  {s.label}
                </span>
                {i < statusItems.length - 1 && (
                  <span className="material-symbols-outlined text-outline text-[16px]">arrow_forward</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-on-surface-variant">
            Cada mudança de status é propagada em tempo real para o PDV e para o app do entregador
          </p>
        </div>
      </section>

      {/* CHEGA DE NOTA SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-secondary-container uppercase tracking-wider">Uma virada de jogo</span>
          <h2 className="text-4xl font-bold text-on-background mt-2 mb-4">
            Chega de usar nota de pedido<br className="hidden md:block" /> para pagar seus entregadores
          </h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Muitos deliveries ainda entregam a nota fiscal do pedido ao entregador para que ele saiba quantas corridas fez no dia.
            Com o EntregasFlow, esse processo é 100% digital e automático.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Antes */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-[22px]">receipt_long</span>
              </div>
              <div>
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Antes</p>
                <p className="font-bold text-red-700">O jeito antigo e manual</p>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                { icon: 'description', text: 'Entregador guarda as notas dos pedidos para provar quantas corridas fez' },
                { icon: 'calculate', text: 'Dono soma as notas manualmente no fim do dia para calcular o pagamento' },
                { icon: 'warning', text: 'Risco de perda, fraude ou divergência nas notas acumuladas' },
                { icon: 'schedule', text: 'Processo lento e sujeito a erros humanos no acerto de contas' },
                { icon: 'visibility_off', text: 'Sem visibilidade em tempo real de quantas entregas cada um fez' },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-400 text-[18px] mt-0.5 flex-shrink-0">{item.icon}</span>
                  <p className="text-sm text-red-700">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Depois */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-[22px]">smartphone</span>
              </div>
              <div>
                <p className="text-xs font-bold text-green-500 uppercase tracking-wider">Com EntregasFlow</p>
                <p className="font-bold text-green-800">Tudo digital e automático</p>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                { icon: 'check_circle', text: 'Cada entrega confirmada é registrada automaticamente no histórico do entregador' },
                { icon: 'attach_money', text: 'Ganhos calculados em tempo real: o entregador vê o total do dia no próprio app' },
                { icon: 'history', text: 'Histórico agrupado por data: quantas corridas fez e quanto ganhou em cada dia' },
                { icon: 'leaderboard', text: 'Estabelecimento vê o ranking e os ganhos de cada entregador no painel de relatórios' },
                { icon: 'verified', text: 'Zero divergência: os dados são os mesmos para o entregador e para o estabelecimento' },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-[18px] mt-0.5 flex-shrink-0">{item.icon}</span>
                  <p className="text-sm text-green-800">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Call out central */}
        <div className="mt-10 bg-on-background rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-secondary-container text-5xl mb-4 block">auto_awesome</span>
          <p className="text-surface-container-lowest text-xl font-bold mb-2">
            O entregador tem controle total das suas corridas. O estabelecimento também.
          </p>
          <p className="text-on-primary-container max-w-xl mx-auto text-sm">
            Quando o entregador confirma uma entrega, o sistema registra automaticamente o valor da taxa,
            atualiza o histórico e soma nos ganhos do dia — sem papelada, sem anotação, sem erro.
          </p>
        </div>
      </section>

      {/* PDV SECTION */}
      <section id="pdv" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-bold text-secondary-container uppercase tracking-wider">PDV Web</span>
            <h2 className="text-4xl font-bold text-on-background mt-2 mb-6">
              Painel completo para o caixa do estabelecimento
            </h2>
            <div className="space-y-5">
              {[
                { icon: 'view_column', title: 'Layout 3 colunas', desc: 'Sidebar de navegação, lista de pedidos e painel de detalhes lado a lado.' },
                { icon: 'filter_list', title: 'Filtros rápidos', desc: 'Filtre por status: novos, em preparo, prontos, em rota, entregues.' },
                { icon: 'person_pin', title: 'Despacho inteligente', desc: 'Selecione entregadores livres e despache com um clique. Regra: um pedido por entregador.' },
                { icon: 'edit_note', title: 'Criação em etapas', desc: 'Formulário wizard: dados do cliente → itens livres → forma de pagamento e troco.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary-container text-[20px]">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-background">{item.title}</p>
                    <p className="text-sm text-on-surface-variant mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 mt-8 bg-on-background text-surface-container-lowest px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
            >
              Acessar o PDV
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          {/* Fake PDV card */}
          <div className="bg-on-background rounded-2xl p-4 shadow-2xl">
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
              <div className="bg-surface-container-low px-4 py-3 flex items-center justify-between border-b border-outline-variant">
                <div className="flex gap-2">
                  {['Todos','Novos','Prontos','Em Rota'].map((f, i) => (
                    <span key={f} className={`text-xs px-3 py-1 rounded-full font-semibold ${i === 2 ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'}`}>{f}</span>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-outline-variant/20">
                {[
                  { num: 47, nome: 'Fernanda Lima', end: 'Av. Brasil, 500', valor: 'R$ 78,00', status: 'pronto', statusColor: 'bg-amber-100 text-amber-700' },
                  { num: 46, nome: 'Roberto Costa', end: 'Rua A, 12', valor: 'R$ 45,00', status: 'pronto', statusColor: 'bg-amber-100 text-amber-700' },
                  { num: 45, nome: 'Mariana S.', end: 'R. das Rosas, 88', valor: 'R$ 120,00', status: 'em preparo', statusColor: 'bg-blue-100 text-blue-700' },
                ].map((p) => (
                  <div key={p.num} className="flex items-center justify-between px-4 py-3 hover:bg-surface-container-low/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-on-surface-variant">#{p.num}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${p.statusColor}`}>{p.status}</span>
                      </div>
                      <p className="text-sm font-semibold text-on-background">{p.nome}</p>
                      <p className="text-xs text-on-surface-variant">{p.end}</p>
                    </div>
                    <p className="text-sm font-bold text-on-background">{p.valor}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ENTREGADOR SECTION */}
      <section id="entregador" className="py-24 bg-on-background">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Fake mobile app */}
          <div className="flex justify-center order-2 lg:order-1">
            <div className="w-64 bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border-4 border-surface-container-high">
              {/* App header */}
              <div className="bg-on-background px-4 pt-5 pb-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-on-primary-container text-xs">Olá,</p>
                    <p className="text-surface-container-lowest font-bold">João Entregador</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online
                  </div>
                </div>
                {/* Ganhos */}
                <div className="bg-primary-container/30 rounded-xl p-3">
                  <p className="text-on-primary-container text-xs mb-1">Ganhos hoje</p>
                  <p className="text-surface-container-lowest text-xl font-bold">R$ 87,50</p>
                  <p className="text-on-primary-container text-xs mt-0.5">5 entregas realizadas</p>
                </div>
              </div>
              {/* Corridas */}
              <div className="bg-background p-3 space-y-2">
                <p className="text-xs font-bold text-on-background mb-2">Corridas Ativas</p>
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[9px] font-bold text-secondary-container">PEDIDO #52</span>
                      <p className="text-xs font-bold text-on-background">Ana Carolina</p>
                    </div>
                    <span className="bg-purple-100 text-purple-700 text-[8px] px-1.5 py-0.5 rounded-full font-bold">Em rota</span>
                  </div>
                  <p className="text-[9px] text-on-surface-variant mb-2">Rua Ipiranga, 45 — Jardim</p>
                  <div className="flex gap-1.5">
                    <div className="flex-1 bg-surface-container text-on-surface-variant text-[9px] py-1.5 rounded-lg text-center font-semibold">Mapa</div>
                    <div className="flex-1 bg-green-600 text-white text-[9px] py-1.5 rounded-lg text-center font-bold">Confirmar ✓</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-xs font-bold text-secondary-container uppercase tracking-wider">App do Entregador</span>
            <h2 className="text-4xl font-bold text-surface-container-lowest mt-2 mb-6">
              App mobile que seus entregadores vão amar
            </h2>
            <div className="space-y-5">
              {[
                { icon: 'toggle_on', title: 'Toggle Online/Offline', desc: 'Entregador controla sua disponibilidade. Não pode ir offline com entrega em andamento.' },
                { icon: 'payments', title: 'Ganhos em tempo real', desc: 'Card de ganhos do dia atualizado a cada entrega confirmada.' },
                { icon: 'check_circle', title: 'Confirmação de entrega', desc: 'Um toque para confirmar. Sistema registra ganho e libera o entregador automaticamente.' },
                { icon: 'history', title: 'Histórico de entregas', desc: 'Agrupado por data com total de ganhos e lista de cada corrida.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary-container text-[20px]">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-surface-container-lowest">{item.title}</p>
                    <p className="text-sm text-on-primary-container mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/entregador"
              className="inline-flex items-center gap-2 mt-8 bg-secondary-container text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
            >
              Acessar como entregador
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-secondary-container uppercase tracking-wider">Passo a passo</span>
          <h2 className="text-4xl font-bold text-on-background mt-2 mb-4">Como funciona</h2>
          <p className="text-on-surface-variant">Em menos de 10 minutos seu delivery já está operando</p>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-outline-variant hidden md:block" />
          <div className="space-y-10">
            {steps.map((s) => (
              <div key={s.num} className="flex gap-8 items-start">
                <div className="w-16 h-16 rounded-2xl bg-on-background flex items-center justify-center flex-shrink-0 relative z-10 shadow-lg">
                  <span className="text-surface-container-lowest font-bold text-lg">{s.num}</span>
                </div>
                <div className="pt-3">
                  <h3 className="text-xl font-bold text-on-background mb-1">{s.title}</h3>
                  <p className="text-on-surface-variant">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-on-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-surface-container-lowest mb-4">
            Pronto para organizar seu delivery?
          </h2>
          <p className="text-on-primary-container text-lg mb-10">
            Entre no PDV agora e comece a gerenciar seus pedidos em tempo real.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 bg-secondary-container text-white px-8 py-4 rounded-2xl text-base font-bold hover:opacity-90 active:scale-95 transition-all shadow-2xl shadow-secondary-container/20"
            >
              <span className="material-symbols-outlined text-[20px]">store</span>
              Acessar o PDV
            </Link>
            <Link
              href="/entregador"
              className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-surface-container-lowest px-8 py-4 rounded-2xl text-base font-semibold hover:bg-white/20 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
              Sou entregador
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface-container-low border-t border-outline-variant py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px]">local_shipping</span>
            </div>
            <span className="font-bold text-on-background">EntregasFlow</span>
          </div>
          <p className="text-sm text-on-surface-variant">
            Gestão de delivery para food service. Desenvolvido com Next.js + Supabase.
          </p>
          <div className="flex items-center gap-4 text-sm text-on-surface-variant">
            <Link href="/login" className="hover:text-on-background transition-colors">PDV</Link>
            <Link href="/entregador" className="hover:text-on-background transition-colors">Entregador</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
