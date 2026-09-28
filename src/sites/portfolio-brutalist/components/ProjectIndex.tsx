import type { ReactNode } from 'react'
import { PROJECTS, type Project } from '../data'
import { AStarPreview } from './previews/AStarPreview'
import { RaftPreview } from './previews/RaftPreview'
import { RingPreview } from './previews/RingPreview'
import { SortPreview } from './previews/SortPreview'
import { StatechartPreview } from './previews/StatechartPreview'

function Preview({ project }: { project: Project }): ReactNode {
  switch (project.preview) {
    case 'raft':
      return <RaftPreview active />
    case 'astar':
      return <AStarPreview />
    case 'sort':
      return <SortPreview />
    case 'ring':
      return <RingPreview />
    case 'statechart':
      return <StatechartPreview />
  }
}

const COLS = 'grid-cols-[3rem_1fr_auto] md:grid-cols-[4.5rem_1fr_13rem_5rem_9rem_3rem]'

export function ProjectIndex({ openId, onToggle }: { openId: string | null; onToggle: (id: string) => void }) {
  return (
    <section id="indice" aria-labelledby="indice-title" className="border-b-2 border-(--b-fg)">
      {/* Cabecera de sección: título macro + metadatos densos */}
      <div className="grid border-b-2 border-(--b-fg) md:grid-cols-12">
        <h2 id="indice-title" className="bx px-4 pt-16 pb-4 text-[clamp(3rem,9vw,8.5rem)] md:col-span-8 md:px-6">
          Índice
          <sup className="bm ml-2 align-top text-[11px] tracking-[0.08em] text-(--b-red-ink)">®{PROJECTS.length}</sup>
        </h2>
        <dl className="bm grid grid-cols-2 content-end gap-px self-end border-t border-(--b-fg) bg-(--b-fg) md:col-span-4 md:border-t-0 md:border-l">
          {[
            ['Registros', String(PROJECTS.length).padStart(3, '0')],
            ['Periodo', '2022 — 2026'],
            ['Orden', 'Cronológico inverso'],
            ['Interacción', 'Fila → preview'],
          ].map(([k, v]) => (
            <div key={k} className="bg-(--b-bg) px-4 py-3">
              <dt className="text-[10px] text-(--b-mute)">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Cabecera de tabla */}
      <div className={`bm grid ${COLS} border-b border-(--b-fg) text-[10px] text-(--b-mute)`} aria-hidden="true">
        <span className="px-4 py-2 md:px-6">No.</span>
        <span className="py-2">Proyecto</span>
        <span className="hidden py-2 md:block">Dominio</span>
        <span className="hidden py-2 md:block">Año</span>
        <span className="py-2 pr-4 text-right md:pr-0 md:text-left">Métrica</span>
        <span className="hidden md:block" />
      </div>

      <ol>
        {PROJECTS.map((p) => {
          const open = openId === p.id
          return (
            <li key={p.id} id={`p-${p.id}`} className="scroll-mt-24 border-b border-(--b-fg) last:border-b-0">
              <button
                aria-expanded={open}
                aria-controls={`panel-${p.id}`}
                onClick={() => onToggle(p.id)}
                className={`b-row grid w-full ${COLS} items-baseline text-left`}
              >
                <span className="bm px-4 py-5 md:px-6">{p.no}</span>
                <span className="bx py-4 text-[clamp(1.6rem,3.6vw,3rem)]">{p.name}</span>
                <span className="bm b-row-mute hidden text-(--b-mute) md:block">{p.domain}</span>
                <span className="bm hidden tabular-nums md:block">{p.year}</span>
                <span className="bm pr-4 text-right md:pr-0 md:text-left">
                  <data value={p.headline}>{p.headline}</data>
                </span>
                <span className="bm b-row-cue hidden text-center md:block" aria-hidden="true">
                  {open ? '[−]' : '[+]'}
                </span>
              </button>

              {open && (
                <div id={`panel-${p.id}`} role="region" aria-label={`Detalle de ${p.name}`} className="grid border-t-2 border-(--b-fg) md:grid-cols-12">
                  <div className="flex flex-col gap-6 border-(--b-fg) px-4 py-6 md:col-span-4 md:border-r md:px-6">
                    <p className="text-[15px] leading-snug">{p.summary}</p>
                    <dl className="bm divide-y divide-(--b-fg) border-y border-(--b-fg)">
                      <div className="flex justify-between gap-4 py-2">
                        <dt className="text-(--b-mute)">Rol</dt>
                        <dd className="text-right">{p.role}</dd>
                      </div>
                      {p.metrics.map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 py-2">
                          <dt className="text-(--b-mute)">{k}</dt>
                          <dd className="text-right tabular-nums">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div>
                      <p className="bm mb-2 text-[10px] text-(--b-mute)">Stack</p>
                      <ul className="bm flex flex-wrap gap-1.5">
                        {p.stack.map((s) => (
                          <li key={s} className="border border-(--b-fg) px-2 py-1">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="border-t border-(--b-fg) px-4 py-6 md:col-span-8 md:border-t-0 md:px-6">
                    <p className="bm mb-3 flex justify-between text-[10px] text-(--b-mute)">
                      <span>[ Preview interactivo ]</span>
                      <span>{p.no} / {p.name}</span>
                    </p>
                    <Preview project={p} />
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
