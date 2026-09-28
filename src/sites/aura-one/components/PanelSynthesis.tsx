import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { cutoffHz, cyclesFor, describe, morphName, sample, useSynth, type FaderId, type KnobId, type SynthState } from '../synth'
import { Bezel, Eyebrow, Reveal } from './ui'

const HARMONICS = 24

/* Magnitud de los primeros armónicos de un ciclo (DFT directa, N pequeño). */
function spectrum(morph: number, fm: number) {
  const N = 256
  const xs = Array.from({ length: N }, (_, i) => sample(i / N, morph, fm))
  return Array.from({ length: HARMONICS }, (_, k) => {
    let re = 0
    let im = 0
    for (let n = 0; n < N; n++) {
      const a = (2 * Math.PI * (k + 1) * n) / N
      re += xs[n] * Math.cos(a)
      im -= xs[n] * Math.sin(a)
    }
    return Math.hypot(re, im) / (N / 2)
  })
}

// Respuesta aproximada de un paso bajo de 2º orden con resonancia, para atenuar el espectro dibujado.
function lowpass(f: number, fc: number, q: number) {
  const r = f / fc
  return 1 / Math.sqrt((1 - r * r) ** 2 + (r / q) ** 2)
}

function Oscilloscope() {
  const { state } = useSynth()
  const canvas = useRef<HTMLCanvasElement>(null)
  const live = useRef<SynthState>(state)
  useEffect(() => {
    live.current = state
  }, [state])

  useEffect(() => {
    const el = canvas.current!
    const ctx = el.getContext('2d')!
    let raf = 0
    let phase = 0
    let last = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      el.width = el.clientWidth * dpr
      el.height = el.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    const draw = (now: number) => {
      const s = live.current
      const w = el.clientWidth
      const h = el.clientHeight
      const scopeH = h * 0.66
      phase += ((now - last) / 1000) * (0.25 + s.faders.freq * 0.6)
      last = now

      ctx.fillStyle = '#131312'
      ctx.fillRect(0, 0, w, h)

      // Retícula
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let i = 1; i < 10; i++) {
        const x = Math.round((w / 10) * i) + 0.5
        ctx.moveTo(x, 0)
        ctx.lineTo(x, scopeH)
      }
      for (let j = 1; j < 6; j++) {
        const y = Math.round((scopeH / 6) * j) + 0.5
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
      }
      ctx.stroke()

      // Forma de onda
      const cycles = cyclesFor(s.faders.freq)
      const amp = (scopeH / 2 - 14) * (0.12 + s.faders.level * 0.88)
      ctx.save()
      ctx.shadowColor = 'rgba(255,90,31,0.55)'
      ctx.shadowBlur = 14
      ctx.strokeStyle = '#ff5a1f'
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.beginPath()
      for (let x = 0; x <= w; x += 2) {
        const p = (x / w) * cycles + phase
        const y = scopeH / 2 - sample(p - Math.floor(p), s.faders.morph, s.faders.fm) * amp
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.restore()

      // Espectro filtrado
      const mags = spectrum(s.faders.morph, s.faders.fm)
      const fc = cutoffHz(s.knobs.cutoff)
      const q = 0.7 + s.knobs.reso * 17
      const base = 110 * Math.pow(2, (s.faders.freq - 0.5) * 2)
      const top = scopeH + 14
      const bh = h - top - 12
      const bw = w / HARMONICS
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ctx.fillRect(0, scopeH, w, 1)
      mags.forEach((m, k) => {
        const g = Math.min(lowpass(base * (k + 1), fc, q), 3)
        const v = Math.min(1, m * g * 1.3)
        const bar = Math.max(1, v * bh)
        ctx.fillStyle = g < 0.3 ? 'rgba(233,230,223,0.18)' : 'rgba(233,230,223,0.75)'
        ctx.fillRect(k * bw + bw * 0.2, top + bh - bar, bw * 0.6, bar)
      })
      // Frecuencia de corte sobre el eje de armónicos
      const kc = fc / base
      if (kc < HARMONICS) {
        const x = Math.max(0, (kc - 1) * bw + bw / 2)
        ctx.strokeStyle = '#ff5a1f'
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(x, top)
        ctx.lineTo(x, top + bh)
        ctx.stroke()
        ctx.setLineDash([])
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvas}
      className="block h-[clamp(16rem,46vh,28rem)] w-full rounded-[calc(2rem-0.375rem)]"
      role="img"
      aria-label={`Osciloscopio: onda ${morphName(state.faders.morph)}, ${describe('freq', state.faders.freq)}`}
    />
  )
}

const CONTROLS: { kind: 'fader' | 'knob'; id: FaderId | KnobId; label: string }[] = [
  { kind: 'fader', id: 'freq', label: 'Frecuencia' },
  { kind: 'fader', id: 'morph', label: 'Forma de onda' },
  { kind: 'fader', id: 'fm', label: 'Modulación FM' },
  { kind: 'fader', id: 'level', label: 'Nivel' },
  { kind: 'knob', id: 'cutoff', label: 'Corte del filtro' },
  { kind: 'knob', id: 'reso', label: 'Resonancia' },
]

function HSlider({ kind, id, label }: (typeof CONTROLS)[number]) {
  const { state, setFader, setKnob } = useSynth()
  const v = kind === 'fader' ? state.faders[id as FaderId] : state.knobs[id as KnobId]
  const set = (n: number) => {
    const c = Math.min(1, Math.max(0, n))
    if (kind === 'fader') setFader(id as FaderId, c)
    else setKnob(id as KnobId, c)
  }
  const track = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const fromPointer = (e: PointerEvent) => {
    const r = track.current!.getBoundingClientRect()
    set((e.clientX - r.left) / r.width)
  }
  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.02
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') set(v + step)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') set(v - step)
    else return
    e.preventDefault()
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="text-[13px] font-medium text-(--a-ink)">{label}</span>
        <span className="amono text-[11px] text-(--a-mute) tabular-nums">{describe(id, v)}</span>
      </div>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(v * 100)}
        aria-valuetext={describe(id, v)}
        onKeyDown={onKey}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          fromPointer(e)
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e)}
        onPointerUp={() => (dragging.current = false)}
        className="group relative h-8 cursor-ew-resize touch-none"
      >
        <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-black/[0.07]">
          <span className="block h-full w-full origin-left bg-(--a-ink)" style={{ transform: `scaleX(${v})` }} />
        </span>
        <span
          className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-1 ring-black/10 transition-transform duration-300 group-active:scale-110"
          style={{
            left: `${v * 100}%`,
            boxShadow: '0 6px 14px -6px rgba(0,0,0,0.45)',
            transitionTimingFunction: 'var(--a-spring)',
          }}
        >
          <span className="absolute inset-[35%] rounded-full bg-(--a-accent)" />
        </span>
      </div>
    </div>
  )
}

