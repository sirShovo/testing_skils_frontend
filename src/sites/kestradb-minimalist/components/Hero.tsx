import { useState } from 'react'
import { IconArrow, IconCheck, IconCopy, IconStar, Reveal, Tag, Wordmark } from './primitives'
import { QueryConsole } from './QueryConsole'

const NAV = [
  { href: '#benchmarks', label: 'Benchmarks' },
  { href: '#arquitectura', label: 'Arquitectura' },
  { href: '#capacidades', label: 'Capacidades' },
  { href: '#precios', label: 'Precios' },
  { href: '#docs', label: 'Docs' },
]

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-(--k-line) bg-(--k-bg)/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-8 border-x border-(--k-line) px-6 md:px-10">
        <a href="#top" className="text-[17px]" aria-label="KestraDB, inicio">
          <Wordmark />
        </a>
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex gap-6 text-sm text-(--k-muted)">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="transition-colors hover:text-(--k-ink)">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <a
            href="#docs"
            className="kmono hidden items-center gap-1.5 text-xs text-(--k-muted) transition-colors hover:text-(--k-ink) sm:inline-flex"
          >
            <IconStar />
            14.2k
          </a>
          <a
            href="#precios"
            className="k-press rounded-[5px] bg-(--k-ink) px-3.5 py-1.5 text-sm text-white transition-colors hover:bg-[#333]"
          >
            Abrir consola
          </a>
        </div>
      </div>
    </header>
  )
}

const INSTALL = 'curl -fsSL https://get.kestradb.io | sh'

function InstallLine() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* Sin permiso de portapapeles: el comando sigue visible para copiarlo a mano. */
    }
  }
  return (
    <div className="kmono flex items-center gap-3 rounded-[6px] border border-(--k-line) bg-(--k-surface) py-1.5 pr-1.5 pl-3 text-[12.5px]">
      <span className="text-(--k-accent-ink) select-none">$</span>
      <code className="truncate text-(--k-ink-2)">{INSTALL}</code>
      <button
        onClick={copy}
        aria-label={copied ? 'Copiado' : 'Copiar comando de instalación'}
        className="ml-auto grid size-7 shrink-0 place-items-center rounded-[4px] text-(--k-muted) transition-colors hover:bg-(--k-sunken) hover:text-(--k-ink)"
      >
        {copied ? <IconCheck /> : <IconCopy />}
      </button>
    </div>
  )
}

export function Hero() {
  return (
    <section id="top" className="relative">
      <div className="k-gridbg pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="relative grid gap-y-10 px-6 pt-20 pb-16 md:grid-cols-12 md:gap-x-10 md:px-10 md:pt-28">
        <Reveal className="md:col-span-12">
          <a href="#capacidades" className="inline-flex items-center gap-3 text-sm text-(--k-ink-2) hover:text-(--k-ink)">
            <Tag tone="yellow">v2.4</Tag>
            Filtrado híbrido con BM25 dentro del mismo índice
            <IconArrow className="size-3.5" />
          </a>
        </Reveal>

        <Reveal index={1} className="md:col-span-8">
          <h1 className="text-[clamp(2.9rem,7.2vw,6.25rem)] leading-[0.95] font-medium tracking-[-0.055em] text-(--k-ink)">
            Mil millones de vectores.
            <br />
            <span className="text-(--k-muted)">Cuatro milisegundos.</span>
          </h1>
        </Reveal>

        <Reveal index={2} className="flex flex-col justify-end gap-6 md:col-span-4">
          <p className="text-[15px] text-(--k-ink-2)">
            KestraDB es una base de datos vectorial distribuida escrita en Rust. Parte los índices HNSW entre nodos,
            replica con Raft y guarda los segmentos en almacenamiento de objetos: escalar es añadir máquinas, no
            reindexar.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#precios"
              className="k-press inline-flex items-center gap-2 rounded-[5px] bg-(--k-ink) px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#333]"
            >
              Crear un cluster gratis
              <IconArrow className="size-3.5" />
            </a>
            <a
              href="#arquitectura"
              className="k-press inline-flex items-center rounded-[5px] border border-(--k-line-2) bg-(--k-surface) px-4 py-2.5 text-sm text-(--k-ink) transition-colors hover:border-(--k-ink)"
            >
              Ver la arquitectura
            </a>
          </div>
        </Reveal>

        <Reveal index={3} className="md:col-span-5">
          <InstallLine />
        </Reveal>
      </div>

      <Reveal index={4} className="relative px-4 pb-20 md:px-10">
        <QueryConsole />
        <p className="kmono mt-3 text-[11px] text-(--k-muted)">
          Simulación en el navegador con tiempos medidos en un cluster de 12 nodos. Cambia de pestaña o pulsa Ejecutar.
        </p>
      </Reveal>
    </section>
  )
}

const METRICS = [
  { value: '1.1B', label: 'vectores en un cluster de 12 nodos' },
  { value: '3.8 ms', label: 'p99 con recall@10 de 0.96' },
  { value: '0 s', label: 'de caída al añadir o retirar nodos' },
  { value: 'Apache 2.0', label: 'licencia del núcleo, sin cláusulas' },
]

export function MetricStrip() {
  return (
    <section aria-label="Cifras clave" className="border-t border-(--k-line)">
      <dl className="grid grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m, i) => (
          <Reveal
            key={m.value}
            index={i}
            className={`border-(--k-line) px-6 py-8 md:px-10 ${i % 2 ? 'border-l' : ''} ${i > 1 ? 'border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
          >
            <dt className="sr-only">{m.label}</dt>
            <dd className="text-[clamp(1.6rem,2.6vw,2.2rem)] font-medium tracking-[-0.04em] text-(--k-ink) tabular-nums">
              {m.value}
            </dd>
            <dd className="kmono mt-1 text-xs text-(--k-muted)">{m.label}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  )
}
