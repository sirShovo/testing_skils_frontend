import { useContext, useEffect, useState, type ReactNode } from 'react'
import { PROFILE } from '../data'
import { ThemeContext, type Theme } from '../theme'

/* Monograma LV: marco, L de dos barras (el pie en rojo) y V de dos trapecios. */
export function Monogram({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Monograma LV">
      <rect x="1" y="1" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="5" width="4" height="22" fill="currentColor" />
      <rect x="5" y="23" width="9" height="4" fill="var(--b-red)" />
      <path d="M15 5h3.6l3.2 14.5L25 5h3.6l-4.9 22h-3.8Z" fill="currentColor" />
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
      k: `${PROFILE.city} · UTC−5`,
      v: (
        <time dateTime={now.toISOString()} className="tabular-nums">
          {time}
        </time>
      ),
    },
    {
      k: 'Respecto a ti',
      v: delta === 0 ? 'Misma hora' : `${delta > 0 ? '+' : '−'}${Math.abs(delta)} h`,
    },
    {
      k: 'Estado',
      v: (
        <span className="inline-flex items-center gap-2">
          <span className={`inline-block size-2 ${awake ? 'bg-(--b-red)' : 'border border-current'}`} />
          {awake ? 'En horario' : 'Fuera de horario'}
        </span>
      ),
    },
    { k: 'Disponibilidad', v: PROFILE.availability },
    {
      k: 'Sesión',
      v: (
        <output className="tabular-nums">
          {pad(Math.floor(session / 3600))}:{pad(Math.floor(session / 60) % 60)}:{pad(session % 60)}
        </output>
      ),
    },
  ]

  return (
    <header className="sticky top-0 z-40 border-b-2 border-(--b-fg) bg-(--b-bg)">
      <div className="grid grid-cols-[auto_1fr_auto] items-stretch">
        <a href="#top" className="flex items-center gap-3 border-r border-(--b-fg) px-4 py-2.5 hover:bg-(--b-fg) hover:text-(--b-bg) md:px-5">
          <Monogram className="size-8" />
          <span className="bm hidden leading-tight sm:block">
            {PROFILE.name}
            <br />
            <span className="text-(--b-mute)">{PROFILE.unit}</span>
          </span>
        </a>

        <dl className="bm hidden grid-cols-5 xl:grid">
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
            <dt className="sr-only">Hora local</dt>
            <dd className="tabular-nums">{time}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Estado</dt>
            <span className={`inline-block size-2 ${awake ? 'bg-(--b-red)' : 'border border-current'}`} />
            <dd className="hidden sm:block">{awake ? 'En horario' : 'Fuera'}</dd>
          </div>
        </dl>

        <ThemeSwitch theme={theme} onChange={setTheme} />
      </div>
    </header>
  )
}

function ThemeSwitch({ theme, onChange }: { theme: Theme; onChange: (t: Theme) => void }) {
  return (
    <div role="radiogroup" aria-label="Tema" className="bm flex items-stretch">
      {(['light', 'dark'] as const).map((t) => {
        const active = t === theme
        return (
          <button
            key={t}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(t)}
            className={`border-l border-(--b-fg) px-3 transition-colors duration-75 md:px-4 ${
              active ? 'bg-(--b-fg) text-(--b-bg)' : 'hover:bg-(--b-faint)'
            }`}
          >
            <span aria-hidden="true">{active ? '■' : '□'}</span> {t === 'light' ? 'Papel' : 'Carbón'}
          </button>
        )
      })}
    </div>
  )
}
