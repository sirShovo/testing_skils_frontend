import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { HISTORY, PRINCIPLES, PROFILE, PROJECTS, STACK } from '../data'
import { useI18n, type L, type Lang } from '../i18n'
import type { Theme } from '../theme'

type Line = { kind: 'in' | 'out' | 'err'; text: ReactNode }

const PROMPT = `sebastian@${PROFILE.unit.toLowerCase()}:~$`

const COMMANDS: Record<string, L> = {
  help: { es: 'Lista de comandos', en: 'List commands' },
  whoami: { es: 'Quién soy', en: 'Who I am' },
  ls: { es: 'Proyectos del índice', en: 'Projects in the index' },
  open: { es: 'open <n|nombre> · despliega un proyecto', en: 'open <n|name> · expand a project' },
  close: { es: 'Cierra el proyecto abierto', en: 'Collapse the open project' },
  log: { es: 'Historial profesional (git log)', en: 'Career history (git log)' },
  stack: { es: 'Herramientas por área', en: 'Tools by area' },
  principles: { es: 'Los cinco principios', en: 'The five principles' },
  contact: { es: 'Cómo contactarme', en: 'How to reach me' },
  theme: { es: 'theme <papel|carbon>', en: 'theme <paper|carbon>' },
  lang: { es: 'lang <es|en> · cambia el idioma', en: 'lang <es|en> · switch language' },
  history: { es: 'Comandos de esta sesión', en: 'Commands in this session' },
  date: { es: 'Hora en Medellín', en: 'Time in Medellín' },
  clear: { es: 'Limpia la consola', en: 'Clear the console' },
}

type Actions = {
  openProject: (id: string | null) => void
  setTheme: (t: Theme) => void
  theme: Theme
  setLang: (l: Lang) => void
}

function run(raw: string, history: string[], a: Actions, lang: Lang): Line[] | 'clear' {
  const t = (l: L) => l[lang]
  const es = lang === 'es'
  const [cmd, ...args] = raw.trim().split(/\s+/)
  const arg = args.join(' ').toLowerCase()
  switch (cmd.toLowerCase()) {
    case '':
      return []
    case 'help':
      return Object.entries(COMMANDS).map(([k, v]) => ({ kind: 'out', text: `${k.padEnd(12, ' ')}${t(v)}` }))
    case 'whoami':
      return [
        { kind: 'out', text: `${PROFILE.fullName.toUpperCase()} — ${PROFILE.role}` },
        { kind: 'out', text: `${PROFILE.city}, Colombia · ${t(PROFILE.current)}` },
      ]
    case 'ls':
      return PROJECTS.map((p) => ({ kind: 'out', text: `${p.no}  ${p.name.toUpperCase().padEnd(14, ' ')}${p.period.padEnd(13, ' ')}${t(p.domain)}` }))
    case 'open': {
      const p = PROJECTS.find((x) => x.no === arg.padStart(2, '0') || x.name.toLowerCase() === arg || x.id === arg)
      if (!p) return [{ kind: 'err', text: es ? `open: "${arg || '?'}" no existe. Prueba: ls` : `open: "${arg || '?'}" not found. Try: ls` }]
      a.openProject(p.id)
      return [{ kind: 'out', text: `→ ${es ? 'desplegando' : 'expanding'} ${p.no} / ${p.name.toUpperCase()}` }]
    }
    case 'close':
      a.openProject(null)
      return [{ kind: 'out', text: es ? 'Índice plegado.' : 'Index collapsed.' }]
    case 'log':
    case 'git':
      return HISTORY.flatMap((h) => [
        { kind: 'out' as const, text: <span className="text-(--b-red-ink)">commit {h.hash}</span> },
        { kind: 'out' as const, text: `Date:   ${h.date === 'now' ? (es ? 'actual' : 'current') : h.date}` },
        { kind: 'out' as const, text: `    ${t(h.msg)}` },
      ])
    case 'stack':
      return STACK.map((g) => ({ kind: 'out', text: `${t(g.key).padEnd(14, ' ')}${g.items.join(' · ')}` }))
    case 'principles':
      return PRINCIPLES.map((p) => ({ kind: 'out', text: `${p.no}  ${t(p.title)}` }))
    case 'contact':
      return [
        { kind: 'out', text: `email     ${PROFILE.email}` },
        { kind: 'out', text: `linkedin  ${PROFILE.linkedin}` },
        { kind: 'out', text: `github    ${PROFILE.github}` },
      ]
    case 'theme': {
      const next: Theme | null = ['papel', 'paper', 'light'].includes(arg)
        ? 'light'
        : ['carbon', 'carbón', 'dark'].includes(arg)
          ? 'dark'
          : !arg
            ? a.theme === 'light'
              ? 'dark'
              : 'light'
            : null
      if (!next) return [{ kind: 'err', text: es ? 'theme: usa papel o carbon' : 'theme: use paper or carbon' }]
      a.setTheme(next)
      return [{ kind: 'out', text: next === 'light' ? (es ? 'Sustrato: PAPEL' : 'Substrate: PAPER') : es ? 'Sustrato: CARBÓN' : 'Substrate: CARBON' }]
    }
    case 'lang': {
      const next: Lang | null = arg === 'es' || arg === 'en' ? arg : !arg ? (es ? 'en' : 'es') : null
      if (!next) return [{ kind: 'err', text: 'lang: es | en' }]
      a.setLang(next)
      return [{ kind: 'out', text: next === 'es' ? 'Idioma: ESPAÑOL' : 'Language: ENGLISH' }]
    }
    case 'history':
      return history.length
        ? history.map((h, i) => ({ kind: 'out', text: `${String(i + 1).padStart(3, ' ')}  ${h}` }))
        : [{ kind: 'out', text: es ? '(vacío)' : '(empty)' }]
    case 'date':
      return [
        {
          kind: 'out',
          text: new Date().toLocaleString(es ? 'es-CO' : 'en-US', { timeZone: PROFILE.timeZone, dateStyle: 'full', timeStyle: 'medium' }),
        },
      ]
    case 'clear':
      return 'clear'
    case 'sudo':
      return [{ kind: 'err', text: es ? 'sudo: este incidente será reportado.' : 'sudo: this incident will be reported.' }]
    default:
      return [{ kind: 'err', text: es ? `${cmd}: comando no encontrado. Escribe help.` : `${cmd}: command not found. Type help.` }]
  }
}

