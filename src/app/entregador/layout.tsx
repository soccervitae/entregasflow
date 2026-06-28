export const metadata = {
  title: 'EntregasFlow — App do Entregador',
  description: 'Receba e confirme suas corridas',
}

export default function EntregadorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto min-h-screen bg-surface-container-lowest shadow-xl relative">
        {children}
      </div>
    </div>
  )
}
