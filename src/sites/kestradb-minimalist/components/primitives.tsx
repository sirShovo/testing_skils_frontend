import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/* Isotipo: una K construida con una barra y dos alas; el ala inferior lleva el acento. */
export function Isotype({ className = 'size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3" y="3" width="4" height="18" fill="currentColor" />
      <path d="M9 12 21 3v6l-7.2 3Z" fill="currentColor" />
      <path d="M13.8 12 21 21h-7.2Z" fill="var(--k-accent)" />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-(--k-ink) ${className}`}>
      <Isotype className="size-[1.15em]" />
      <span className="font-semibold tracking-[-0.03em]">KestraDB</span>
    </span>
  )
}

type IconProps = { className?: string }

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
}

export function IconArrow({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" {...stroke}>
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  )
}

export function IconCopy({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" {...stroke}>
      <path d="M5 5h8v8H5z" />
      <path d="M3 11V3h8" />
    </svg>
  )
}

export function IconCheck({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" {...stroke}>
      <path d="m3 8.5 3 3 7-7" />
    </svg>
  )
}

export function IconPlay({ className = 'size-3' }: IconProps) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden="true">
      <path d="M3 2v8l7-4Z" fill="currentColor" />
    </svg>
  )
}

export function IconStar({ className = 'size-3.5' }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="m8 1.5 2 4.3 4.7.5-3.5 3.2 1 4.6L8 11.8 3.8 14.1l1-4.6L1.3 6.3 6 5.8Z" fill="currentColor" />
    </svg>
  )
}

export function IconDash({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" {...stroke}>
      <path d="M4 8h8" />
    </svg>
  )
}

/* Envuelve un bloque y lo revela al entrar en el viewport. */
export function Reveal({
  children,
  index = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  index?: number
  className?: string
  as?: 'div' | 'li' | 'header'
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = 'true'
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as never}
      className={`k-reveal ${className}`}
      style={{ '--i': index } as CSSProperties}
    >
      {children}
    </Tag>
  )
}

/* Cabecera de sección: índice monoespaciado + título, alineados a la rejilla. */
export function SectionHeader({
  index,
  label,
  title,
  lede,
}: {
  index: string
  label: string
  title: ReactNode
  lede?: ReactNode
}) {
  return (
    <Reveal as="header" className="grid gap-6 px-6 md:grid-cols-12 md:px-10">
      <p className="kmono text-xs tracking-[0.08em] text-(--k-muted) uppercase md:col-span-3">
        <span className="text-(--k-accent-ink)">{index}</span> / {label}
      </p>
      <div className="md:col-span-9">
        <h2 className="max-w-3xl text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-medium tracking-[-0.04em] text-(--k-ink)">
          {title}
        </h2>
        {lede && <p className="mt-5 max-w-2xl text-(--k-muted)">{lede}</p>}
      </div>
    </Reveal>
  )
}

export function Tag({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'green' | 'blue' | 'yellow' | 'red'
  children: ReactNode
}) {
  const tones = {
    neutral: 'bg-(--k-sunken) text-(--k-ink-2)',
    green: 'bg-[#EDF3EC] text-[#346538]',
    blue: 'bg-[#E1F3FE] text-[#1F6C9F]',
    yellow: 'bg-[#FBF3DB] text-[#956400]',
    red: 'bg-[#FDEBEC] text-[#9F2F2D]',
  }
  return (
    <span
      className={`kmono inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium tracking-[0.06em] uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
