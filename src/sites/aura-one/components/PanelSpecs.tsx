import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { Bezel, Eyebrow, PillButton, Reveal } from './ui'

const SPECS: { group: string; rows: [string, string][] }[] = [
  {
    group: 'Síntesis',
    rows: [
      ['Motor', '4 osc. wavetable · morph continuo'],
      ['Modulación', 'FM 2 operadores · 2 LFO'],
      ['Filtro', 'Multimodo 24 dB/oct resonante'],
      ['Envolventes', '2 × ADSR'],
      ['Polifonía', '8 voces'],
    ],
  },
  {
    group: 'Interfaz',
    rows: [
      ['Pads', '16 · velocidad + presión · RGB'],
      ['Encoders', '4 sin fin · anillo de 24 LED'],
      ['Faders', '4 × 45 mm · detente central'],
      ['Pantalla', 'OLED 2.4" · 256 × 64'],
    ],
  },
  {
    group: 'Audio y conexiones',
    rows: [
      ['Conversión', '24 bit / 48 kHz'],
      ['Salidas', 'Estéreo 3.5 mm · auriculares'],
      ['MIDI', 'USB-C · TRS in/out'],
      ['Sync', 'Analógico in/out · 1 PPQN'],
    ],
  },
  {
    group: 'Chasis',
    rows: [
      ['Material', 'Aluminio 6061 anodizado · 5 mm'],
      ['Dimensiones', '248 × 142 × 18 mm'],
      ['Peso', '640 g'],
      ['Batería', '3 000 mAh · ~10 h'],
    ],
  },
]

const FINISHES = [
  { id: 'aluminio', label: 'Aluminio', swatch: 'linear-gradient(160deg,#eceae6,#c4c3bd)' },
  { id: 'grafito', label: 'Grafito', swatch: 'linear-gradient(160deg,#4a4a48,#1f1f1e)' },
]

function Field({ label, children, hint }: { label: string; children: (id: string) => ReactNode; hint?: string }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[12px] font-medium text-(--a-ink-2)">
        {label}
      </label>
      <div className="rounded-[1.1rem] bg-black/[0.035] p-1 ring-1 ring-black/5 transition-shadow duration-500 focus-within:ring-(--a-accent)/50" style={{ transitionTimingFunction: 'var(--a-ease)' }}>
        {children(id)}
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-(--a-mute)">{hint}</p>}
    </div>
  )
}

const inputCls =
  'w-full rounded-[calc(1.1rem-0.25rem)] bg-white px-4 py-2.5 text-[15px] text-(--a-ink) shadow-[inset_0_1px_1px_rgba(0,0,0,0.04)] outline-none placeholder:text-(--a-mute)/70'

