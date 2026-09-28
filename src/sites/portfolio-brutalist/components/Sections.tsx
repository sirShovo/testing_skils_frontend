import { PRINCIPLES, PROFILE, STACK } from '../data'
import { useI18n } from '../i18n'

/* Cruz de registro en una intersección de la rejilla. */
function Cross({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute font-mono text-sm leading-none select-none ${className}`}>
      +
    </span>
  )
}

export function Hero({ onOpenConsole }: { onOpenConsole: () => void }) {
  const { t, ui } = useI18n()
  const meta: [string, string][] = [
    [ui.meta.unit, `${PROFILE.unit} / ${PROFILE.rev}`],
    [ui.meta.coords, '6.2442 N · 75.5812 W'],
    [ui.meta.discipline, ui.disciplineValue],
    [ui.meta.base, `${PROFILE.city}, ${PROFILE.country}`],
    [ui.meta.issue, '© 2026 — ed. 01'],
  ]

  return (
    <section id="top" aria-label={PROFILE.name} className="relative border-b-2 border-(--b-fg)">
      {/* Cluster de metadatos: densidad máxima */}
      <div className="bm grid grid-cols-2 border-b border-(--b-fg) md:grid-cols-6">
        {meta.map(([k, v], i) => (
          <div key={i} className={`border-(--b-fg) px-4 py-2.5 md:px-6 ${i ? 'md:border-l' : ''} ${i % 2 ? 'border-l' : ''} ${i > 1 ? 'border-t md:border-t-0' : ''}`}>
            <span className="block text-[10px] text-(--b-mute)">{k}</span>
            {v}
          </div>
        ))}
        <div className="b-barcode hidden h-full border-l border-(--b-fg) md:block" aria-hidden="true" />
      </div>

      {/* Macro-tipografía a sangre */}
      <div className="relative overflow-hidden px-3 pt-16 pb-6 md:px-5 md:pt-24">
        <Cross className="top-3 left-3" />
        <Cross className="top-3 right-3" />
        <p className="bm mb-6 px-1 text-(--b-red-ink)">{ui.kicker}</p>
        <h1 className="bx text-[clamp(2.3rem,10.9vw,13.5rem)]">
          <span className="block">Full Stack</span>
          <span className="block">
            <span className="text-(--b-red)">&amp;</span> Frontend
          </span>
          <span className="block">
            Developer<sup className="bm ml-1 align-top text-[clamp(10px,1.2vw,14px)] tracking-normal">™</sup>
          </span>
        </h1>
      </div>

      <div className="b-stripes h-3 border-y border-(--b-fg)" aria-hidden="true" />

      {/* Rejilla inferior: bio, stack, acciones */}
      <div className="grid md:grid-cols-12">
        <div className="border-(--b-fg) px-4 py-10 md:col-span-6 md:border-r md:px-6 md:py-14">
          <p className="bm mb-4 text-[10px] text-(--b-mute)">{ui.profile}</p>
          <p className="max-w-xl text-[clamp(1.15rem,1.8vw,1.5rem)] leading-[1.28] font-medium tracking-[-0.015em]">
            <strong className="font-black uppercase">{PROFILE.fullName}.</strong> {t(PROFILE.bio)}
          </p>
        </div>
        <dl className="bm grid grid-cols-2 gap-px border-t border-(--b-fg) bg-(--b-fg) md:col-span-4 md:border-t-0">
          {STACK.map((g) => (
            <div key={g.key.en} className="bg-(--b-bg) px-4 py-5 md:px-5">
              <dt className="mb-2 text-[10px] text-(--b-mute)">/// {t(g.key)}</dt>
              {g.items.map((it) => (
                <dd key={it}>{it}</dd>
              ))}
            </div>
          ))}
        </dl>
        <nav aria-label={ui.actions} className="bm flex flex-col border-t border-(--b-fg) md:col-span-2 md:border-t-0 md:border-l">
          <a href="#indice" className="flex flex-1 items-end justify-between border-b border-(--b-fg) px-4 py-5 hover:bg-(--b-fg) hover:text-(--b-bg)">
            {ui.index} <span aria-hidden="true">↓</span>
          </a>
          <button onClick={onOpenConsole} className="flex flex-1 items-end justify-between border-b border-(--b-fg) px-4 py-5 text-left hover:bg-(--b-fg) hover:text-(--b-bg)">
            {ui.console} <kbd className="border border-current px-1.5">`</kbd>
          </button>
          <a href="#contacto" className="flex flex-1 items-end justify-between bg-(--b-red) px-4 py-5 text-white hover:bg-(--b-fg) hover:text-(--b-bg)">
            {ui.contact} <span aria-hidden="true">→</span>
          </a>
        </nav>
      </div>
    </section>
  )
}

// Colocación asimétrica de cada principio sobre la rejilla de 12 columnas.
const PLACEMENT = [
  'md:col-start-1 md:col-span-6',
  'md:col-start-7 md:col-span-5 md:mt-40',
  'md:col-start-2 md:col-span-5',
  'md:col-start-8 md:col-span-5 md:-mt-16',
  'md:col-start-3 md:col-span-6 md:mt-10',
]