const welcome = (lang: Lang): Line[] => [
  { kind: 'out', text: `${PROFILE.unit} ${PROFILE.rev} — ${lang === 'es' ? 'consola del perfil' : 'profile console'}` },
  {
    kind: 'out',
    text:
      lang === 'es'
        ? 'Escribe help para ver los comandos. Tab completa, ↑ ↓ recorren el historial.'
        : 'Type help to list commands. Tab completes, ↑ ↓ walk the history.',
  },
]

export function Console({ open, setOpen, actions }: { open: boolean; setOpen: (o: boolean) => void; actions: Omit<Actions, 'setLang'> }) {
  const { lang, setLang, ui } = useI18n()
  const [lines, setLines] = useState<Line[] | null>(null) // null = bienvenida en el idioma activo
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [cursor, setCursor] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const shown = lines ?? welcome(lang)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  const submit = () => {
    const nextHistory = input.trim() ? [...history, input.trim()] : history
    const out = run(input, nextHistory, { ...actions, setLang }, lang)
    setHistory(nextHistory)
    setCursor(null)
    setInput('')
    if (out === 'clear') setLines([])
    else setLines([...shown, { kind: 'in', text: input }, ...out])
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
      else if (matches.length > 1) setLines([...shown, { kind: 'out', text: matches.join('   ') }])
    } else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <aside aria-label={ui.consoleLabel} className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-(--b-fg) bg-(--b-bg) text-(--b-fg)">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="console-body"
        className="bm grid w-full grid-cols-[auto_1fr_auto] items-center text-left hover:bg-(--b-fg) hover:text-(--b-bg)"
      >
        <span className="border-r border-current bg-(--b-red) px-4 py-2.5 text-white">{ui.consoleTag}</span>
        <span className="truncate px-4 normal-case tracking-normal">
          {PROMPT} <span className="opacity-70">{open ? ui.consoleCollapse : ui.consoleHint(history.length)}</span>
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
            {shown.map((l, i) => (
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
                  aria-label={ui.commandLabel}
                  data-console-input=""
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
