import { useState, type ReactNode } from 'react'
import { IconArrow, IconCheck, IconDash, Reveal, SectionHeader } from './primitives'

type Plan = {
  id: string
  name: string
  price: (annual: boolean) => ReactNode
  unit: string
  blurb: string
  cta: string
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'community',
    name: 'Community',
    price: () => '0 €',
    unit: 'autoalojado',
    blurb: 'El núcleo completo, Apache 2.0.',
    cta: 'Descargar',
  },
  {
    id: 'serverless',
    name: 'Serverless',
    price: () => 'Por uso',
    unit: '1M vectores gratis',
    blurb: 'Pagas almacenamiento indexado y consultas.',
    cta: 'Crear cluster',
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    price: (annual) => (annual ? '1.160 €' : '1.450 €'),
    unit: 'al mes, desde',
    blurb: 'Nodos reservados en tu región.',
    cta: 'Crear cluster',
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: () => 'A medida',
    unit: 'contrato anual',
    blurb: 'En tu nube (BYOC) o en la nuestra.',
    cta: 'Hablar con ventas',
  },
]

type Cell = boolean | string

const ROWS: { group: string; items: [string, Cell, Cell, Cell, Cell][] }[] = [
  {
    group: 'Capacidad',
    items: [
      ['Vectores', 'sin límite', 'hasta 500M', 'hasta 5B', 'sin límite'],
      ['Réplicas por shard', 'configurable', '2', '3', 'configurable'],
      ['Regiones', 'la tuya', '6', '14', '14 + BYOC'],
    ],
  },
  {
    group: 'Operación',
    items: [
      ['SLA de disponibilidad', false, '99.9 %', '99.95 %', '99.99 %'],
      ['Backups punto en el tiempo', false, '7 días', '30 días', 'a medida'],
      ['Escalado sin caída', true, true, true, true],
    ],
  },
  {
    group: 'Seguridad',
    items: [
      ['SSO / SAML', false, false, true, true],
      ['Claves gestionadas por el cliente', false, false, true, true],
      ['Registro de auditoría', false, false, '90 días', 'ilimitado'],
      ['Private Link / VPC peering', false, false, true, true],
    ],
  },
  {
    group: 'Soporte',
    items: [
      ['Canal', 'foro', 'email', 'Slack compartido', 'ingeniero asignado'],
      ['Respuesta P1', false, false, '1 h', '15 min'],
    ],
  },
]

function CellValue({ v }: { v: Cell }) {
  if (v === true) return <IconCheck className="mx-auto size-4 text-(--k-ink)" />
  if (v === false) return <IconDash className="mx-auto size-4 text-(--k-line-2)" />
  return <span className="text-(--k-ink-2)">{v}</span>
}

