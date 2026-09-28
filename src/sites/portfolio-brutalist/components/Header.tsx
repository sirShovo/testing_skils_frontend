import { useContext, useEffect, useState, type ReactNode } from 'react'
import { PROFILE } from '../data'
import { useI18n, type Lang } from '../i18n'
import { ThemeContext, type Theme } from '../theme'

/* Monograma SA: S de cinco barras y A de dos trapecios con el travesaño en rojo. */
export function Monogram({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Monograma SA">
      <rect x="1" y="1" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" />
      <g fill="currentColor">
        <rect x="5" y="5" width="9" height="3" />
        <rect x="5" y="5" width="3" height="12" />
        <rect x="5" y="14.5" width="9" height="3" />
        <rect x="11" y="14.5" width="3" height="12.5" />
        <rect x="5" y="24" width="9" height="3" />
        <path d="M16 27 20.2 5h2.6L27 27h-3.1l-2.4-14.5L19.1 27Z" />
      </g>
      <rect x="17.4" y="19" width="8.2" height="3" fill="var(--b-red)" />
    </svg>
  )
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])
  return now
}

// Desfase en horas entre la zona del perfil y la del visitante.
function offsetHours(tz: string, at: Date) {
  const inTz = new Date(at.toLocaleString('en-US', { timeZone: tz }))
  const local = new Date(at.toLocaleString('en-US'))
  return Math.round((inTz.getTime() - local.getTime()) / 3_600_000)
}

const pad = (n: number) => String(n).padStart(2, '0')

export function Header({ startedAt }: { startedAt: number }) {
  const now = useNow()
  const { theme, setTheme } = useContext(ThemeContext)
  const { lang, setLang, t, ui } = useI18n()
  const time = now.toLocaleTimeString('es-CO', {
    timeZone: PROFILE.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const hour = Number(now.toLocaleString('en-US', { timeZone: PROFILE.timeZone, hour: 'numeric', hour12: false }))
  const awake = hour >= 8 && hour < 19
  const delta = offsetHours(PROFILE.timeZone, now)
  const session = Math.floor((now.getTime() - startedAt) / 1000)

  const cells: { k: string; v: ReactNode }[] = [
    {
      k: ui.tzLabel,
      v: (
        <time dateTime={now.toISOString()} className="tabular-nums">
          {time}
        </time>
      ),
    },
    { k: ui.relative, v: delta === 0 ? ui.sameTime : `${delta > 0 ? '+' : '−'}${Math.abs(delta)} h` },
    {
      k: ui.status,
      v: (
        <span className="inline-flex items-center gap-2">
          <span className={`inline-block size-2 ${awake ? 'bg-(--b-red)' : 'border border-current'}`} />
          {awake ? ui.inHours : ui.offHours}
        </span>
      ),
    },
    { k: ui.current, v: t(PROFILE.current) },
    {
      k: ui.session,
      v: (
        <output className="tabular-nums">
          {pad(Math.floor(session / 3600))}:{pad(Math.floor(session / 60) % 60)}:{pad(session % 60)}
        </output>
      ),
    },
  ]

  return (
    <header className="sticky top-0 z-40 border-b-2 border-(--b-fg) bg-(--b-bg)">
      <div className="grid grid-cols-[auto_1fr_auto_auto] items-stretch">
        <a href="#top" className="flex items-center gap-3 border-r border-(--b-fg) px-4 py-2.5 hover:bg-(--b-fg) hover:text-(--b-bg) md:px-5">
          <Monogram className="size-8" />
          <span className="bm hidden leading-tight sm:block">
            {PROFILE.name}
            <br />
            <span className="text-(--b-mute)">{PROFILE.unit}</span>
          </span>
        </a>

        <dl className="bm hidden grid-cols-[1fr_1fr_1fr_1.7fr_1fr] xl:grid">
          {cells.map((c) => (
            <div key={c.k} className="flex flex-col justify-center border-r border-(--b-fg) px-4 py-2">
              <dt className="text-[10px] text-(--b-mute)">{c.k}</dt>
              <dd className="mt-0.5 text-(--b-fg)">{c.v}</dd>
            </div>
          ))}
        </dl>
        {/* En pantallas pequeñas solo la hora y el estado. */}
        <dl className="bm flex items-center gap-4 px-4 xl:hidden">
          <div>
            <dt className="sr-only">{ui.tzLabel}</dt>
            <dd className="tabular-nums">{time}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">{ui.status}</dt>
            <span className={`inline-block size-2 ${awake ? 'bg-(--b-red)' : 'border border-current'}`} />
            <dd className="hidden sm:block">{awake ? ui.inHours : ui.offShort}</dd>
          </div>
        </dl>

        <Switch
          label={ui.language}
          value={lang}
          options={[
            { v: 'es', l: 'ES' },
            { v: 'en', l: 'EN' },
          ]}
          onChange={(v) => setLang(v as Lang)}
        />
        <Switch
          label={ui.theme}
          value={theme}
          options={[
            { v: 'light', l: ui.paper },
            { v: 'dark', l: ui.carbon },
          ]}
          onChange={(v) => setTheme(v as Theme)}
          compact
        />
      </div>
    </header>
  )
}

function Switch({
  label,
  value,
  options,
  onChange,
  compact = false,
}: {
  label: string
  value: string
  options: { v: string; l: string }[]
  onChange: (v: string) => void
  /** En móvil muestra solo la inicial para ahorrar espacio. */
  compact?: boolean
}) {
  return (
    <div role="radiogroup" aria-label={label} className="bm flex items-stretch">
      {options.map((o) => {
        const active = o.v === value
        return (
          <button
            key={o.v}
            role="radio"
            aria-checked={active}
            aria-label={o.l}
            onClick={() => onChange(o.v)}
            className={`border-l border-(--b-fg) px-2.5 transition-colors duration-75 md:px-4 ${
              active ? 'bg-(--b-fg) text-(--b-bg)' : 'hover:bg-(--b-faint)'
            }`}
          >
            <span aria-hidden="true">{active ? '■' : '□'} </span>
            {compact ? (
              <>
                <span className="hidden sm:inline">{o.l}</span>
                <span className="sm:hidden" aria-hidden="true">
                  {o.l[0]}
                </span>
              </>
            ) : (
              o.l
            )}
          </button>
        )
      })}
    </div>
  )
}