export function PanelSynthesis() {
  const { state } = useSynth()
  return (
    <div className="grid min-h-full items-center gap-12 px-4 pt-28 pb-32 md:grid-cols-12 md:px-14 md:py-24">
      <div className="md:col-span-5 lg:col-span-5">
        <Reveal>
          <Eyebrow>03 · Síntesis</Eyebrow>
          <h2 className="mt-6 text-[clamp(2.4rem,4.4vw,4.4rem)] leading-[0.95] font-semibold tracking-[-0.05em]">Sonido que se ve.</h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-(--a-ink-2)">
            Cuatro osciladores wavetable con morph continuo, FM de dos operadores y un filtro resonante de 24 dB. Mueve los
            controles: el dispositivo del primer panel se mueve contigo.
          </p>
        </Reveal>
        <Reveal index={1} className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {CONTROLS.map((c) => (
            <HSlider key={c.id} {...c} />
          ))}
        </Reveal>
      </div>

      <Reveal index={2} className="md:col-span-7 lg:col-span-7 lg:col-start-6 xl:col-span-6 xl:col-start-7">
        <Bezel coreClassName="bg-[#131312]! p-0">
          <Oscilloscope />
        </Bezel>
        <dl className="amono mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] tracking-[0.08em] text-(--a-mute) uppercase sm:grid-cols-4">
          {[
            ['Onda', morphName(state.faders.morph)],
            ['Corte', describe('cutoff', state.knobs.cutoff)],
            ['Resonancia', describe('reso', state.knobs.reso)],
            ['FM', describe('fm', state.faders.fm)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd className="mt-0.5 text-(--a-ink) normal-case">{v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </div>
  )
}