// Estimador de Serverless: 0.30 €/GB-mes indexado (768d fp32 ≈ 3.07 GB por millón) + 0.08 € por millón de consultas.
function Estimator() {
  const [vectors, setVectors] = useState(10)
  const [qps, setQps] = useState(50)
  const storage = Math.max(vectors - 1, 0) * 3.07 * 0.3
  const queries = ((qps * 2_592_000) / 1_000_000) * 0.08
  const total = storage + queries
  const eur = (n: number) => n.toLocaleString('es', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  return (
    <Reveal className="grid border-b border-(--k-line) md:grid-cols-12">
      <div className="px-6 py-8 md:col-span-4 md:px-10">
        <p className="kmono text-[11px] tracking-[0.08em] text-(--k-muted) uppercase">Estimador · Serverless</p>
        <p className="mt-3 text-[15px] text-(--k-ink-2)">
          Vectores de 768 dimensiones en fp32. El primer millón es gratis.
        </p>
      </div>
      <div className="space-y-6 border-t border-(--k-line) px-6 py-8 md:col-span-5 md:border-t-0 md:border-l md:px-10">
        <label className="block">
          <span className="kmono flex justify-between text-xs text-(--k-ink-2)">
            <span>Vectores</span>
            <span className="text-(--k-ink) tabular-nums">{vectors}M</span>
          </span>
          <input type="range" min={1} max={500} value={vectors} onChange={(e) => setVectors(+e.target.value)} className="mt-2 w-full" />
        </label>
        <label className="block">
          <span className="kmono flex justify-between text-xs text-(--k-ink-2)">
            <span>Consultas por segundo (media)</span>
            <span className="text-(--k-ink) tabular-nums">{qps}</span>
          </span>
          <input type="range" min={1} max={2000} value={qps} onChange={(e) => setQps(+e.target.value)} className="mt-2 w-full" />
        </label>
      </div>
      <div className="flex flex-col justify-center border-t border-(--k-line) px-6 py-8 md:col-span-3 md:border-t-0 md:border-l md:px-10">
        <p className="text-[2.25rem] leading-none font-medium tracking-[-0.04em] text-(--k-ink) tabular-nums">{eur(total)}</p>
        <p className="kmono mt-2 text-[11px] text-(--k-muted)">
          al mes · {eur(storage)} almacenamiento + {eur(queries)} consultas
        </p>
        {total > 1450 && <p className="mt-3 text-xs text-(--k-accent-ink)">A este volumen, Dedicated sale más barato.</p>}
      </div>
    </Reveal>
  )
}

export function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="precios" className="border-t border-(--k-line) bg-(--k-surface) py-24 md:py-32">
      <SectionHeader
        index="04"
        label="Precios"
        title="El núcleo es libre. Pagas por no operarlo."
        lede="Mismo binario en todos los planes. Lo que cambia es quién se despierta a las cuatro de la mañana."
      />

      <div className="mt-12 flex items-center gap-3 px-6 md:px-10">
        <div role="radiogroup" aria-label="Periodo de facturación" className="kmono flex border border-(--k-line) text-xs">
          {[
            { v: false, l: 'Mensual' },
            { v: true, l: 'Anual · −20 %' },
          ].map((o, i) => (
            <button
              key={o.l}
              role="radio"
              aria-checked={annual === o.v}
              onClick={() => setAnnual(o.v)}
              className={`px-3 py-1.5 transition-colors ${i ? 'border-l border-(--k-line)' : ''} ${
                annual === o.v ? 'bg-(--k-ink) text-white' : 'text-(--k-ink-2) hover:bg-(--k-sunken)'
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <Reveal className="mt-6 overflow-x-auto border-y border-(--k-line)">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <caption className="sr-only">Comparativa de planes de KestraDB</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[24%] border-b border-(--k-line) px-6 py-6 text-left align-bottom md:px-10">
                <span className="kmono text-[11px] font-normal tracking-[0.08em] text-(--k-muted) uppercase">Plan</span>
              </th>
              {PLANS.map((p) => (
                <th
                  key={p.id}
                  scope="col"
                  className={`relative w-[19%] border-b border-l border-(--k-line) px-5 py-6 text-left align-top font-normal ${
                    p.featured ? 'bg-(--k-bg)' : ''
                  }`}
                >
                  {p.featured && <span className="absolute inset-x-0 top-0 h-[3px] bg-(--k-accent)" />}
                  <span className="kmono block text-[11px] tracking-[0.08em] text-(--k-muted) uppercase">{p.name}</span>
                  <span className="mt-3 block text-[1.75rem] leading-none font-medium tracking-[-0.04em] text-(--k-ink) tabular-nums">
                    {p.price(annual)}
                  </span>
                  <span className="kmono mt-1.5 block text-[11px] text-(--k-muted)">{p.unit}</span>
                  <span className="mt-4 block min-h-[2.8em] text-[13px] text-(--k-ink-2)">{p.blurb}</span>
                  <a
                    href="#top"
                    className={`k-press mt-4 inline-flex w-full items-center justify-between rounded-[5px] px-3 py-2 text-[13px] transition-colors ${
                      p.featured
                        ? 'bg-(--k-ink) text-white hover:bg-[#333]'
                        : 'border border-(--k-line-2) text-(--k-ink) hover:border-(--k-ink)'
                    }`}
                  >
                    {p.cta}
                    <IconArrow className="size-3.5" />
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          {ROWS.map((g) => (
            <tbody key={g.group}>
              <tr>
                <th
                  scope="rowgroup"
                  colSpan={5}
                  className="kmono border-b border-(--k-line) bg-(--k-bg) px-6 pt-6 pb-2 text-left text-[11px] font-normal tracking-[0.08em] text-(--k-muted) uppercase md:px-10"
                >
                  {g.group}
                </th>
              </tr>
              {g.items.map(([label, ...cells]) => (
                <tr key={label} className="transition-colors hover:bg-(--k-bg)">
                  <th scope="row" className="border-b border-(--k-line) px-6 py-3 text-left font-normal text-(--k-ink) md:px-10">
                    {label}
                  </th>
                  {cells.map((c, i) => (
                    <td
                      key={i}
                      className={`kmono border-b border-l border-(--k-line) px-5 py-3 text-center text-xs ${
                        PLANS[i].featured ? 'bg-(--k-bg)/60' : ''
                      }`}
                    >
                      <CellValue v={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </Reveal>

      <Estimator />
    </section>
  )
}