export function Principles() {
  const { t, ui } = useI18n()
  return (
    <section id="principios" aria-labelledby="principios-title" className="relative border-b-2 border-(--b-fg)">
      <div className="grid border-b border-(--b-fg) md:grid-cols-12">
        <p className="bm border-(--b-fg) px-4 py-3 md:col-span-3 md:border-r md:px-6">{ui.principlesKicker}</p>
        <p className="bm border-t border-(--b-fg) px-4 py-3 text-(--b-mute) md:col-span-9 md:border-t-0 md:px-6">{ui.principlesLede}</p>
      </div>

      <h2 id="principios-title" className="bx overflow-hidden px-3 pt-20 text-[clamp(3.4rem,15vw,16rem)] whitespace-nowrap md:px-5">
        {ui.principlesTitle[0]}
        <span className="text-(--b-red)">/</span>
        {ui.principlesTitle[1]}
      </h2>
      <div className="mx-4 h-[6px] bg-(--b-red) md:mx-6" aria-hidden="true" />

      <ol className="grid gap-y-20 px-4 pt-20 pb-28 md:grid-cols-12 md:gap-x-6 md:px-6">
        {PRINCIPLES.map((p, i) => (
          <li key={p.no} className={`${PLACEMENT[i]} grid grid-cols-[auto_1fr] gap-x-5`}>
            <span className="bx b-outline row-span-2 text-[clamp(4rem,7vw,6.5rem)] leading-[0.8]">{p.no}</span>
            <h3 className="bx self-end border-b-2 border-(--b-fg) pb-2 text-[clamp(1.3rem,2.2vw,1.9rem)] leading-[0.95] tracking-[-0.03em]">
              {t(p.title)}
            </h3>
            <p className="col-start-2 mt-4 max-w-md text-[15px] leading-[1.5]">{t(p.body)}</p>
          </li>
        ))}

        {/* Cita a sangre con serif degradado por semitono */}
        <li className="border-y-2 border-(--b-fg) py-12 md:col-span-12 md:row-start-3 md:my-6">
          <blockquote className="grid gap-6 md:grid-cols-12">
            <p className="bm text-(--b-red-ink) md:col-span-2">{ui.marginNote}</p>
            <p className="b-halftone bserif text-[clamp(2.2rem,5.4vw,5rem)] leading-[1] md:col-span-10">{ui.quote}</p>
          </blockquote>
        </li>
      </ol>
    </section>
  )
}

export function Contact() {
  const { ui } = useI18n()
  const links: [string, string, string][] = [
    ['Email', PROFILE.email, `mailto:${PROFILE.email}`],
    ['LinkedIn', PROFILE.linkedin, `https://${PROFILE.linkedin}`],
    ['GitHub', PROFILE.github, `https://${PROFILE.github}`],
  ]
  return (
    <section id="contacto" aria-labelledby="contacto-title" className="grid border-b-2 border-(--b-fg) md:grid-cols-12">
      <div className="border-(--b-fg) px-4 py-16 md:col-span-8 md:border-r md:px-6 md:py-24">
        <p className="bm mb-6 text-(--b-mute)">{ui.contactKicker}</p>
        <h2 id="contacto-title" className="bx text-[clamp(2.4rem,6.5vw,6rem)]">
          {ui.contactTitle[0]}
          <br />
          {ui.contactTitle[1]}
        </h2>
        <a href={`mailto:${PROFILE.email}`} className="b-link mt-10 inline-block text-[clamp(1.1rem,2.6vw,2.2rem)] font-semibold tracking-[-0.02em] break-all">
          {PROFILE.email}
        </a>
      </div>
      <dl className="bm grid content-between gap-px border-t border-(--b-fg) bg-(--b-fg) md:col-span-4 md:border-t-0">
        {links.map(([k, v, href]) => (
          <div key={k} className="bg-(--b-bg) px-4 py-5 md:px-6">
            <dt className="text-[10px] text-(--b-mute)">{k}</dt>
            <dd className="mt-1 break-all normal-case">
              <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="b-link">
                {v}
              </a>
            </dd>
          </div>
        ))}
        <div className="bg-(--b-bg) px-4 py-5 md:px-6">
          <dt className="text-[10px] text-(--b-mute)">{ui.languagesLabel}</dt>
          <dd className="mt-1">{ui.languagesValue}</dd>
        </div>
        <div className="bg-(--b-bg) px-4 py-5 md:px-6">
          <dt className="text-[10px] text-(--b-mute)">{ui.location}</dt>
          <dd className="mt-1">
            {PROFILE.city}, Colombia · UTC−5
          </dd>
        </div>
      </dl>
    </section>
  )
}

export function Colophon() {
  const { ui } = useI18n()
  return (
    <footer className="bm flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 text-[10px] text-(--b-mute) md:px-6">
      <span>© 2026 {PROFILE.fullName}</span>
      <span>Archivo · JetBrains Mono · EB Garamond</span>
      <span>{ui.colophon}</span>
      <span className="ml-auto">
        {PROFILE.unit} / {PROFILE.rev}
      </span>
    </footer>
  )
}
