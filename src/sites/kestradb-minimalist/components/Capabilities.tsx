import { useState } from 'react'
import { Reveal, SectionHeader, Tag } from './primitives'

/* Rejilla de bits: el filtro se aplica durante el recorrido del grafo, no después. */
function FilterBitmap() {
  // Hash entero para una distribución irregular pero estable entre renders.
  const hash = (i: number, salt: number) => (Math.imul(i + salt, 2654435761) >>> 0) % 1000
  const cells = Array.from({ length: 10 * 36 }, (_, i) => {
    const hit = hash(i, 17) < 110
    const visited = hit && hash(i, 91) < 420
    return { hit, visited }
  })
  return (
    <div className="grid grid-cols-36 gap-[2px]" aria-hidden="true">
      {cells.map((c, i) => (
        <span
          key={i}
          className={`aspect-square ${
            c.visited && c.hit ? 'bg-(--k-accent)' : c.hit ? 'bg-(--k-ink-2)' : 'bg-(--k-line)'
          }`}
        />
      ))}
    </div>
  )
}

const LEVELS = [
  { id: 'strong', label: 'strong', lag: '0 ms', cost: '+1 RTT al líder', note: 'Lee siempre del líder. Para flujos que escriben y leen en la misma petición.' },
  { id: 'bounded', label: 'bounded', lag: '≤ 150 ms', cost: 'sin coste extra', note: 'Cualquier réplica con retraso acotado. El valor por defecto.' },
  { id: 'eventual', label: 'eventual', lag: '≤ 2 s', cost: '−18 % de p99', note: 'La réplica más cercana, sin esperar. Para catálogos y recomendaciones.' },
] as const

function ConsistencyPicker() {
  const [level, setLevel] = useState<(typeof LEVELS)[number]['id']>('bounded')
  const current = LEVELS.find((l) => l.id === level)!
  return (
    <div>
      <div role="radiogroup" aria-label="Nivel de consistencia" className="kmono flex border border-(--k-line) text-xs">
        {LEVELS.map((l, i) => (
          <button
            key={l.id}
            role="radio"
            aria-checked={l.id === level}
            onClick={() => setLevel(l.id)}
            className={`flex-1 px-3 py-2 transition-colors ${i ? 'border-l border-(--k-line)' : ''} ${
              l.id === level ? 'bg-(--k-ink) text-white' : 'bg-(--k-surface) text-(--k-ink-2) hover:bg-(--k-sunken)'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <dl className="kmono mt-4 grid grid-cols-2 gap-y-1 text-[11px]">
        <dt className="text-(--k-muted)">retraso máximo</dt>
        <dd className="text-right text-(--k-ink)">{current.lag}</dd>
        <dt className="text-(--k-muted)">coste</dt>
        <dd className="text-right text-(--k-ink)">{current.cost}</dd>
      </dl>
      <p className="mt-3 text-sm text-(--k-ink-2)">{current.note}</p>
    </div>
  )
}

function Tenants() {
  const rows = [
    ['tienda-lumen', 41, 'int8'],
    ['legal-docs-eu', 12, 'fp16'],
    ['tenant-0931', 3, 'binary'],
  ] as const
  return (
    <ul className="kmono divide-y divide-(--k-line) border-y border-(--k-line) text-xs">
      {rows.map(([name, m, q]) => (
        <li key={name} className="grid grid-cols-[1fr_auto_4rem] items-center gap-3 py-2">
          <span className="text-(--k-ink)">ns/{name}</span>
          <span className="text-(--k-muted) tabular-nums">{m}M vec</span>
          <span className="text-right text-(--k-muted)">{q}</span>
        </li>
      ))}
    </ul>
  )
}

const INTEGRATIONS = ['LangChain', 'LlamaIndex', 'Haystack', 'Kafka Connect', 'Spark', 'dbt', 'Airflow', 'OpenTelemetry']

export function Capabilities() {
  return (
    <section id="capacidades" className="border-t border-(--k-line) py-24 md:py-32">
      <SectionHeader
        index="03"
        label="Capacidades"
        title="Lo que suele obligar a elegir, en el mismo motor."
      />

      <div className="mt-16 grid border-y border-(--k-line) md:grid-cols-12">
        <Reveal className="k-card border-(--k-line) bg-(--k-surface) p-6 md:col-span-7 md:border-r md:p-10">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-medium tracking-[-0.02em] text-(--k-ink)">Filtros sin post-filtrado</h3>
            <Tag tone="blue">roaring bitmaps</Tag>
          </div>
          <p className="mt-3 max-w-md text-[15px] text-(--k-ink-2)">
            El filtro se evalúa mientras se recorre el grafo. Una consulta que excluye el 99 % de la colección sigue
            devolviendo sus 10 vecinos, sin inflar top_k ni perder recall.
          </p>
          <div className="mt-8">
            <FilterBitmap />
            <p className="kmono mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-(--k-muted)">
              <span className="flex items-center gap-1.5">
                <span className="size-2 bg-(--k-ink-2)" /> pasa el filtro
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 bg-(--k-accent)" /> visitado por HNSW
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 bg-(--k-line)" /> descartado sin leer
              </span>
            </p>
          </div>
        </Reveal>

        <Reveal index={1} className="k-card border-t border-(--k-line) p-6 md:col-span-5 md:border-t-0 md:p-10">
          <h3 className="text-xl font-medium tracking-[-0.02em] text-(--k-ink)">Consistencia por consulta</h3>
          <p className="mt-3 mb-6 text-[15px] text-(--k-ink-2)">Se elige en cada llamada, no al crear la colección.</p>
          <ConsistencyPicker />
        </Reveal>

        <Reveal index={2} className="k-card border-t border-(--k-line) p-6 md:col-span-5 md:border-r md:p-10">
          <h3 className="text-xl font-medium tracking-[-0.02em] text-(--k-ink)">Multi-tenant de verdad</h3>
          <p className="mt-3 mb-6 text-[15px] text-(--k-ink-2)">
            Cada namespace tiene su propio índice, su cuantización y sus cuotas. Un tenant ruidoso no mueve el p99 de los
            demás.
          </p>
          <Tenants />
        </Reveal>

        <Reveal index={3} className="k-card border-t border-(--k-line) bg-(--k-surface) p-6 md:col-span-7 md:p-10">
          <h3 className="text-xl font-medium tracking-[-0.02em] text-(--k-ink)">Encaja en lo que ya tienes</h3>
          <p className="mt-3 max-w-md text-[15px] text-(--k-ink-2)">
            Conectores mantenidos por el equipo, no por la comunidad. Métricas en formato Prometheus y trazas
            OpenTelemetry por consulta.
          </p>
          <ul className="kmono mt-8 grid grid-cols-2 border-t border-l border-(--k-line) text-xs sm:grid-cols-4">
            {INTEGRATIONS.map((name) => (
              <li key={name} className="border-r border-b border-(--k-line) px-3 py-3 text-(--k-ink-2)">
                {name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
