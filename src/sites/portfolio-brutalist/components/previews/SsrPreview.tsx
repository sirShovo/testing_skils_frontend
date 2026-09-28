import { useEffect, useRef, useState } from 'react'
import { useI18n, type L } from '../../i18n'

type Mode = 'csr' | 'ssr'
type Phase = { label: L; from: number; to: number; main?: boolean }

const TOTAL = 4000 // ms en la línea de tiempo

// Tiempos ilustrativos: LCP 3.4 s en CSR frente a 1.0 s en SSR (−70 %).
const PHASES: Record<Mode, Phase[]> = {
  csr: [
    { label: { es: 'HTML vacío', en: 'Empty HTML' }, from: 0, to: 300 },
    { label: { es: 'Descarga JS', en: 'JS download' }, from: 300, to: 1500 },
    { label: { es: 'Parse + ejecución', en: 'Parse + execute' }, from: 1500, to: 2300, main: true },
    { label: { es: 'Fetch a la API', en: 'API fetch' }, from: 2300, to: 3100 },
    { label: { es: 'Render', en: 'Render' }, from: 3100, to: 3400, main: true },
  ],
  ssr: [
    { label: { es: 'Render en servidor', en: 'Server render' }, from: 0, to: 700 },
    { label: { es: 'HTML con contenido', en: 'HTML with content' }, from: 700, to: 1000 },
    { label: { es: 'Descarga JS', en: 'JS download' }, from: 1000, to: 1700 },
    { label: { es: 'Hidratación', en: 'Hydration' }, from: 1700, to: 2100, main: true },
  ],
}

const MARKS: Record<Mode, { lcp: number; tti: number }> = {
  csr: { lcp: 3400, tti: 3400 },
  ssr: { lcp: 1000, tti: 2100 },
}

/* Lo que ve el usuario en el instante t. */
function Screen({ mode, t }: { mode: Mode; t: number }) {
  const { lcp, tti } = MARKS[mode]
  const painted = t >= lcp
  const interactive = t >= tti
  return (
    <div className="flex h-full flex-col border border-current">
      <div className="flex items-center gap-1 border-b border-current px-1.5 py-1">
        <span className="size-1.5 border border-current" />
        <span className="size-1.5 border border-current" />
        <span className="ml-1 h-1.5 flex-1 border border-current" />
      </div>
      <div className="flex-1 space-y-1.5 p-2">
        {painted ? (
          <>
            <div className="h-3 w-3/4 bg-current" />
            <div className="h-1.5 w-full bg-current opacity-40" />
            <div className="h-1.5 w-5/6 bg-current opacity-40" />
            <div className="grid grid-cols-3 gap-1 pt-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="aspect-square border border-current" />
              ))}
            </div>
            <div className={`mt-1 h-3 w-1/2 ${interactive ? 'bg-(--b-red)' : 'border border-dashed border-current'}`} />
          </>
        ) : t > 300 && mode === 'csr' ? (
          <div className="grid h-full place-items-center">
            <span className="size-3 animate-spin border-2 border-current border-t-transparent" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function SsrPreview() {
  const { t: tr, lang } = useI18n()
  const [mode, setMode] = useState<Mode>('csr')
  const [time, setTime] = useState(TOTAL)
  const timer = useRef(0)

  // setInterval en vez de rAF: la demo sigue avanzando aunque la pestaña esté en segundo plano.
  const play = (m: Mode) => {
    window.clearInterval(timer.current)
    setMode(m)
    setTime(0)
    const start = performance.now()
    timer.current = window.setInterval(() => {
      const elapsed = (performance.now() - start) * 1.2
      setTime(Math.min(elapsed, TOTAL))
      if (elapsed >= TOTAL) window.clearInterval(timer.current)
    }, 30)
  }
  useEffect(() => () => window.clearInterval(timer.current), [])

  const W = 400
  const ROW = 18
  const phases = PHASES[mode]
  const { lcp, tti } = MARKS[mode]
  const x = (ms: number) => (ms / TOTAL) * W
  const H = phases.length * ROW + 34

  return (
    <div className="space-y-3">
      <div className="bm flex flex-wrap items-center gap-2">
        <button className="b-btn" aria-pressed={mode === 'csr'} onClick={() => play('csr')}>
          CSR
        </button>
        <button className="b-btn" aria-pressed={mode === 'ssr'} onClick={() => play('ssr')}>
          SSR
        </button>
        <output className="ml-auto tabular-nums">
          LCP {(lcp / 1000).toFixed(1)} s · {lang === 'es' ? 'interactiva' : 'interactive'} {(tti / 1000).toFixed(1)} s
        </output>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_7.5rem]">
        <svg viewBox={`0 0 ${W + 110} ${H}`} className="w-full border border-current" role="img" aria-label={`${mode.toUpperCase()}: LCP ${lcp} ms`}>
          <g transform="translate(104 8)">
            {[0, 1000, 2000, 3000, 4000].map((ms) => (
              <g key={ms}>
                <line x1={x(ms)} x2={x(ms)} y1="0" y2={H - 24} stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                <text x={x(ms)} y={H - 12} fontSize="8" fontFamily="var(--b-mono)" fill="currentColor" textAnchor="middle">
                  {ms / 1000}s
                </text>
              </g>
            ))}
            {phases.map((p, i) => {
              const shown = Math.max(0, Math.min(time, p.to) - p.from)
              return (
                <g key={i}>
                  <text x="-98" y={i * ROW + 12} fontSize="8.5" fontFamily="var(--b-mono)" fill="currentColor" letterSpacing="0.4">
                    {tr(p.label).toUpperCase()}
                  </text>
                  <rect x={x(p.from)} y={i * ROW + 3} width={x(p.to) - x(p.from)} height={ROW - 7} fill="none" stroke="currentColor" strokeWidth="0.75" />
                  <rect x={x(p.from)} y={i * ROW + 3} width={x(shown)} height={ROW - 7} fill={p.main ? 'var(--b-red)' : 'currentColor'} />
                </g>
              )
            })}
            <line x1={x(lcp)} x2={x(lcp)} y1="-4" y2={H - 24} stroke="var(--b-red)" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x={x(lcp) + 3} y={H - 26} fontSize="8" fontFamily="var(--b-mono)" fill="var(--b-red)">
              LCP
            </text>
            <line x1={x(time)} x2={x(time)} y1="-4" y2={H - 24} stroke="currentColor" strokeWidth="1.5" />
          </g>
        </svg>
        <div className="flex flex-col gap-1">
          <div className="aspect-[3/4]">
            <Screen mode={mode} t={time} />
          </div>
          <p className="bm text-center text-[10px] tabular-nums">{(time / 1000).toFixed(2)} s</p>
        </div>
      </div>
    </div>
  )
}
