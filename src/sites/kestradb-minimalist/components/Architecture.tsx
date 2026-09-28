import { useState, type KeyboardEvent } from 'react'
import { ARCH_EDGES, ARCH_NODES, NODE_DETAILS, QUERY_PATH, type ArchNode } from '../data'
import { Reveal, SectionHeader } from './primitives'

const byId = Object.fromEntries(ARCH_NODES.map((n) => [n.id, n])) as Record<string, ArchNode>

/* Curva entre dos nodos: vertical si están en filas distintas, lateral si comparten fila. */
function edgePath(a: ArchNode, b: ArchNode) {
  if (Math.abs(a.y - b.y) < 10) {
    const [l, r] = a.x < b.x ? [a, b] : [b, a]
    const y = l.y + l.h / 2
    return `M${l.x + l.w},${y} L${r.x},${y}`
  }
  const x1 = a.x + a.w / 2
  const y1 = a.y + a.h
  const x2 = b.x + b.w / 2
  const y2 = b.y
  const my = (y1 + y2) / 2
  return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`
}

const TIERS = [
  { y: 52, label: 'clientes' },
  { y: 181, label: 'routing' },
  { y: 319, label: 'shards' },
  { y: 455, label: 'storage' },
]

export function Architecture() {
  const [selected, setSelected] = useState('router-a')
  const node = byId[selected]
  const detail = NODE_DETAILS[node.kind]

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelected(id)
    }
  }

  return (
    <section id="arquitectura" className="border-t border-(--k-line) bg-(--k-surface) py-24 md:py-32">
      <SectionHeader
        index="02"
        label="Arquitectura"
        title="Cómputo sin estado, datos inmutables, un solo camino caliente."
        lede="Los routers no guardan nada, los shards solo guardan su partición y la fuente de verdad son segmentos inmutables en almacenamiento de objetos. Selecciona cualquier componente del diagrama."
      />

      <div className="mt-16 grid border-y border-(--k-line) lg:grid-cols-12">
        <Reveal className="overflow-x-auto border-(--k-line) bg-(--k-bg) lg:col-span-8 lg:border-r">
          <svg
            viewBox="0 0 1000 500"
            className="block h-auto w-full min-w-[720px] p-6"
            role="group"
            aria-label="Diagrama del cluster de KestraDB"
          >
            {TIERS.map((t) => (
              <text key={t.label} x="0" y={t.y} className="kmono" fontSize="11" fill="var(--k-muted)" letterSpacing="0.08em">
                {t.label.toUpperCase()}
              </text>
            ))}

            {/* Aristas */}
            {ARCH_EDGES.map((e, i) => {
              const a = byId[e.from]
              const b = byId[e.to]
              const active = e.from === selected || e.to === selected
              return (
                <path
                  key={i}
                  id={`k-edge-${i}`}
                  d={edgePath(a, b)}
                  fill="none"
                  stroke={active ? 'var(--k-accent)' : e.control ? 'var(--k-muted)' : 'var(--k-line-2)'}
                  strokeWidth={active ? 1.6 : 1}
                  strokeDasharray={e.control ? '4 4' : undefined}
                  style={{ transition: 'stroke 200ms' }}
                />
              )
            })}

            {/* Paquetes en tránsito sobre el plano de datos */}
            <g className="k-motion">
              {ARCH_EDGES.map((e, i) =>
                e.control || byId[e.to].kind === 'wal' || byId[e.to].kind === 'object' || e.from === 'compactor' ? null : (
                  <circle key={i} r="2.5" fill="var(--k-ink)">
                    <animateMotion dur="2.6s" repeatCount="indefinite" begin={`${(i * 0.37) % 2.6}s`}>
                      <mpath href={`#k-edge-${i}`} />
                    </animateMotion>
                  </circle>
                ),
              )}
            </g>

            {/* Nodos */}
            {ARCH_NODES.map((n) => {
              const active = n.id === selected
              return (
                <g
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  aria-label={`${n.label}, ${n.sub}`}
                  onClick={() => setSelected(n.id)}
                  onKeyDown={(e) => onKey(e, n.id)}
                  className="cursor-pointer outline-none [&:focus-visible>rect:first-child]:stroke-(--k-accent)"
                >
                  <rect
                    x={n.x}
                    y={n.y}
                    width={n.w}
                    height={n.h}
                    rx="4"
                    fill="var(--k-surface)"
                    stroke={active ? 'var(--k-ink)' : 'var(--k-line-2)'}
                    strokeWidth={active ? 1.5 : 1}
                    style={{ transition: 'stroke 200ms' }}
                  />
                  {active && <rect x={n.x} y={n.y} width="6" height={n.h} fill="var(--k-accent)" />}
                  <text x={n.x + 16} y={n.y + 25} className="kmono" fontSize="15" fill="var(--k-ink)">
                    {n.label}
                  </text>
                  <text x={n.x + 16} y={n.y + 44} className="kmono" fontSize="12" fill="var(--k-muted)">
                    {n.sub}
                  </text>
                  {n.kind === 'shard' && (
                    <g aria-hidden="true">
                      {[0, 1, 2].map((r) => (
                        <rect
                          key={r}
                          x={n.x + n.w - 44 + r * 12}
                          y={n.y + n.h - 22}
                          width="9"
                          height="9"
                          fill={r === 0 ? 'var(--k-ink)' : 'none'}
                          stroke="var(--k-ink)"
                        />
                      ))}
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
        </Reveal>

        {/* Panel de detalle */}
        <Reveal index={1} className="border-t border-(--k-line) px-6 py-8 lg:col-span-4 lg:border-t-0 lg:px-10">
          <div aria-live="polite">
            <p className="kmono text-[11px] tracking-[0.08em] text-(--k-muted) uppercase">
              <span className="text-(--k-accent-ink)">{node.label}</span> · {node.sub}
            </p>
            <h3 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-(--k-ink)">{detail.title}</h3>
            <p className="mt-4 text-[15px] text-(--k-ink-2)">{detail.body}</p>
            <dl className="mt-8 divide-y divide-(--k-line) border-y border-(--k-line)">
              {detail.facts.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="kmono text-[11px] text-(--k-muted)">{k}</dt>
                  <dd className="text-right text-sm text-(--k-ink)">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="kmono mt-6 flex items-center gap-4 text-[11px] text-(--k-muted)">
            <span className="flex items-center gap-2">
              <span className="h-px w-5 bg-(--k-line-2)" /> datos
            </span>
            <span className="flex items-center gap-2">
              <span className="w-5 border-t border-dashed border-(--k-muted)" /> control
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2 bg-(--k-ink)" /> líder
            </span>
          </p>
        </Reveal>
      </div>

      {/* Camino de una consulta */}
      <ol className="grid border-b border-(--k-line) sm:grid-cols-2 lg:grid-cols-5">
        {QUERY_PATH.map((step, i) => (
          <Reveal
            as="li"
            key={i}
            index={i}
            className={`border-(--k-line) px-6 py-6 md:px-8 ${i ? 'border-t sm:border-t-0' : ''} ${i % 2 ? 'sm:border-l' : ''} ${i > 1 ? 'sm:border-t lg:border-t-0' : ''} ${i ? 'lg:border-l' : ''}`}
          >
            <span className="kmono text-[11px] text-(--k-accent-ink)">{String(i + 1).padStart(2, '0')}</span>
            <p className="mt-2 text-sm text-(--k-ink-2)">{step}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
