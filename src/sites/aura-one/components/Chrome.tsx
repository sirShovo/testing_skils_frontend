import { useEffect, type CSSProperties } from 'react'
import { PANELS } from '../layout'

export function TopIsland({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center pt-5 md:justify-start md:pl-8">
      <div className="pointer-events-auto flex items-center gap-4 rounded-full bg-white/60 py-1.5 pr-1.5 pl-5 ring-1 ring-black/5 backdrop-blur-xl">
        <span className="text-[15px] font-semibold tracking-[-0.03em]">
          aura<span className="text-(--a-accent)">·</span>one
        </span>
        <span className="amono hidden text-[10px] tracking-[0.16em] text-(--a-mute) uppercase sm:inline">Ed. 01</span>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="aura-menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          className="relative size-9 rounded-full bg-(--a-ink) text-white transition-transform duration-500 active:scale-95"
          style={{ transitionTimingFunction: 'var(--a-ease)' }}
        >
          {/* Dos líneas que se cruzan en una X */}
          {[0, 1].map((i) => (
            <span
              key={i}
              className="absolute top-1/2 left-1/2 h-[1.5px] w-3.5 rounded-full bg-current transition-transform duration-700"
              style={{
                transitionTimingFunction: 'var(--a-ease)',
                transform: open
                  ? `translate(-50%, -50%) rotate(${i ? -45 : 45}deg)`
                  : `translate(-50%, calc(-50% + ${i ? 3 : -3}px))`,
              }}
            />
          ))}
        </button>
      </div>
    </div>
  )
}

export function MenuOverlay({ open, active, onPick }: { open: boolean; active: number; onPick: (i: number) => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onPick(active)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, active, onPick])

  return (
    <div
      id="aura-menu"
      aria-hidden={!open}
      className={`fixed inset-0 z-30 flex items-center bg-(--a-bg)/80 px-6 backdrop-blur-3xl transition-opacity duration-700 md:px-24 ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ transitionTimingFunction: 'var(--a-ease)' }}
    >
      <nav aria-label="Paneles" className="w-full">
        <ol className="space-y-2">
          {PANELS.map((p, i) => (
            <li key={p} className="overflow-hidden">
              <button
                tabIndex={open ? 0 : -1}
                onClick={() => onPick(i)}
                className={`group flex w-full items-baseline gap-6 text-left transition-[transform,opacity] duration-700 ${
                  open ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                }`}
                style={{ transitionTimingFunction: 'var(--a-ease)', transitionDelay: open ? `${100 + i * 60}ms` : '0ms' } as CSSProperties}
              >
                <span className="amono text-sm text-(--a-mute) tabular-nums">0{i + 1}</span>
                <span
                  className={`text-[clamp(3rem,9vw,8rem)] leading-[0.95] font-semibold tracking-[-0.06em] transition-colors duration-500 ${
                    i === active ? 'text-(--a-ink)' : 'text-(--a-ink)/35 group-hover:text-(--a-ink)'
                  }`}
                >
                  {p}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}

export function BottomIsland({ active, goTo }: { active: number; goTo: (i: number) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden justify-center pb-6 md:flex">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/60 p-1.5 ring-1 ring-black/5 backdrop-blur-xl">
        <button
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          aria-label="Panel anterior"
          className="flex size-9 items-center justify-center rounded-full transition-[background-color,transform] duration-500 hover:bg-black/5 active:scale-95 disabled:opacity-30"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
            <path d="M10 3.5 5.5 8l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="relative grid grid-cols-4">
          {/* Indicador que se desliza bajo la pestaña activa */}
          <span
            className="a-indicator absolute inset-y-0 left-0 w-1/4 rounded-full bg-(--a-ink)"
            style={{ transform: `translateX(${active * 100}%)` }}
            aria-hidden="true"
          />
          {PANELS.map((p, i) => (
            <button
              key={p}
              onClick={() => goTo(i)}
              aria-current={i === active ? 'step' : undefined}
              className={`relative z-10 px-4 py-2 text-[12px] font-medium transition-colors duration-500 ${i === active ? 'text-white' : 'text-(--a-ink-2) hover:text-(--a-ink)'}`}
            >
              <span className="amono mr-1.5 text-[10px] opacity-60">0{i + 1}</span>
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => goTo(active + 1)}
          disabled={active === PANELS.length - 1}
          aria-label="Panel siguiente"
          className="flex size-9 items-center justify-center rounded-full bg-(--a-ink) text-white transition-transform duration-500 active:scale-95 disabled:opacity-30"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
            <path d="M6 3.5 10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <p className="amono pointer-events-none absolute right-8 bottom-9 text-[10px] tracking-[0.16em] text-(--a-mute) uppercase">
        ← → · rueda
      </p>
    </div>
  )
}
