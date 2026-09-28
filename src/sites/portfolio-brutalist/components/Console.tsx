import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { HISTORY, PRINCIPLES, PROFILE, PROJECTS, STACK } from '../data'
import type { Theme } from '../theme'

type Line = { kind: 'in' | 'out' | 'err'; text: ReactNode }

const PROMPT = `lena@${PROFILE.unit.toLowerCase()}:~$`

const COMMANDS: Record<string, string> = {
  help: 'Lista de comandos',
  whoami: 'Quién soy',
  ls: 'Proyectos del índice',
  open: 'open <n|nombre> · despliega un proyecto',
  close: 'Cierra el proyecto abierto',
  log: 'Historial profesional (git log)',
  stack: 'Herramientas por área',
  principles: 'Los cinco principios',
  contact: 'Cómo escribirme',
  theme: 'theme <papel|carbon>',
  history: 'Comandos de esta sesión',
  date: 'Hora en Medellín',
  clear: 'Limpia la consola',
}

type Actions = {
  openProject: (id: string | null) => void
  setTheme: (t: Theme) => void
  theme: Theme
}

function run(raw: string, history: string[], a: Actions): Line[] | 'clear' {
  const [cmd, ...args] = raw.trim().split(/\s+/)
  const arg = args.join(' ').toLowerCase()
  switch (cmd.toLowerCase()) {
    case '':
      return []
    case 'help':
      return Object.entries(COMMANDS).map(([k, v]) => ({ kind: 'out', text: `${k.padEnd(12, ' ')}${v}` }))
    case 'whoami':
      return [
        { kind: 'out', text: `${PROFILE.name.toUpperCase()} — ${PROFILE.role}` },
        { kind: 'out', text: `${PROFILE.city}, ${PROFILE.country} · ${PROFILE.availability}` },
      ]
    case 'ls':
      return PROJECTS.map((p) => ({ kind: 'out', text: `${p.no}  ${p.name.toUpperCase().padEnd(12, ' ')}${String(p.year).padEnd(6, ' ')}${p.domain}` }))
    case 'open': {
      const p = PROJECTS.find((x) => x.no === arg.padStart(2, '0') || x.name.toLowerCase() === arg || x.id === arg)
      if (!p) return [{ kind: 'err', text: `open: "${arg || '?'}" no existe. Prueba: ls` }]
      a.openProject(p.id)
      return [{ kind: 'out', text: `→ desplegando ${p.no} / ${p.name.toUpperCase()}` }]
    }
    case 'close':
      a.openProject(null)
      return [{ kind: 'out', text: 'Índice plegado.' }]
    case 'log':
    case 'git':
      return HISTORY.flatMap((h) => [
        { kind: 'out' as const, text: <span className="text-(--b-red-ink)">commit {h.hash}</span> },
        { kind: 'out' as const, text: `Date:   ${h.date}` },
        { kind: 'out' as const, text: `    ${h.msg}` },
      ])
    case 'stack':
      return Object.entries(STACK).map(([k, v]) => ({ kind: 'out', text: `${k.padEnd(14, ' ')}${v.join(' · ')}` }))
    case 'principles':
      return PRINCIPLES.map((p) => ({ kind: 'out', text: `${p.no}  ${p.title}` }))
    case 'contact':
      return [
        { kind: 'out', text: `email   ${PROFILE.email}` },
        { kind: 'out', text: 'pgp     4F2A 9C1E 77B0 D3E5' },
      ]
    case 'theme': {
      const t: Theme | null = arg === 'papel' || arg === 'light' ? 'light' : arg === 'carbon' || arg === 'carbón' || arg === 'dark' ? 'dark' : !arg ? (a.theme === 'light' ? 'dark' : 'light') : null
      if (!t) return [{ kind: 'err', text: 'theme: usa papel o carbon' }]
      a.setTheme(t)
      return [{ kind: 'out', text: `Sustrato: ${t === 'light' ? 'PAPEL' : 'CARBÓN'}` }]
    }
    case 'history':
      return history.length
        ? history.map((h, i) => ({ kind: 'out', text: `${String(i + 1).padStart(3, ' ')}  ${h}` }))
        : [{ kind: 'out', text: '(vacío)' }]
    case 'date':
      return [{ kind: 'out', text: new Date().toLocaleString('es-CO', { timeZone: PROFILE.timeZone, dateStyle: 'full', timeStyle: 'medium' }) }]
    case 'clear':
      return 'clear'
    case 'sudo':
      return [{ kind: 'err', text: 'sudo: este incidente será reportado.' }]
    default:
      return [{ kind: 'err', text: `${cmd}: comando no encontrado. Escribe help.` }]
  }
}

