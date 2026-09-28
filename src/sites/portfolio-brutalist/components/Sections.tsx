import { PRINCIPLES, PROFILE, STACK } from '../data'

/* Cruz de registro en una intersección de la rejilla. */
function Cross({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute font-mono text-sm leading-none select-none ${className}`}>
      +
    </span>
  )
}

export function Hero({ onOpenConsole }: { onOpenConsole: () => void }) {
  return (
    <section id="top" aria-label="Presentación" className="relative border-b-2 border-(--b-fg)">
      {/* Cluster de metadatos: densidad máxima */}
      <div className="bm grid grid-cols-2 border-b border-(--b-fg) md:grid-cols-6">
        {[
          ['Unidad', `${PROFILE.unit} / ${PROFILE.rev}`],
          ['Coordenadas', '6.2442 N · 75.5812 W'],
          ['Disciplina', 'Sistemas + interfaz'],
          ['Base', `${PROFILE.city}, ${PROFILE.country}`],
          ['Emisión', '© 2026 — ed. 07'],
        ].map(([k, v], i) => (
          <div key={k} className={`border-(--b-fg) px-4 py-2.5 md:px-6 ${i ? 'md:border-l' : ''} ${i % 2 ? 'border-l' : ''} ${i > 1 ? 'border-t md:border-t-0' : ''}`}>
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
        <p className="bm mb-6 px-1 text-(--b-red-ink)">[ Portafolio / Índice de sistemas ]</p>
        <h1 className="bx text-[clamp(2.3rem,10.9vw,13.5rem)]">
          <span className="block">Systems</span>
          <span className="block">
            <span className="text-(--b-red)">&amp;</span> Interface
          </span>
          <span className="block">
            Engineer<sup className="bm ml-1 align-top text-[clamp(10px,1.2vw,14px)] tracking-normal">™</sup>
          </span>
        </h1>
      </div>

      <div className="h-3 border-y border-(--b-fg) b-stripes" aria-hidden="true" />

      {/* Rejilla inferior: bio, especialidades, acciones */}
      <div className="grid md:grid-cols-12">
        <div className="border-(--b-fg) px-4 py-10 md:col-span-6 md:border-r md:px-6 md:py-14">
          <p className="bm mb-4 text-[10px] text-(--b-mute)">01 — Perfil</p>
          <p className="max-w-xl text-[clamp(1.2rem,1.9vw,1.6rem)] leading-[1.25] font-medium tracking-[-0.015em]">
            <strong className="font-black uppercase">{PROFILE.name}.</strong> {PROFILE.bio}
          </p>
        </div>
        <dl className="bm grid grid-cols-2 gap-px border-t border-(--b-fg) bg-(--b-fg) md:col-span-4 md:border-t-0">
          {Object.entries(STACK).map(([k, items]) => (
            <div key={k} className="bg-(--b-bg) px-4 py-5 md:px-5">
              <dt className="mb-2 text-[10px] text-(--b-mute)">/// {k}</dt>
              {items.map((it) => (
                <dd key={it}>{it}</dd>
              ))}
            </div>
          ))}
        </dl>
        <nav aria-label="Acciones" className="bm flex flex-col border-t border-(--b-fg) md:col-span-2 md:border-t-0 md:border-l">
          <a href="#indice" className="flex flex-1 items-end justify-between border-b border-(--b-fg) px-4 py-5 hover:bg-(--b-fg) hover:text-(--b-bg)">
            Índice <span aria-hidden="true">↓</span>
          </a>
          <button onClick={onOpenConsole} className="flex flex-1 items-end justify-between border-b border-(--b-fg) px-4 py-5 text-left hover:bg-(--b-fg) hover:text-(--b-bg)">
            Consola <kbd className="border border-current px-1.5">`</kbd>
          </button>
          <a href="#contacto" className="flex flex-1 items-end justify-between bg-(--b-red) px-4 py-5 text-white hover:bg-(--b-fg) hover:text-(--b-bg)">
            Contacto <span aria-hidden="true">→</span>
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
  return (
    <section id="principios" aria-labelledby="principios-title" className="relative border-b-2 border-(--b-fg)">
      <div className="grid border-b border-(--b-fg) md:grid-cols-12">
        <p className="bm border-(--b-fg) px-4 py-3 md:col-span-3 md:border-r md:px-6">
          02 — Philosophy / Principles
        </p>
        <p className="bm border-t border-(--b-fg) px-4 py-3 text-(--b-mute) md:col-span-9 md:border-t-0 md:px-6">
          Cinco reglas de trabajo. Ninguna es original; todas me costaron algo.
        </p>
      </div>

      <h2 id="principios-title" className="bx overflow-hidden px-3 pt-20 text-[clamp(3.4rem,15vw,16rem)] whitespace-nowrap md:px-5">
        Princi<span className="text-(--b-red)">/</span>pios
      </h2>
      <div className="mx-4 h-[6px] bg-(--b-red) md:mx-6" aria-hidden="true" />

      <ol className="grid gap-y-20 px-4 pt-20 pb-28 md:grid-cols-12 md:gap-x-6 md:px-6">
        {PRINCIPLES.map((p, i) => (
          <li key={p.no} className={`${PLACEMENT[i]} grid grid-cols-[auto_1fr] gap-x-5`}>
            <span className="bx b-outline row-span-2 text-[clamp(4rem,7vw,6.5rem)] leading-[0.8]">{p.no}</span>
            <h3 className="bx self-end border-b-2 border-(--b-fg) pb-2 text-[clamp(1.3rem,2.2vw,1.9rem)] leading-[0.95] tracking-[-0.03em]">
              {p.title}
            </h3>
            <p className="col-start-2 mt-4 max-w-md text-[15px] leading-[1.5]">{p.body}</p>
          </li>
        ))}

        {/* Cita a sangre con serif degradado por semitono */}
        <li className="border-y-2 border-(--b-fg) py-12 md:col-span-12 md:row-start-3 md:my-6" aria-label="Cita">
          <blockquote className="grid gap-6 md:grid-cols-12">
            <p className="bm text-(--b-red-ink) md:col-span-2">[ Nota al margen ]</p>
            <p className="b-halftone bserif text-[clamp(2.2rem,5.4vw,5rem)] leading-[1] md:col-span-10">
              Un sistema que no se puede observar tampoco se puede operar.
            </p>
          </blockquote>
        </li>
      </ol>
    </section>
  )
}

export function Contact() {
  return (
    <section id="contacto" aria-labelledby="contacto-title" className="grid border-b-2 border-(--b-fg) md:grid-cols-12">
      <div className="border-(--b-fg) px-4 py-16 md:col-span-8 md:border-r md:px-6 md:py-24">
        <p className="bm mb-6 text-(--b-mute)">03 — Contacto</p>
        <h2 id="contacto-title" className="bx text-[clamp(2.6rem,7vw,6.5rem)]">
          ¿Un sistema
          <br />
          difícil de ver?
        </h2>
        <a href={`mailto:${PROFILE.email}`} className="b-link mt-10 inline-block text-[clamp(1.1rem,2.6vw,2.2rem)] font-semibold tracking-[-0.02em]">
          {PROFILE.email}
        </a>
      </div>
      <dl className="bm grid content-between gap-px border-t border-(--b-fg) bg-(--b-fg) md:col-span-4 md:border-t-0">
        {[
          ['Respuesta', '< 48 h laborables'],
          ['Formato', 'Contratos de 6 a 16 semanas'],
          ['Idiomas', 'Español · English · Deutsch'],
          ['Llave PGP', '4F2A 9C1E 77B0 D3E5'],
        ].map(([k, v]) => (
          <div key={k} className="bg-(--b-bg) px-4 py-5 md:px-6">
            <dt className="text-[10px] text-(--b-mute)">{k}</dt>
            <dd className="mt-1">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function Colophon() {
  return (
    <footer className="bm flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 text-[10px] text-(--b-mute) md:px-6">
      <span>© 2026 {PROFILE.name}</span>
      <span>Archivo · JetBrains Mono · EB Garamond</span>
      <span>Sin imágenes · sin rastreadores</span>
      <span className="ml-auto">
        {PROFILE.unit} / {PROFILE.rev}
      </span>
    </footer>
  )
}
