import { useState } from 'react'
import { Isotype, Reveal } from './primitives'

const FAQ = [
  {
    q: '¿Qué pasa con las consultas mientras añado nodos?',
    a: 'Nada visible. El coordinator mueve segmentos inmutables al nodo nuevo y solo cambia la propiedad del shard cuando la copia está verificada. Los routers actualizan el mapa en menos de 500 ms.',
  },
  {
    q: '¿Puedo migrar desde otra base de datos vectorial sin volver a generar embeddings?',
    a: 'Sí. kestra import lee Parquet, Arrow y los formatos de exportación más comunes, conserva IDs y metadatos, y construye el índice en paralelo en todos los shards.',
  },
  {
    q: '¿La versión Community tiene límites artificiales?',
    a: 'No. Es el mismo binario que ejecutamos en Cloud. Lo que no incluye es la capa de operación gestionada: backups automáticos, SSO y soporte con SLA.',
  },
  {
    q: '¿Dónde se guardan mis datos en Cloud?',
    a: 'En la región que elijas, cifrados en reposo con AES-256. En Dedicated y Enterprise puedes aportar tus propias claves KMS y revocarlas en cualquier momento.',
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="docs" className="border-t border-(--k-line) py-24 md:py-32">
      <div className="grid gap-10 px-6 md:grid-cols-12 md:px-10">
        <Reveal className="md:col-span-4">
          <p className="kmono text-xs tracking-[0.08em] text-(--k-muted) uppercase">
            <span className="text-(--k-accent-ink)">05</span> / Preguntas
          </p>
          <h2 className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] font-medium tracking-[-0.04em] text-(--k-ink)">
            Lo que preguntan los equipos de plataforma.
          </h2>
        </Reveal>
        <Reveal index={1} className="md:col-span-8">
          <ul className="border-t border-(--k-line)">
            {FAQ.map((item, i) => {
              const isOpen = open === i
              return (
                <li key={item.q} className="border-b border-(--k-line)">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`k-faq-${i}`}
                    className="flex w-full items-baseline gap-6 py-5 text-left"
                  >
                    <span className="flex-1 text-[17px] tracking-[-0.01em] text-(--k-ink)">{item.q}</span>
                    <span className="kmono w-4 shrink-0 text-center text-lg text-(--k-muted)" aria-hidden="true">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    id={`k-faq-${i}`}
                    hidden={!isOpen}
                    className="max-w-2xl pb-6 text-[15px] text-(--k-ink-2)"
                  >
                    {item.a}
                  </div>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

const COLUMNS = [
  {
    title: 'Producto',
    links: ['Motor', 'Cloud Serverless', 'Cloud Dedicated', 'Enterprise / BYOC', 'Changelog', 'Hoja de ruta'],
  },
  {
    title: 'Desarrolladores',
    links: ['Documentación', 'Referencia de API', 'SDK Python', 'SDK TypeScript', 'SDK Rust', 'CLI'],
  },
  {
    title: 'Operación',
    links: ['Guía de despliegue', 'Helm chart', 'Terraform provider', 'Métricas y alertas', 'Estado del servicio'],
  },
  {
    title: 'Recursos',
    links: ['Benchmarks', 'Blog de ingeniería', 'Casos de uso', 'Migraciones', 'Comunidad'],
  },
  {
    title: 'Empresa',
    links: ['Equipo', 'Empleo', 'Seguridad', 'Privacidad', 'Términos', 'Contacto'],
  },
]

const REGIONS = [
  ['eu-west-1', '12 ms'],
  ['eu-central-1', '18 ms'],
  ['us-east-1', '84 ms'],
  ['ap-south-1', '141 ms'],
]

export function Footer() {
  return (
    <footer className="border-t border-(--k-line) bg-(--k-ink) text-[#B8B5AE]">
      <div className="grid border-b border-white/10 md:grid-cols-12">
        <div className="border-white/10 px-6 py-10 md:col-span-4 md:border-r md:px-10">
          <a href="#top" className="inline-flex items-center gap-2 text-[17px] text-white" aria-label="KestraDB, volver arriba">
            <Isotype className="size-5" />
            <span className="font-semibold tracking-[-0.03em]">KestraDB</span>
          </a>
          <p className="mt-4 max-w-xs text-sm">
            Base de datos vectorial distribuida. Construida en Rust, publicada bajo Apache 2.0.
          </p>
          <div className="kmono mt-8 space-y-1.5 text-[11px]">
            <p className="flex items-center gap-2 text-white">
              <span className="k-pulse size-1.5 rounded-full bg-[#7FBF86]" />
              Todos los sistemas operativos
            </p>
            {REGIONS.map(([r, ms]) => (
              <p key={r} className="flex justify-between gap-4">
                <span>{r}</span>
                <span className="tabular-nums">{ms}</span>
              </p>
            ))}
          </div>
        </div>

        <nav
          aria-label="Pie de página"
          className="grid grid-cols-2 gap-px bg-white/10 max-md:border-t max-md:border-white/10 sm:grid-cols-3 md:col-span-8 lg:grid-cols-5"
        >
          {COLUMNS.map((col) => (
            <div key={col.title} className="bg-(--k-ink) px-6 py-10">
              <h3 className="kmono text-[11px] tracking-[0.08em] text-white/50 uppercase">{col.title}</h3>
              <ul className="mt-4 space-y-2 text-[13px]">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#top" className="transition-colors hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="kmono flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-5 text-[11px] text-white/45 md:px-10">
        <span>© 2026 Kestra Labs</span>
        <span>kestradb 2.4.1</span>
        <span>build 9f3c2e1</span>
        <span>SOC 2 Tipo II · ISO 27001</span>
        <span className="ml-auto">Hecho sin cookies de seguimiento</span>
      </div>

      {/* Marca de cierre en contorno, a sangre */}
      <div aria-hidden="true" className="overflow-hidden border-t border-white/10 px-6 pt-8 md:px-10">
        <p className="translate-y-[18%] text-[clamp(4rem,17vw,15rem)] leading-[0.8] font-semibold tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.18)] select-none">
          KestraDB
        </p>
      </div>
    </footer>
  )
}