const WELCOME: Line[] = [
  { kind: 'out', text: `${PROFILE.unit} ${PROFILE.rev} — consola del perfil` },
  { kind: 'out', text: 'Escribe help para ver los comandos. Tab completa, ↑ ↓ recorren el historial.' },
]

export function Console({ open, setOpen, actions }: { open: boolean; setOpen: (o: boolean) => void; actions: Actions }) {
  const [lines, setLines] = useState<Line[]>(WELCOME)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [cursor, setCursor] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  const submit = () => {
    const nextHistory = input.trim() ? [...history, input.trim()] : history
    const out = run(input, nextHistory, actions)
    setHistory(nextHistory)
    setCursor(null)
    setInput('')
    if (out === 'clear') setLines([])
    else setLines((l) => [...l, { kind: 'in', text: input }, ...out])
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit()
    else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault()
      const i = cursor === null ? history.length - 1 : Math.max(cursor - 1, 0)
      setCursor(i)
      setInput(history[i])
    } else if (e.key === 'ArrowDown' && cursor !== null) {
      e.preventDefault()
      const i = cursor + 1
      if (i >= history.length) {
        setCursor(null)
        setInput('')
      } else {
        setCursor(i)
        setInput(history[i])
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const matches = Object.keys(COMMANDS).filter((c) => c.startsWith(input.trim()))
      if (matches.length === 1) setInput(`${matches[0]} `)
      else if (matches.length > 1) setLines((l) => [...l, { kind: 'out', text: matches.join('   ') }])
    } else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <aside
      aria-label="Consola del perfil"
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-(--b-fg) bg-(--b-bg) text-(--b-fg)"
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="console-body"
        className="bm grid w-full grid-cols-[auto_1fr_auto] items-center text-left hover:bg-(--b-fg) hover:text-(--b-bg)"
      >
        <span className="border-r border-current bg-(--b-red) px-4 py-2.5 text-white">[ Consola ]</span>
        <span className="truncate px-4 normal-case tracking-normal">
          {PROMPT} <span className="opacity-70">{open ? 'Esc para plegar' : `${history.length} comandos · pulsa \` para abrir`}</span>
        </span>
        <span className="border-l border-current px-4 py-2.5" aria-hidden="true">
          {open ? '▼' : '▲'}
        </span>
      </button>

      {open && (
        <div id="console-body" className="border-t border-(--b-fg)">
          <div
            ref={scrollRef}
            className="h-[min(42vh,380px)] overflow-y-auto px-4 py-3 font-(family-name:--b-mono) text-[12.5px] leading-[1.55]"
            onClick={() => inputRef.current?.focus()}
          >
            {lines.map((l, i) => (
              <div key={i} className={`whitespace-pre-wrap ${l.kind === 'err' ? 'text-(--b-red-ink)' : ''}`}>
                {l.kind === 'in' ? (
                  <>
                    <span className="text-(--b-mute)">{PROMPT}</span> {l.text}
                  </>
                ) : (
                  l.text
                )}
              </div>
            ))}
            <label className="flex items-center gap-2">
              <span className="shrink-0 text-(--b-mute)">{PROMPT}</span>
              <span className="relative flex-1">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Comando"
                  className="w-full bg-transparent caret-transparent outline-none"
                />
                <span
                  aria-hidden="true"
                  className="b-blink pointer-events-none absolute top-[2px] h-[1.1em] w-[0.6em] bg-(--b-red)"
                  style={{ left: `${input.length}ch` }}
                />
              </span>
            </label>
          </div>
        </div>
      )}
    </aside>
  )
}
