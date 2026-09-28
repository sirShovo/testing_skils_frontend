import { useState } from 'react'
import { DATASETS, ENGINES, METRICS, RESULTS, type DatasetId, type MetricId } from '../data'
import { Reveal, SectionHeader, Tag } from './primitives'

const fmt = (v: number, unit: string) =>
  unit === 'qps' ? v.toLocaleString('es', { useGrouping: 'always' }) : v.toLocaleString('es', { maximumFractionDigits: 2 })

export function Benchmarks() {
  const [dataset, setDataset] = useState<DatasetId>('laion')
  const [metricId, setMetricId] = useState<MetricId>('qps')
  const metric = METRICS.find((m) => m.id === metricId)!
  const values = RESULTS[dataset][metricId]
  const max = Math.max(...Object.values(values))
  const best = ENGINES.reduce((a, e) =>
    metric.higherIsBetter ? (values[e.id] > values[a.id] ? e : a) : values[e.id] < values[a.id] ? e : a,
  )

  // Resumen honesto: si KestraDB no gana, se dice quién gana y por qué.
  const others = ENGINES.filter((e) => e.id !== 'kestra')
  const runnerUp = others.reduce((a, e) =>
    metric.higherIsBetter ? (values[e.id] > values[a.id] ? e : a) : values[e.id] < values[a.id] ? e : a,
  )
  const ratio = metric.higherIsBetter ? values.kestra / values[runnerUp.id] : values[runnerUp.id] / values.kestra
  const summary =
    best.id === 'kestra'
      ? `${ratio.toFixed(1)}× frente a ${runnerUp.name}, el siguiente mejor.`
      : `${best.name} gana aquí (${(values.kestra / values[best.id]).toFixed(1)}× menos): IVF-PQ comprime los vectores a costa de recall y latencia.`

  return (
    <section id="benchmarks" className="border-t border-(--k-line) py-24 md:py-32">
      <SectionHeader
        index="01"
        label="Benchmarks"
        title="Medido en hardware idéntico, con el recall fijado."
        lede="Comparar throughput sin fijar el recall es comparar motores distintos. Todas las cifras son a recall@10 = 0.95, en el mismo hardware y con los parámetros publicados en el repositorio del benchmark."
      />

      <div className="mt-16 grid border-y border-(--k-line) md:grid-cols-12">
        {/* Controles */}
        <Reveal className="space-y-8 border-(--k-line) px-6 py-8 md:col-span-4 md:border-r md:px-10">
          <fieldset>
            <legend className="kmono mb-3 text-[11px] tracking-[0.08em] text-(--k-muted) uppercase">Dataset</legend>
            <div className="divide-y divide-(--k-line) border-y border-(--k-line)">
              {DATASETS.map((d) => {
                const active = d.id === dataset
                return (
                  <button
                    key={d.id}
                    onClick={() => setDataset(d.id)}
                    aria-pressed={active}
                    className="group flex w-full items-center gap-3 py-2.5 text-left"
                  >
                    <span
                      className={`size-2 shrink-0 transition-colors ${active ? 'bg-(--k-accent)' : 'bg-(--k-line-2) group-hover:bg-(--k-muted)'}`}
                    />
                    <span className={`text-sm ${active ? 'text-(--k-ink)' : 'text-(--k-ink-2)'}`}>{d.name}</span>
                    <span className="kmono ml-auto text-[11px] text-(--k-muted)">{d.shape}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="kmono mb-3 text-[11px] tracking-[0.08em] text-(--k-muted) uppercase">Métrica</legend>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[6px] border border-(--k-line) bg-(--k-line)">
              {METRICS.map((m) => {
                const active = m.id === metricId
                return (
                  <button
                    key={m.id}
                    onClick={() => setMetricId(m.id)}
                    aria-pressed={active}
                    className={`kmono px-3 py-2.5 text-left text-xs transition-colors ${
                      active ? 'bg-(--k-ink) text-white' : 'bg-(--k-surface) text-(--k-ink-2) hover:bg-(--k-sunken)'
                    }`}
                  >
                    {m.id === 'qps' ? 'QPS' : m.id === 'p99' ? 'p99' : m.id === 'mem' ? 'Memoria' : 'Indexación'}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <dl className="kmono space-y-1.5 text-[11px] text-(--k-muted)">
            <div className="flex justify-between gap-4">
              <dt>Hardware</dt>
              <dd className="text-right text-(--k-ink-2)">3 × c7i.8xlarge</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Por nodo</dt>
              <dd className="text-right text-(--k-ink-2)">32 vCPU · 64 GiB · NVMe</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Clientes</dt>
              <dd className="text-right text-(--k-ink-2)">16 hilos · batch 1</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Ejecución</dt>
              <dd className="text-right text-(--k-ink-2)">mediana de 5 · sep 2026</dd>
            </div>
          </dl>
        </Reveal>

        {/* Gráfico */}
        <Reveal index={1} className="border-t border-(--k-line) bg-(--k-surface) px-6 py-8 md:col-span-8 md:border-t-0 md:px-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-lg font-medium tracking-[-0.02em] text-(--k-ink)">{metric.label}</h3>
            <span className="kmono text-[11px] text-(--k-muted)">
              {metric.higherIsBetter ? 'más es mejor' : 'menos es mejor'} · {metric.unit}
            </span>
          </div>

          <ul className="mt-8 space-y-5">
            {ENGINES.map((e) => {
              const v = values[e.id]
              const isKestra = e.id === 'kestra'
              return (
                <li key={e.id}>
                  <div className="mb-1.5 flex items-baseline gap-3">
                    <span className={`text-sm ${isKestra ? 'font-medium text-(--k-ink)' : 'text-(--k-ink-2)'}`}>{e.name}</span>
                    <span className="kmono hidden text-[11px] text-(--k-muted) sm:inline">{e.detail}</span>
                    {e.id === best.id && <Tag tone="green">mejor</Tag>}
                    <span className="kmono ml-auto text-sm text-(--k-ink) tabular-nums">{fmt(v, metric.unit)}</span>
                  </div>
                  <div className="relative h-7 bg-(--k-bg)">
                    {/* Marcas de escala al 25/50/75 % */}
                    {[25, 50, 75].map((t) => (
                      <span key={t} className="absolute inset-y-0 w-px bg-(--k-line)" style={{ left: `${t}%` }} />
                    ))}
                    <span
                      className={`k-bar absolute inset-y-0 left-0 w-full ${isKestra ? 'bg-(--k-accent)' : 'bg-[#CFCCC5]'}`}
                      style={{ transform: `scaleX(${v / max})` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>

          <p className="mt-8 border-t border-(--k-line) pt-5 text-sm text-(--k-ink-2)">
            <span className="kmono mr-2 text-[11px] text-(--k-muted) uppercase">Lectura</span>
            {summary}
          </p>
        </Reveal>
      </div>

      <p className="kmono mt-4 px-6 text-[11px] text-(--k-muted) md:px-10">
        Los motores de comparación se muestran anonimizados. Configuraciones y scripts: github.com/kestradb/bench.
      </p>
    </section>
  )
}
