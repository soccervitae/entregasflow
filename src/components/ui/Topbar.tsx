'use client'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  searchPlaceholder?: string
  onSearch?: (q: string) => void
}

export default function Topbar({ title, subtitle, actions, searchPlaceholder, onSearch }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm flex flex-col">
      <div className="flex justify-between items-center h-16 px-6">
        <div className="flex items-center gap-4 flex-1">
          {searchPlaceholder && (
            <div className="relative w-full max-w-md group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-secondary-container transition-colors">
                search
              </span>
              <input
                type="text"
                className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-secondary-container/20 outline-none transition-all"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          )}
          {(title || subtitle) && !searchPlaceholder && (
            <div>
              <h2 className="text-lg font-semibold text-on-background">{title}</h2>
              {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors rounded-full relative">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary-container rounded-full"></span>
          </button>
          {actions}
        </div>
      </div>
      {searchPlaceholder && (title || subtitle) && (
        <div className="px-6 pb-3">
          <h2 className="text-2xl font-bold text-on-background">{title}</h2>
          {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}
        </div>
      )}
    </header>
  )
}
