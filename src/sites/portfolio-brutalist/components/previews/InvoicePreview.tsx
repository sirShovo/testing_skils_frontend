import { useState } from 'react'
import { useI18n, type L } from '../../i18n'

type StateId = 'draft' | 'validating' | 'signed' | 'sent' | 'accepted' | 'rejected' | 'credited'
type Event = 'VALIDATE' | 'FAIL' | 'SIGN' | 'SEND' | 'ACCEPT' | 'REJECT' | 'CORRECT' | 'CREDIT_NOTE'

// Ciclo de vida simplificado de una factura electrónica ante la DIAN.
const MACHINE: Record<StateId, Partial<Record<Event, StateId>>> = {
  draft: { VALIDATE: 'validating' },
  validating: { SIGN: 'signed', FAIL: 'draft' },
  signed: { SEND: 'sent' },
  sent: { ACCEPT: 'accepted', REJECT: 'rejected' },
  rejected: { CORRECT: 'draft' },
  accepted: { CREDIT_NOTE: 'credited' },
  credited: {},
}

const EVENTS: Event[] = ['VALIDATE', 'FAIL', 'SIGN', 'SEND', 'ACCEPT', 'REJECT', 'CORRECT', 'CREDIT_NOTE']

type TreeId = StateId | 'root' | 'processing'

/* Árbol: raíz FACTURA con el estado compuesto EN PROCESO (validación, firma, envío). */
const TREE: { id: TreeId; label: L; x: number; y: number; parent?: TreeId }[] = [
  { id: 'root', label: { es: 'FACTURA', en: 'INVOICE' }, x: 12, y: 12 },
  { id: 'draft', label: { es: 'BORRADOR', en: 'DRAFT' }, x: 40, y: 44, parent: 'root' },
  { id: 'processing', label: { es: 'EN PROCESO', en: 'PROCESSING' }, x: 40, y: 76, parent: 'root' },
  { id: 'validating', label: { es: 'VALIDANDO', en: 'VALIDATING' }, x: 68, y: 108, parent: 'processing' },
  { id: 'signed', label: { es: 'FIRMADA', en: 'SIGNED' }, x: 68, y: 140, parent: 'processing' },
  { id: 'sent', label: { es: 'ENVIADA DIAN', en: 'SENT TO DIAN' }, x: 68, y: 172, parent: 'processing' },
  { id: 'accepted', label: { es: 'ACEPTADA', en: 'ACCEPTED' }, x: 40, y: 204, parent: 'root' },
  { id: 'rejected', label: { es: 'RECHAZADA', en: 'REJECTED' }, x: 40, y: 236, parent: 'root' },
  { id: 'credited', label: { es: 'NOTA CRÉDITO', en: 'CREDIT NOTE' }, x: 40, y: 268, parent: 'root' },
]

const RIGHT = 172
const BOX_H = 22
const byId = Object.fromEntries(TREE.map((n) => [n.id, n])) as Record<TreeId, (typeof TREE)[number]>

export function InvoicePreview() {
  const { t, lang } = useI18n()
  const [state, setState] = useState<StateId>('draft')
  const [trail, setTrail] = useState<{ ev: Event | 'init'; from?: StateId; to: StateId }[]>([{ ev: 'init', to: 'draft' }])
  const inProcess = state === 'validating' || state === 'signed' || state === 'sent'

  const send = (e: Event) => {
    const target = MACHINE[state][e]
    if (!target) return
    setTrail((tr) => [{ ev: e, from: state, to: target }, ...tr].slice(0, 6))
    setState(target)
  }

  const name = (id: StateId) => t(byId[id].label)

  return (
    <div className="grid gap-4 sm:grid-cols-[15rem_1fr]">
      <svg
        viewBox={`0 0 ${RIGHT + 8} 300`}
        className="h-[300px] w-full border border-current"
        role="img"
        aria-label={`${lang === 'es' ? 'Estado actual' : 'Current state'}: ${name(state)}`}
      >
        {TREE.filter((n) => n.parent).map((n) => {
          const p = byId[n.parent!]
          const bold = n.id === state || (n.id === 'processing' && inProcess)
          return <path key={`e-${n.id}`} d={`M${p.x + 8} ${p.y + BOX_H} V${n.y + BOX_H / 2} H${n.x}`} fill="none" stroke="currentColor" strokeWidth={bold ? 2 : 1} />
        })}
        {TREE.map((n) => {
          const current = n.id === state
          const ancestor = n.id === 'root' || (n.id === 'processing' && inProcess)
          return (
            <g key={n.id}>
              <rect
                x={n.x}
                y={n.y}
                width={RIGHT - n.x}
                height={BOX_H}
                fill={current ? 'var(--b-red)' : ancestor ? 'currentColor' : 'var(--b-bg)'}
                stroke={current ? 'var(--b-red)' : 'currentColor'}
              />
              <text x={n.x + 7} y={n.y + 15} fontSize="9.5" fontFamily="var(--b-mono)" letterSpacing="0.6" fill={current ? '#fff' : ancestor ? 'var(--b-bg)' : 'currentColor'}>
                {t(n.label)}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="bm flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {EVENTS.map((e) => (
            <button key={e} className="b-btn px-2! py-1!" disabled={!MACHINE[state][e]} onClick={() => send(e)}>
              {e}
            </button>
          ))}
        </div>
        {state === 'credited' && (
          <button className="b-btn self-start" onClick={() => (setState('draft'), setTrail([{ ev: 'init', to: 'draft' }]))}>
            {lang === 'es' ? '[ Nueva factura ]' : '[ New invoice ]'}
          </button>
        )}
        <ol className="space-y-1 border-t border-current pt-2 text-[10px]" aria-live="polite">
          {trail.map((s, i) => (
            <li key={`${s.ev}-${trail.length - i}`} className={i === 0 ? 'text-(--b-red-ink)' : ''}>
              {String(trail.length - i).padStart(2, '0')} {s.ev === 'init' ? `init → ${name(s.to)}` : `${s.ev} : ${name(s.from!)} → ${name(s.to)}`}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
