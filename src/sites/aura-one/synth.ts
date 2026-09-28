import { createContext, useContext } from 'react'

export type KnobId = 'cutoff' | 'reso' | 'attack' | 'release'
export type FaderId = 'freq' | 'morph' | 'fm' | 'level'

export type SynthState = {
  knobs: Record<KnobId, number> // 0..1
  faders: Record<FaderId, number> // 0..1
  pads: boolean[]
  last: { label: string; value: string }
  sound: boolean
}

export const KNOBS: { id: KnobId; label: string }[] = [
  { id: 'cutoff', label: 'CUTOFF' },
  { id: 'reso', label: 'RESO' },
  { id: 'attack', label: 'ATTACK' },
  { id: 'release', label: 'RELEASE' },
]

export const FADERS: { id: FaderId; label: string }[] = [
  { id: 'freq', label: 'FREQ' },
  { id: 'morph', label: 'MORPH' },
  { id: 'fm', label: 'FM' },
  { id: 'level', label: 'LEVEL' },
]

export const INITIAL: SynthState = {
  knobs: { cutoff: 0.62, reso: 0.28, attack: 0.08, release: 0.35 },
  faders: { freq: 0.35, morph: 0.32, fm: 0.12, level: 0.78 },
  pads: Array.from({ length: 16 }, (_, i) => [0, 2, 5, 7, 10, 13].includes(i)),
  last: { label: 'PATCH', value: 'GLASS 07' },
  sound: false,
}

/* Formato legible de cada parámetro, compartido por display y panel 3. */
export const WAVE_NAMES = ['SINE', 'TRI', 'SAW', 'SQUARE']

export function describe(id: KnobId | FaderId, v: number): string {
  switch (id) {
    case 'cutoff':
      return `${Math.round(cutoffHz(v)).toLocaleString('es')} Hz`
    case 'reso':
      return `Q ${(0.7 + v * 17).toFixed(1)}`
    case 'attack':
      return `${Math.round(attackS(v) * 1000)} ms`
    case 'release':
      return `${Math.round(releaseS(v) * 1000)} ms`
    case 'freq':
      return `${cyclesFor(v).toFixed(1)} ciclos · ${octaveShift(v) >= 0 ? '+' : ''}${octaveShift(v).toFixed(1)} oct`
    case 'morph':
      return morphName(v)
    case 'fm':
      return `${Math.round(v * 100)} %`
    case 'level':
      return `${Math.round(-36 + v * 36)} dB`
  }
}

export const cutoffHz = (v: number) => 120 * Math.pow(2, v * 7.2)
export const attackS = (v: number) => 0.003 + v * v * 1.2
export const releaseS = (v: number) => 0.05 + v * v * 2.4
export const octaveShift = (v: number) => (v - 0.5) * 2
export const cyclesFor = (v: number) => 1.5 + v * 6

export function morphName(v: number) {
  const pos = v * 3
  const i = Math.min(Math.floor(pos), 2)
  const f = pos - i
  if (f < 0.12) return WAVE_NAMES[i]
  if (f > 0.88) return WAVE_NAMES[i + 1]
  return `${WAVE_NAMES[i]}→${WAVE_NAMES[i + 1]}`
}

/* Forma de onda en fase p ∈ [0,1): morph continuo seno → triángulo → sierra → cuadrada, con modulación de fase. */
export function sample(p: number, morph: number, fm: number) {
  const q = p + fm * 0.22 * Math.sin(2 * Math.PI * p * 3)
  const ph = q - Math.floor(q)
  // Todas las formas en fase con el seno (0 en p=0, pico en p=0.25) para que el morph no salte.
  const shapes = [
    Math.sin(2 * Math.PI * ph),
    ph < 0.25 ? 4 * ph : ph < 0.75 ? 2 - 4 * ph : 4 * ph - 4,
    ph < 0.5 ? 2 * ph : 2 * ph - 2,
    ph < 0.5 ? 1 : -1,
  ]
  const pos = morph * 3
  const i = Math.min(Math.floor(pos), 2)
  const f = pos - i
  return shapes[i] * (1 - f) + shapes[i + 1] * f
}

/* ------------------------------------------------------------------ */
/* Motor de audio: solo se crea tras un gesto del usuario con el sonido activado. */
/* ------------------------------------------------------------------ */

let ctx: AudioContext | null = null

// Pentatónica menor de Do, dos octavas.
const SCALE = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24, 27, 29, 31, 34, 36]

export function playPad(index: number, s: SynthState) {
  if (!s.sound) return
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  const now = ctx.currentTime
  const hz = 130.81 * Math.pow(2, SCALE[index] / 12 + octaveShift(s.faders.freq))
  const waveIdx = Math.round(s.faders.morph * 3)
  const type: OscillatorType = (['sine', 'triangle', 'sawtooth', 'square'] as const)[waveIdx]

  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.value = hz

  // FM: un modulador sinusoidal a 3× la portadora.
  const mod = ctx.createOscillator()
  const modGain = ctx.createGain()
  mod.frequency.value = hz * 3
  modGain.gain.value = s.faders.fm * hz * 2.5
  mod.connect(modGain).connect(osc.frequency)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = cutoffHz(s.knobs.cutoff)
  filter.Q.value = 0.7 + s.knobs.reso * 17

  const amp = ctx.createGain()
  const peak = 0.22 * Math.pow(10, (-36 + s.faders.level * 36) / 20)
  const a = attackS(s.knobs.attack)
  const r = releaseS(s.knobs.release)
  amp.gain.setValueAtTime(0, now)
  amp.gain.linearRampToValueAtTime(peak, now + a)
  amp.gain.setTargetAtTime(0, now + a + 0.08, r / 4)

  osc.connect(filter).connect(amp).connect(ctx.destination)
  const stop = now + a + 0.08 + r * 1.6
  osc.start(now)
  mod.start(now)
  osc.stop(stop)
  mod.stop(stop)
}

/* ------------------------------------------------------------------ */

export type SynthApi = {
  state: SynthState
  setKnob: (id: KnobId, v: number) => void
  setFader: (id: FaderId, v: number) => void
  togglePad: (i: number) => void
  setPads: (pads: boolean[]) => void
  toggleSound: () => void
  highlight: string | null
  setHighlight: (id: string | null) => void
}

export const SynthContext = createContext<SynthApi | null>(null)

export function useSynth() {
  const api = useContext(SynthContext)
  if (!api) throw new Error('useSynth fuera de SynthContext')
  return api
}
