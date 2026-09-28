import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

export function Reveal({ children, index = 0, className = '' }: { children: ReactNode; index?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // root: null → el viewport; funciona igual con el track horizontal que con el apilado vertical.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.visible = 'true'
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`a-reveal ${className}`} style={{ '--i': index } as CSSProperties}>
      {children}
    </div>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-medium tracking-[0.2em] text-(--a-ink-2) uppercase ring-1 ring-black/5">
      <span className="size-1.5 rounded-full bg-(--a-accent)" />
      {children}
    </span>
  )
}

/* Doble bisel: carcasa exterior + núcleo interior con radio concéntrico. */
export function Bezel({
  children,
  className = '',
  coreClassName = '',
  radius = '2rem',
}: {
  children: ReactNode
  className?: string
  coreClassName?: string
  radius?: string
}) {
  return (
    <div className={`bg-black/[0.035] p-1.5 ring-1 ring-black/5 ${className}`} style={{ borderRadius: radius }}>
      <div
        className={`h-full bg-(--a-bg-2) shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.04)] ${coreClassName}`}
        style={{ borderRadius: `calc(${radius} - 0.375rem)` }}
      >
        {children}
      </div>
    </div>
  )
}

export function ArrowIcon({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
      <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* Botón isla: píldora con el icono anidado en su propio círculo. */
export function PillButton({
  children,
  onClick,
  type = 'button',
  variant = 'dark',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'dark' | 'light'
  disabled?: boolean
}) {
  const dark = variant === 'dark'
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group inline-flex items-center gap-3 rounded-full py-2 pr-2 pl-6 text-sm font-medium transition-[transform,background-color] duration-500 active:scale-[0.98] disabled:opacity-50 ${
        dark ? 'bg-(--a-ink) text-white hover:bg-[#2a2a28]' : 'bg-white/70 text-(--a-ink) ring-1 ring-black/5 hover:bg-white'
      }`}
      style={{ transitionTimingFunction: 'var(--a-ease)' }}
    >
      {children}
      <span
        className={`flex size-8 items-center justify-center rounded-full transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-px group-hover:scale-105 ${
          dark ? 'bg-white/10' : 'bg-black/5'
        }`}
        style={{ transitionTimingFunction: 'var(--a-ease)' }}
      >
        <ArrowIcon />
      </span>
    </button>
  )
}
