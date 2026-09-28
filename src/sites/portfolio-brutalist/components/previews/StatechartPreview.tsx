import { useState } from 'react'

type StateId = 'idle' | 'pristine' | 'dirty' | 'invalid' | 'saving' | 'saved' | 'error'
type Event = 'EDIT' | 'TYPE' | 'VALIDATE_FAIL' | 'SUBMIT' | 'CANCEL' | 'RESOLVE' | 'REJECT' | 'RETRY'

const MACHINE: Record<StateId, Partial<Record<Event, StateId>>> = {
  idle: { EDIT: 'pristine' },
  pristine: { TYPE: 'dirty', CANCEL: 'idle' },
  dirty: { TYPE: 'dirty', VALIDATE_FAIL: 'invalid', SUBMIT: 'saving', CANCEL: 'idle' },
  invalid: { TYPE: 'dirty', CANCEL: 'idle' },
  saving: { RESOLVE: 'saved', REJECT: 'error' },
  saved: { EDIT: 'pristine' },
  error: { RETRY: 'saving', EDIT: 'dirty' },
}

const EVENTS: Event[] = ['EDIT', 'TYPE', 'VALIDATE_FAIL', 'SUBMIT', 'CANCEL', 'RESOLVE', 'REJECT', 'RETRY']

/* Árbol: raíz EDITOR, estado compuesto EDITING con tres hijos. Coordenadas en unidades del viewBox. */
const TREE: { id: StateId | 'root' | 'editing'; label: string; x: number; y: number; parent?: string }[] = [
  { id: 'root', label: 'EDITOR', x: 12, y: 12 },
  { id: 'idle', label: 'IDLE', x: 40, y: 44, parent: 'root' },
  { id: 'editing', label: 'EDITING', x: 40, y: 76, parent: 'root' },
  { id: 'pristine', label: 'PRISTINE', x: 68, y: 108, parent: 'editing' },
  { id: 'dirty', label: 'DIRTY', x: 68, y: 140, parent: 'editing' },
  { id: 'invalid', label: 'INVALID', x: 68, y: 172, parent: 'editing' },
  { id: 'saving', label: 'SAVING', x: 40, y: 204, parent: 'root' },
  { id: 'saved', label: 'SAVED', x: 40, y: 236, parent: 'root' },
  { id: 'error', label: 'ERROR', x: 40, y: 268, parent: 'root' },
]

const BOX_W = 120
const BOX_H = 22
const byId = Object.fromEntries(TREE.map((n) => [n.id, n]))

export function StatechartPreview() {
  const [state, setState] = useState<StateId>('idle')
  const [trail, setTrail] = useState<string[]>(['init → IDLE'])
  const inEditing = state === 'pristine' || state === 'dirty' || state === 'invalid'

  const send = (e: Event) => {
    const target = MACHINE[state][e]
    if (!target) return
    setTrail((t) => [`${e} : ${state.toUpperCase()} → ${target.toUpperCase()}`, ...t].slice(0, 6))
    setState(target)
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[15rem_1fr]">
      <svg viewBox="0 0 144 300" className="h-[300px] w-full border border-current" role="img" aria-label={`Árbol de estados; estado actual ${state}`}>
        {TREE.filter((n) => n.parent).map((n) => {
          const p = byId[n.parent!]
          const px = p.x + 8
          return (
            <path
              key={`e-${n.id}`}
              d={`M${px} ${p.y + BOX_H} V${n.y + BOX_H / 2} H${n.x}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={n.id === state || (n.id === 'editing' && inEditing) ? 2 : 1}
            />
          )
        })}
        {TREE.map((n) => {
          const current = n.id === state
          const ancestor = n.id === 'root' || (n.id === 'editing' && inEditing)
          return (
            <g key={n.id}>
              <rect
                x={n.x}
                y={n.y}
                width={BOX_W - (n.x - 12)}
                height={BOX_H}
                fill={current ? 'var(--b-red)' : ancestor ? 'currentColor' : 'var(--b-bg)'}
                stroke={current ? 'var(--b-red)' : 'currentColor'}
              />
              <text
                x={n.x + 7}
                y={n.y + 15}
                fontSize="9.5"
                fontFamily="var(--b-mono)"
                letterSpacing="0.8"
                fill={current ? '#fff' : ancestor ? 'var(--b-bg)' : 'currentColor'}
              >
                {n.label}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="bm flex flex-col gap-3">
        <p className="text-[11px] normal-case tracking-normal">
          Solo los eventos válidos para el estado actual están habilitados. Los imposibles no existen.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {EVENTS.map((e) => (
            <button key={e} className="b-btn px-2! py-1!" disabled={!MACHINE[state][e]} onClick={() => send(e)}>
              {e}
            </button>
          ))}
        </div>
        <ol className="space-y-1 border-t border-current pt-2 text-[10px]" aria-live="polite">
          {trail.map((t, i) => (
            <li key={`${t}-${i}`} className={i === 0 ? 'text-(--b-red-ink)' : ''}>
              {String(trail.length - i).padStart(2, '0')} {t}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
