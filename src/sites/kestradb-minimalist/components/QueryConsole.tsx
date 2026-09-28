import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { PRESETS, SEED_HISTORY, SHARDS, type Lang, type Preset } from '../data'
import { IconPlay } from './primitives'

/* ------------------------------------------------------------------ */
/* Resaltado de sintaxis mínimo                                        */
/* ------------------------------------------------------------------ */

const KEYWORDS: Record<Lang, Set<string>> = {
  py: new Set(['from', 'import', 'def', 'return', 'None', 'True', 'False']),
  sql: new Set(['SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'LIMIT', 'AND', 'DESC']),
  ts: new Set(['import', 'from', 'const', 'await', 'let', 'return', 'true', 'false']),
}

const TOKEN =
  /(#.*$|--.*$|\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)(?=\()|([A-Za-z_]\w*)/g

function highlight(line: string, lang: Lang) {
  const out: { text: string; cls: string }[] = []
  let last = 0
  for (const m of line.matchAll(TOKEN)) {
    const i = m.index ?? 0
    if (i > last) out.push({ text: line.slice(last, i), cls: '' })
    const [text, comment, str, num, fn, ident] = m
    let cls = ''
    if (comment) cls = 'text-[#6F6C66] italic'
    else if (str) cls = 'text-[#D9C4A5]'
    else if (num) cls = 'text-[#A9C7B0]'
    else if (fn) cls = 'text-white'
    else if (ident && KEYWORDS[lang].has(ident)) cls = 'text-[#FF7A3D]'
    out.push({ text, cls })
    last = i + text.length
  }
  if (last < line.length) out.push({ text: line.slice(last), cls: '' })
  return out
}

/* ------------------------------------------------------------------ */
/* Simulación de ejecución                                             */
/* ------------------------------------------------------------------ */

type Run = {
  id: number
  stages: { id: string; label: string; ms: number; fanout?: boolean; shardMs?: number[] }[]
  total: number
  /** Cuántas etapas se han revelado; igual a stages.length cuando termina. */
  step: number
  done: boolean
}

const jitter = (v: number, spread = 0.18) => v * (1 - spread / 2 + Math.random() * spread)

function simulate(preset: Preset, id: number, randomize: boolean): Run {
  const stages = preset.stages.map((s) => {
    const ms = randomize ? jitter(s.ms) : s.ms
    // Cada shard tarda algo distinto; la etapa dura lo que tarda el más lento.
    const shardMs = s.fanout
      ? Array.from({ length: SHARDS }, (_, i) => ms * (0.55 + ((i * 37) % 11) / 24 + (randomize ? Math.random() * 0.08 : 0)))
      : undefined
    return { ...s, ms, shardMs }
  })
  const total = stages.reduce((a, s) => a + s.ms, 0)
  return { id, stages, total, step: randomize ? 0 : stages.length, done: !randomize }
}

const STEP_MS = 240

export function QueryConsole() {
  const [presetId, setPresetId] = useState(PRESETS[0].id)
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]
  const [run, setRun] = useState<Run>(() => simulate(PRESETS[0], 0, false))
  const [history, setHistory] = useState<number[]>(() => [...SEED_HISTORY, simulate(PRESETS[0], 0, false).total])
  const timers = useRef<number[]>([])
  const runCounter = useRef(0)

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  const execute = useCallback((target: Preset) => {
    clearTimers()
    const id = ++runCounter.current
    const next = simulate(target, id, true)
    setRun(next)
    next.stages.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => setRun((r) => (r.id === id ? { ...r, step: i + 1 } : r)), (i + 1) * STEP_MS),
      )
    })
    timers.current.push(
      window.setTimeout(() => {
        setRun((r) => (r.id === id ? { ...r, done: true } : r))
        setHistory((h) => [...h.slice(-39), next.total])
      }, (next.stages.length + 1) * STEP_MS),
    )
  }, [])

  useEffect(() => clearTimers, [])

  // Ctrl/⌘ + Enter ejecuta la consulta activa.
  const presetRef = useRef(preset)
  useEffect(() => {
    presetRef.current = preset
  }, [preset])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        execute(presetRef.current)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [execute])

  const selectPreset = (p: Preset) => {
    setPresetId(p.id)
    execute(p)
  }

  const lines = preset.code.split('\n')

  return (
    <div className="overflow-hidden rounded-[10px] border border-(--k-line-2) bg-(--k-surface)">
      {/* Cromo de ventana */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-(--k-line) px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#E3E1DC]" />
          <span className="size-2.5 rounded-full bg-[#E3E1DC]" />
          <span className="size-2.5 rounded-full bg-[#E3E1DC]" />
        </div>
        <div role="tablist" aria-label="Ejemplos de consulta" className="kmono order-last -mx-1 flex w-full min-w-0 gap-1 overflow-x-auto text-xs sm:order-none sm:mx-0 sm:w-auto">
          {PRESETS.map((p) => {
            const active = p.id === presetId
            return (
              <button
                key={p.id}
                role="tab"
                aria-selected={active}
                onClick={() => selectPreset(p)}
                className={`shrink-0 rounded-[4px] px-2.5 py-1 transition-colors ${
                  active ? 'bg-(--k-sunken) text-(--k-ink)' : 'text-(--k-muted) hover:text-(--k-ink)'
                }`}
              >
                {p.file}
              </button>
            )
          })}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="kmono hidden items-center gap-1 text-[11px] text-(--k-muted) sm:flex">
            <kbd className="rounded-[4px] border border-(--k-line) bg-(--k-bg) px-1.5 py-px">Ctrl</kbd>
            <kbd className="rounded-[4px] border border-(--k-line) bg-(--k-bg) px-1.5 py-px">Enter</kbd>
          </span>
          <button
            onClick={() => execute(preset)}
            disabled={!run.done}
            className="k-press kmono inline-flex items-center gap-1.5 rounded-[5px] bg-(--k-ink) px-3 py-1.5 text-xs text-white transition-colors hover:bg-[#333] disabled:bg-[#555]"
          >
            <IconPlay />
            {run.done ? 'Ejecutar' : 'Ejecutando'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Editor */}
        <div className="flex flex-col bg-(--k-editor) lg:col-span-7">
          <pre className="kmono flex-1 overflow-x-auto py-5 text-[12.5px] leading-[1.75] text-[#D6D3CC]">
            <code>
              {lines.map((line, i) => (
                <div key={`${presetId}-${i}`} className="flex pr-6">
                  <span className="w-10 shrink-0 pr-4 text-right text-[#4A4844] select-none">{i + 1}</span>
                  <span className="whitespace-pre">
                    {highlight(line, preset.lang).map((t, j) => (
                      <span key={j} className={t.cls}>
                        {t.text}
                      </span>
                    ))}
                    {i === lines.length - 1 && (
                      <span className="k-caret ml-px inline-block h-[1.1em] w-[7px] translate-y-[3px] bg-(--k-accent)" />
                    )}
                  </span>
                </div>
              ))}
            </code>
          </pre>
          <div className="kmono border-t border-white/10 px-5 py-4 text-[11.5px]">
            <p className="mb-2 tracking-[0.08em] text-[#6F6C66] uppercase">Explain</p>
            <dl className="grid grid-cols-[6rem_1fr] gap-y-1">
              {preset.plan.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-[#6F6C66]">{k}</dt>
                  <dd className={run.done ? 'text-[#D6D3CC]' : 'text-[#4A4844]'}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Resultados + latencia */}
        <div className="flex flex-col border-t border-(--k-line) lg:col-span-5 lg:border-t-0 lg:border-l">
          <Results preset={preset} run={run} />
          <Waterfall run={run} />
          <LatencyGraph history={history} live={run.done ? run.total : null} />
        </div>
      </div>

      {/* Barra de estado */}
      <div className="kmono flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-(--k-line) bg-(--k-bg) px-4 py-2 text-[11px] text-(--k-muted)">
        <span className="flex items-center gap-1.5">
          <span className="k-pulse size-1.5 rounded-full bg-[#346538]" />
          prod-eu
        </span>
        <span>{SHARDS} shards</span>
        <span>1.1B vectores</span>
        <span>{preset.collection}</span>
        <span className="ml-auto text-(--k-ink)">
          {run.done ? `${run.total.toFixed(2)} ms` : '—'}
        </span>
      </div>
    </div>
  )
}

function Results({ preset, run }: { preset: Preset; run: Run }) {
  return (
    <div className="border-b border-(--k-line) px-5 py-4">
      <div className="kmono mb-3 flex flex-wrap items-baseline justify-between gap-x-3 text-[11px] tracking-[0.06em] text-(--k-muted) uppercase">
        <span>Resultados · top 5</span>
        <span className="normal-case tracking-normal">
          {run.done ? `${preset.candidates.toLocaleString('es', { useGrouping: 'always' })} candidatos` : `buscando en ${SHARDS} shards`}
        </span>
      </div>
      <ol className="space-y-1.5" aria-live="polite">
        {preset.hits.map((hit, i) =>
          run.done ? (
            <li
              key={`${run.id}-${hit.id}`}
              className="k-row-in grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-3 text-[13px]"
              style={{ '--i': i } as CSSProperties}
            >
              <span className="kmono text-[11px] text-(--k-muted)">{hit.id}</span>
              <span className="truncate text-(--k-ink)">{hit.title}</span>
              <span className="kmono text-[11px] text-(--k-ink-2) tabular-nums">{hit.score.toFixed(3)}</span>
            </li>
          ) : (
            <li key={`sk-${i}`} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 py-[5px]">
              <span className="h-2 rounded-[2px] bg-(--k-sunken)" />
              <span className="h-2 rounded-[2px] bg-(--k-sunken)" style={{ width: `${88 - i * 9}%` }} />
              <span className="h-2 w-9 rounded-[2px] bg-(--k-sunken)" />
            </li>
          ),
        )}
      </ol>
    </div>
  )
}

function Waterfall({ run }: { run: Run }) {
  // Inicio de cada etapa = suma de las anteriores.
  const offsets = useMemo(
    () => run.stages.map((_, i) => run.stages.slice(0, i).reduce((a, s) => a + s.ms, 0)),
    [run.stages],
  )

  return (
    <div className="border-b border-(--k-line) px-5 py-4">
      <div className="kmono mb-3 flex justify-between text-[11px] tracking-[0.06em] text-(--k-muted) uppercase">
        <span>Desglose de latencia</span>
        <span className="normal-case tracking-normal tabular-nums">0 — {run.total.toFixed(2)} ms</span>
      </div>
      <ul className="space-y-[7px]">
        {run.stages.map((s, i) => {
          const shown = i < run.step
          const left = (offsets[i] / run.total) * 100
          const width = Math.max((s.ms / run.total) * 100, 0.8)
          return (
            <li key={s.id} className="grid grid-cols-[6.5rem_1fr_3.2rem] items-center gap-3">
              <span className="kmono truncate text-[11px] text-(--k-ink-2)">{s.label}</span>
              <span className="relative h-3">
                <span className="absolute inset-y-[5px] right-0 left-0 bg-(--k-line)" />
                <span className="absolute inset-y-0" style={{ left: `${left}%`, width: `${width}%` }}>
                  {s.shardMs ? (
                    <span className="flex h-full flex-col justify-between">
                      {s.shardMs.map((ms, k) => (
                        <span
                          key={k}
                          className="k-bar block h-px bg-(--k-accent)"
                          style={{
                            transform: `scaleX(${shown ? ms / Math.max(...s.shardMs!) : 0})`,
                            transitionDelay: `${k * 18}ms`,
                          }}
                        />
                      ))}
                    </span>
                  ) : (
                    <span
                      className="k-bar block h-full bg-(--k-ink)"
                      style={{ transform: `scaleX(${shown ? 1 : 0})` }}
                    />
                  )}
                </span>
              </span>
              <span className="kmono text-right text-[11px] text-(--k-muted) tabular-nums">
                {shown ? s.ms.toFixed(2) : '···'}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function LatencyGraph({ history, live }: { history: number[]; live: number | null }) {
  const W = 320
  const H = 84
  const max = 6
  const pts = history.map((v, i) => [(i / (history.length - 1)) * W, H - (v / max) * H] as const)
  const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
  const sorted = [...history].sort((a, b) => a - b)
  const p50 = sorted[Math.floor(sorted.length * 0.5)]
  const p99 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.99))]
  const [lx, ly] = pts[pts.length - 1]

  return (
    <div className="px-5 py-4">
      <div className="kmono mb-2 flex justify-between text-[11px] tracking-[0.06em] text-(--k-muted) uppercase">
        <span>Últimas {history.length} consultas</span>
        <span className="flex gap-3 normal-case tracking-normal tabular-nums">
          <span>p50 {p50.toFixed(2)}</span>
          <span className="text-(--k-ink)">p99 {p99.toFixed(2)} ms</span>
        </span>
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-[84px] w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Latencia de las últimas consultas; p99 ${p99.toFixed(2)} milisegundos`}
        >
          {[2, 4].map((v) => (
            <line key={v} x1="0" x2={W} y1={H - (v / max) * H} y2={H - (v / max) * H} stroke="var(--k-line)" vectorEffect="non-scaling-stroke" />
          ))}
          <line
            x1="0"
            x2={W}
            y1={H - (p99 / max) * H}
            y2={H - (p99 / max) * H}
            stroke="var(--k-ink)"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
            opacity="0.5"
          />
          <path d={path} fill="none" stroke="var(--k-ink-2)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* El punto va en HTML para no deformarse con preserveAspectRatio="none". */}
        {live !== null && (
          <span
            className="absolute size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--k-accent) ring-2 ring-(--k-surface)"
            style={{ left: `${(lx / W) * 100}%`, top: `${(ly / H) * 100}%` }}
          />
        )}
      </div>
      <div className="kmono mt-1 flex justify-between text-[10px] text-(--k-muted)">
        <span>−{history.length}</span>
        <span>ahora</span>
      </div>
    </div>
  )
}
