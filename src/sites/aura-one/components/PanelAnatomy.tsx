import { useSynth } from '../synth'
import { PARTS, type PartId } from '../layout'
import { Device } from './Device'
import { Eyebrow, Reveal } from './ui'

const H = 58 // alto del dispositivo en las mismas unidades que el ancho (100 × 58)

/* Etiqueta flotante: posición en unidades del dispositivo (puede salir de la caja) y lado de anclaje. */
const NOTES: { part: PartId; title: string; body: string; lx: number; ly: number; side: 'left' | 'right' | 'top' | 'bottom' }[] = [
  { part: 'display', title: 'Pantalla OLED', body: '2.4", 256 × 64. Muestra el parámetro que tocas y la forma de onda en vivo.', lx: 16, ly: -9, side: 'top' },
  { part: 'knobs', title: 'Encoders sin fin', body: 'Cuatro encoders con anillo de valor: corte, resonancia, ataque y liberación.', lx: 76, ly: -9, side: 'top' },
  { part: 'faders', title: 'Faders de 45 mm', body: 'Frecuencia, morph de onda, FM y nivel. Recorrido lineal con detente central.', lx: -7, ly: 40, side: 'left' },
  { part: 'transport', title: 'Transporte', body: 'Sonido, borrar y aleatorizar el patrón. Cada botón tiene su LED.', lx: 24, ly: 65, side: 'bottom' },
  { part: 'pads', title: '16 pads', body: 'Sensibles a velocidad y presión, retroiluminados. Pulsa para activar pasos.', lx: 68, ly: 65, side: 'bottom' },
  { part: 'grille', title: 'Altavoz', body: 'Transductor de 28 mm tras una rejilla fresada en el propio chasis.', lx: 105, ly: 26, side: 'right' },
  { part: 'plate', title: 'Placa de serie', body: 'Grabada con láser: nombre y número de unidad de la edición.', lx: 105, ly: 48, side: 'right' },
]

const center = (id: PartId) => {
  const p = PARTS[id]
  return { x: p.left + p.w / 2, y: ((p.top + p.h / 2) / 100) * H }
}

// Punto de la caja de la parte más cercano a la etiqueta, para que la línea termine en su borde.
const edge = (id: PartId, lx: number, ly: number) => {
  const p = PARTS[id]
  const x0 = p.left
  const x1 = p.left + p.w
  const y0 = (p.top / 100) * H
  const y1 = ((p.top + p.h) / 100) * H
  return { x: Math.min(Math.max(lx, x0), x1), y: Math.min(Math.max(ly, y0), y1) }
}

const ANCHOR: Record<(typeof NOTES)[number]['side'], string> = {
  top: '-translate-x-1/2 -translate-y-full',
  bottom: '-translate-x-1/2',
  left: '-translate-x-full -translate-y-1/2',
  right: '-translate-y-1/2',
}

export function PanelAnatomy() {
  const { highlight, setHighlight } = useSynth()

  return (
    <div className="grid min-h-full items-center gap-12 px-4 pt-28 pb-32 md:grid-cols-12 md:px-14 md:py-24">
      <div className="md:col-span-4 lg:col-span-3 xl:pr-4">
        <Reveal>
          <Eyebrow>02 · Anatomía</Eyebrow>
          <h2 className="mt-6 text-[clamp(2.2rem,3.6vw,3.8rem)] leading-[0.95] font-semibold tracking-[-0.05em]">
            Cada control, en su sitio.
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-(--a-ink-2)">
            Siete zonas, una sola pieza de aluminio. Pasa por una anotación para ver dónde vive; todo sigue siendo tocable.
          </p>
        </Reveal>
        <Reveal index={1}>
          <ol className="mt-8 divide-y divide-black/5 border-y border-black/5">
            {NOTES.map((n, i) => (
              <li key={n.part}>
                <button
                  onMouseEnter={() => setHighlight(n.part)}
                  onMouseLeave={() => setHighlight(null)}
                  onFocus={() => setHighlight(n.part)}
                  onBlur={() => setHighlight(null)}
                  className={`group flex w-full items-baseline gap-4 py-2 text-left transition-colors duration-500 ${highlight === n.part ? 'text-(--a-ink)' : 'text-(--a-ink-2)'}`}
                  style={{ transitionTimingFunction: 'var(--a-ease)' }}
                >
                  <span className={`amono text-[11px] tabular-nums ${highlight === n.part ? 'text-(--a-accent)' : 'text-(--a-mute)'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-medium">{n.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <Reveal index={2} className="md:col-span-8 lg:col-span-9 lg:col-start-4">
        {/* Espacio reservado alrededor del chasis para las etiquetas flotantes; el ancho se limita también por el alto. */}
        <div className="flex justify-center md:pt-36 md:pb-40">
          <div className="relative w-full md:max-w-[min(calc(100%_-_22rem),62vh)]">
            <Device label="Aura One con anotaciones" />

            <svg viewBox={`0 0 100 ${H}`} className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible md:block" aria-hidden="true">
              {NOTES.map((n) => {
                const e = edge(n.part, n.lx, n.ly)
                const c = center(n.part)
                const on = highlight === n.part
                return (
                  <g key={n.part} style={{ transition: 'opacity 500ms var(--a-ease)' }} opacity={highlight && !on ? 0.25 : 1}>
                    <line x1={n.lx} y1={n.ly} x2={e.x} y2={e.y} stroke={on ? 'var(--a-accent)' : 'var(--a-ink)'} strokeWidth={on ? 0.22 : 0.12} />
                    <circle cx={e.x} cy={e.y} r={on ? 0.7 : 0.45} fill={on ? 'var(--a-accent)' : 'var(--a-ink)'} />
                    {on && <circle cx={c.x} cy={c.y} r="1.6" fill="none" stroke="var(--a-accent)" strokeWidth="0.2" />}
                  </g>
                )
              })}
            </svg>

            {NOTES.map((n, i) => {
              const on = highlight === n.part
              return (
                <div
                  key={n.part}
                  className={`absolute hidden w-[10rem] md:block ${ANCHOR[n.side]}`}
                  style={{ left: `${n.lx}%`, top: `${(n.ly / H) * 100}%` }}
                  onMouseEnter={() => setHighlight(n.part)}
                  onMouseLeave={() => setHighlight(null)}
                >
                  <div
                    className={`rounded-2xl bg-white/75 p-3 ring-1 transition-[transform,box-shadow] duration-500 ${
                      on ? 'a-float scale-[1.03] ring-(--a-accent)/40' : 'ring-black/5'
                    } ${n.side === 'left' ? 'mr-2' : n.side === 'right' ? 'ml-2' : n.side === 'top' ? 'mb-2' : 'mt-2'}`}
                    style={{ transitionTimingFunction: 'var(--a-ease)' }}
                  >
                    <p className="flex items-baseline gap-2 text-[13px] font-medium text-(--a-ink)">
                      <span className="amono text-[10px] text-(--a-accent)">{String(i + 1).padStart(2, '0')}</span>
                      {n.title}
                    </p>
                    <p className="mt-1 text-[11.5px] leading-snug text-(--a-ink-2)">{n.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* En móvil las anotaciones pasan a una lista bajo el dispositivo. */}
        <ul className="mt-6 grid gap-3 md:hidden">
          {NOTES.map((n, i) => (
            <li key={n.part} className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
              <p className="text-sm font-medium">
                <span className="amono mr-2 text-[10px] text-(--a-accent)">{String(i + 1).padStart(2, '0')}</span>
                {n.title}
              </p>
              <p className="mt-1 text-[13px] text-(--a-ink-2)">{n.body}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  )
}