function PreorderForm() {
  const [finish, setFinish] = useState('aluminio')
  const [done, setDone] = useState<{ code: string; name: string } | null>(null)

  // Demo local: no hay backend y no se envía ningún dato.
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '').trim().split(' ')[0]
    const code = `AUR-0138-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    setDone({ code, name })
  }

  if (done) {
    return (
      <div className="flex min-h-[28rem] flex-col justify-between p-8">
        <div>
          <Eyebrow>Reserva registrada</Eyebrow>
          <p className="mt-6 text-[clamp(2rem,3vw,2.8rem)] leading-[1] font-semibold tracking-[-0.04em]">
            Gracias{done.name ? `, ${done.name}` : ''}.<br />
            Tu unidad es la <span className="text-(--a-accent)">0138</span>.
          </p>
          <p className="amono mt-6 text-[13px] text-(--a-ink-2)">Código · {done.code}</p>
        </div>
        <div className="space-y-4">
          <p className="text-[12px] text-(--a-mute)">Esta página es una demostración: no se ha enviado ni guardado ningún dato.</p>
          <PillButton variant="light" onClick={() => setDone(null)}>
            Nueva reserva
          </PillButton>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4 p-6 md:p-7">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-2xl font-semibold tracking-[-0.03em]">Reserva tu unidad</p>
          <p className="mt-1 text-[13px] text-(--a-mute)">Entrega estimada · marzo 2027</p>
        </div>
        <p className="text-right">
          <span className="block text-3xl font-semibold tracking-[-0.04em] tabular-nums">899 €</span>
          <span className="amono text-[10px] tracking-[0.14em] text-(--a-mute) uppercase">Depósito 90 €</span>
        </p>
      </div>

      <Field label="Nombre">{(id) => <input id={id} name="name" required autoComplete="name" placeholder="Nombre y apellido" className={inputCls} />}</Field>
      <Field label="Correo electrónico">
        {(id) => <input id={id} name="email" type="email" required autoComplete="email" placeholder="tu@correo.com" className={inputCls} />}
      </Field>
      <Field label="País de entrega">
        {(id) => (
          <select id={id} name="country" defaultValue="CO" className={`${inputCls} appearance-none`}>
            {[
              ['CO', 'Colombia'],
              ['ES', 'España'],
              ['MX', 'México'],
              ['AR', 'Argentina'],
              ['CL', 'Chile'],
              ['US', 'Estados Unidos'],
              ['DE', 'Alemania'],
            ].map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        )}
      </Field>

      <fieldset>
        <legend className="mb-2 text-[12px] font-medium text-(--a-ink-2)">Acabado</legend>
        <div className="grid grid-cols-2 gap-3">
          {FINISHES.map((f) => {
            const on = finish === f.id
            return (
              <label
                key={f.id}
                className={`flex cursor-pointer items-center gap-3 rounded-[1.1rem] p-1 pr-4 ring-1 transition-[box-shadow,background-color] duration-500 ${
                  on ? 'bg-white ring-(--a-ink)' : 'bg-black/[0.035] ring-black/5 hover:bg-white/70'
                }`}
                style={{ transitionTimingFunction: 'var(--a-ease)' }}
              >
                <input type="radio" name="finish" value={f.id} checked={on} onChange={() => setFinish(f.id)} className="sr-only" />
                <span className="size-10 rounded-[0.8rem] ring-1 ring-black/10" style={{ background: f.swatch }} />
                <span className="text-sm font-medium">{f.label}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <p className="amono text-[11px] tracking-[0.1em] text-(--a-mute) uppercase">Quedan 363 de 500</p>
        <PillButton type="submit">Reservar Nº 0138</PillButton>
      </div>
    </form>
  )
}

export function PanelSpecs() {
  return (
    <div className="grid min-h-full items-center gap-10 px-4 pt-28 pb-32 md:grid-cols-12 md:px-14 md:pt-20 md:pb-24">
      <div className="md:col-span-6 lg:col-span-6">
        <Reveal>
          <Eyebrow>04 · Especificaciones</Eyebrow>
          <h2 className="mt-6 text-[clamp(2.4rem,4.4vw,4.4rem)] leading-[0.95] font-semibold tracking-[-0.05em]">Ingeniería, sin adornos.</h2>
        </Reveal>
        <Reveal index={1} className="mt-8">
          <Bezel coreClassName="p-2">
            <div className="grid gap-x-8 sm:grid-cols-2">
              {SPECS.map((g) => (
                <table key={g.group} className="amono w-full border-collapse text-[11.5px]">
                  <caption className="px-3 pt-4 pb-2 text-left text-[10px] tracking-[0.2em] text-(--a-accent) uppercase">{g.group}</caption>
                  <tbody>
                    {g.rows.map(([k, v]) => (
                      <tr key={k} className="border-t border-black/[0.06] transition-colors duration-300 hover:bg-black/[0.03]">
                        <th scope="row" className="w-[38%] px-3 py-2 text-left font-normal text-(--a-mute)">
                          {k}
                        </th>
                        <td className="px-3 py-2 text-(--a-ink)">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </div>
          </Bezel>
        </Reveal>
      </div>

      <Reveal index={2} className="md:col-span-6 lg:col-span-5 lg:col-start-8">
        <Bezel className="a-float">
          <PreorderForm />
        </Bezel>
      </Reveal>
    </div>
  )
}
