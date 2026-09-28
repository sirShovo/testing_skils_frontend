import { useEffect, useState } from 'react'
import { useI18n, type L } from '../../i18n'

type Sensor = { id: string; label: L; unit: string; min: number; max: number; base: number; step: number }

const SENSORS: Sensor[] = [
  { id: 'T1', label: { es: 'Temperatura', en: 'Temperature' }, unit: '°C', min: 10, max: 32, base: 22, step: 0.4 },
  { id: 'T2', label: { es: 'Temp. suelo', en: 'Soil temp.' }, unit: '°C', min: 12, max: 28, base: 19, step: 0.2 },
  { id: 'H1', label: { es: 'Humedad', en: 'Humidity' }, unit: '%', min: 40, max: 98, base: 71, step: 1.2 },
  { id: 'H2', label: { es: 'Hum. suelo', en: 'Soil moist.' }, unit: '%', min: 20, max: 60, base: 38, step: 0.6 },
  { id: 'P1', label: { es: 'Presión', en: 'Pressure' }, unit: 'hPa', min: 840, max: 860, base: 851, step: 0.3 },
  { id: 'W1', label: { es: 'Viento', en: 'Wind' }, unit: 'km/h', min: 0, max: 40, base: 9, step: 1.8 },
  { id: 'W2', label: { es: 'Ráfaga', en: 'Gust' }, unit: 'km/h', min: 0, max: 60, base: 15, step: 3 },
  { id: 'D1', label: { es: 'Dirección', en: 'Direction' }, unit: '°', min: 0, max: 359, base: 140, step: 9 },
  { id: 'R1', label: { es: 'Lluvia', en: 'Rain' }, unit: 'mm', min: 0, max: 12, base: 0.4, step: 0.35 },
  { id: 'S1', label: { es: 'Radiación', en: 'Radiation' }, unit: 'W/m²', min: 0, max: 1000, base: 520, step: 30 },
  { id: 'U1', label: { es: 'Índice UV', en: 'UV index' }, unit: 'UV', min: 0, max: 12, base: 6, step: 0.3 },
  { id: 'A1', label: { es: 'PM2.5', en: 'PM2.5' }, unit: 'µg/m³', min: 2, max: 80, base: 18, step: 1.5 },
  { id: 'B1', label: { es: 'Batería', en: 'Battery' }, unit: 'V', min: 11.2, max: 13.8, base: 12.9, step: 0.03 },
]

const LEN = 48
const clamp = (v: number, s: Sensor) => Math.min(s.max, Math.max(s.min, v))
const next = (v: number, s: Sensor) => clamp(v + (Math.random() - 0.5) * 2 * s.step + (s.base - v) * 0.05, s)

function seed(): number[][] {
  return SENSORS.map((s) => {
    const out = [s.base]
    for (let i = 1; i < LEN; i++) out.push(next(out[i - 1], s))
    return out
  })
}

const fmt = (v: number, s: Sensor) => v.toFixed(s.max - s.min > 100 ? 0 : 1)

function spark(values: number[], s: Sensor, w: number, h: number) {
  return values
    .map((v, i) => `${i ? 'L' : 'M'}${((i / (LEN - 1)) * w).toFixed(1)},${(h - ((v - s.min) / (s.max - s.min)) * h).toFixed(1)}`)
    .join('')
}

export function SensorsPreview() {
  const { t, lang } = useI18n()
  const [series, setSeries] = useState(seed)
  const [sel, setSel] = useState(0)
  const [running, setRunning] = useState(true)
  const [ticks, setTicks] = useState(0)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setSeries((all) => all.map((vals, i) => [...vals.slice(1), next(vals[vals.length - 1], SENSORS[i])]))
      setTicks((n) => n + 1)
    }, 600)
    return () => window.clearInterval(id)
  }, [running])

  const s = SENSORS[sel]
  const vals = series[sel]
  const last = vals[vals.length - 1]
  const W = 360
  const H = 120

  return (
    <div className="space-y-3">
      <div className="grid gap-4 lg:grid-cols-[1fr_15rem]">
        <div className="border border-current">
          <div className="bm flex items-baseline justify-between border-b border-current px-3 py-2">
            <span>
              {s.id} · {t(s.label)}
            </span>
            <span className="text-lg tabular-nums">
              {fmt(last, s)} <span className="text-[10px]">{s.unit}</span>
            </span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-[140px] w-full" preserveAspectRatio="none" role="img" aria-label={`${t(s.label)}: ${fmt(last, s)} ${s.unit}`}>
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="currentColor" strokeWidth="0.5" opacity="0.3" vectorEffect="non-scaling-stroke" />
            ))}
            <path d={spark(vals, s, W, H)} fill="none" stroke="var(--b-red)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="bm flex justify-between border-t border-current px-3 py-1.5 text-[10px] tabular-nums">
            <span>
              min {fmt(s.min, s)} · max {fmt(s.max, s)}
            </span>
            <span>
              {lang === 'es' ? 'lecturas' : 'readings'} {LEN + ticks}
            </span>
          </div>
        </div>

        <ul className="grid grid-cols-3 gap-px self-start border border-current bg-current sm:grid-cols-5 lg:grid-cols-3">
          {SENSORS.map((sn, i) => (
            <li key={sn.id}>
              <button
                onClick={() => setSel(i)}
                aria-pressed={i === sel}
                className={`bm block w-full px-1.5 py-1.5 text-left text-[9px] transition-colors duration-75 ${
                  i === sel ? 'bg-(--b-red) text-white' : 'bg-(--b-bg) text-(--b-fg) hover:bg-(--b-fg) hover:text-(--b-bg)'
                }`}
              >
                {sn.id}
                <span className="block text-[11px] tabular-nums">{fmt(series[i][LEN - 1], sn)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="bm flex items-center gap-3">
        <button className="b-btn" onClick={() => setRunning((r) => !r)}>
          {running ? (lang === 'es' ? '[ Pausar ]' : '[ Pause ]') : lang === 'es' ? '[ Reanudar ]' : '[ Resume ]'}
        </button>
        <span className="flex items-center gap-2">
          <span className={`size-2 ${running ? 'b-blink bg-(--b-red)' : 'border border-current'}`} />
          {running ? (lang === 'es' ? 'Transmitiendo · 600 ms' : 'Streaming · 600 ms') : lang === 'es' ? 'En pausa' : 'Paused'}
        </span>
      </div>
    </div>
  )
}
