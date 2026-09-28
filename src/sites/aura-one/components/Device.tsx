import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { PARTS, type PartId } from '../layout'
import { describe, FADERS, KNOBS, playPad, sample, useSynth, type FaderId, type KnobId } from '../synth'

const box = (id: PartId) => {
  const p = PARTS[id]
  return { left: `${p.left}%`, top: `${p.top}%`, width: `${p.w}%`, height: `${p.h}%` }
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/* Arco de círculo (r=46, centro 50,50) entre dos ángulos en grados, 0° = arriba. */
function arcPath(fromDeg: number, toDeg: number) {
  const r = 46
  const pt = (deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180
    return `${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`
  }
  const large = toDeg - fromDeg > 180 ? 1 : 0
  return `M ${pt(fromDeg)} A ${r} ${r} 0 ${large} 1 ${pt(toDeg)}`
}

function stepFromKey(e: KeyboardEvent, v: number) {
  const step = e.shiftKey ? 0.1 : 0.02
  if (e.key === 'ArrowUp' || e.key === 'ArrowRight') return clamp01(v + step)
  if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') return clamp01(v - step)
  if (e.key === 'Home') return 0
  if (e.key === 'End') return 1
  return null
}

function Knob({ id, label }: { id: KnobId; label: string }) {
  const { state, setKnob } = useSynth()
  const v = state.knobs[id]
  const drag = useRef<{ y: number; v: number } | null>(null)
  const angle = -135 + v * 270

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { y: e.clientY, v }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    setKnob(id, clamp01(drag.current.v + (drag.current.y - e.clientY) / 180))
  }

  // Arcos alrededor del encoder: pista completa de 270° y valor actual.
  const track = arcPath(-135, 135)
  const arc = arcPath(-135, angle)

  return (
    <div className="flex flex-col items-center gap-[0.9cqw]">
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(v * 100)}
        aria-valuetext={describe(id, v)}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={() => (drag.current = null)}
        onKeyDown={(e) => {
          const next = stepFromKey(e, v)
          if (next !== null) {
            e.preventDefault()
            setKnob(id, next)
          }
        }}
        className="relative size-[8cqw] cursor-ns-resize touch-none rounded-full outline-offset-4"
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 overflow-visible">
          <path d={track} fill="none" stroke="rgb(0 0 0 / 0.1)" strokeWidth="3" strokeLinecap="round" />
          {v > 0.001 && <path d={arc} fill="none" stroke="var(--a-accent)" strokeWidth="3" strokeLinecap="round" />}
        </svg>
        <div
          className="a-knob-cap absolute inset-[12%] rounded-full"
          style={{
            transform: `rotate(${angle}deg)`,
            background: 'radial-gradient(circle at 50% 30%, #3a3a38, #151514 70%)',
            boxShadow: '0 0.5cqw 1cqw -0.2cqw rgb(0 0 0 / 0.55), inset 0 0.15cqw 0.1cqw rgb(255 255 255 / 0.18)',
          }}
        >
          <span className="absolute top-[8%] left-1/2 h-[30%] w-[0.5cqw] -translate-x-1/2 rounded-full bg-(--a-bg-2)" />
        </div>
      </div>
      <span className="amono text-[1.15cqw] tracking-[0.12em] text-(--a-ink-2)">{label}</span>
    </div>
  )
}

function Fader({ id, label }: { id: FaderId; label: string }) {
  const { state, setFader } = useSynth()
  const v = state.faders[id]
  const track = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const setFromPointer = (clientY: number) => {
    const r = track.current!.getBoundingClientRect()
    setFader(id, clamp01(1 - (clientY - r.top) / r.height))
  }

  return (
    <div className="flex h-full flex-col items-center gap-[0.9cqw]">
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(v * 100)}
        aria-valuetext={describe(id, v)}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          setFromPointer(e.clientY)
        }}
        onPointerMove={(e) => dragging.current && setFromPointer(e.clientY)}
        onPointerUp={() => (dragging.current = false)}
        onKeyDown={(e) => {
          const next = stepFromKey(e, v)
          if (next !== null) {
            e.preventDefault()
            setFader(id, next)
          }
        }}
        className="relative w-[4.2cqw] flex-1 cursor-ns-resize touch-none rounded-full"
      >
        {/* Ranura */}
        <span className="absolute inset-y-[3%] left-1/2 w-[0.7cqw] -translate-x-1/2 rounded-full bg-[#1b1b1a] shadow-[inset_0_0.15cqw_0.2cqw_rgb(0_0_0/0.8)]" />
        {/* Marcas de escala */}
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="absolute right-0 h-px w-[0.8cqw] bg-(--a-ink) opacity-25" style={{ top: `${6 + i * 11}%` }} />
        ))}
        {/* Tapa */}
        <span
          className="absolute left-1/2 flex h-[2.6cqw] w-[4.2cqw] -translate-x-1/2 items-center justify-center rounded-[0.7cqw]"
          style={{
            top: `calc(${(1 - v) * 100}% - ${(1 - v) * 2.6}cqw)`,
            background: 'linear-gradient(180deg, #f4f3ef, #c9c8c2)',
            boxShadow: '0 0.45cqw 0.8cqw -0.2cqw rgb(0 0 0 / 0.45), inset 0 0.1cqw 0 rgb(255 255 255 / 0.9)',
          }}
        >
          <span className="h-[0.25cqw] w-[2.4cqw] rounded-full bg-(--a-accent)" />
        </span>
      </div>
      <span className="amono text-[1.15cqw] tracking-[0.12em] text-(--a-ink-2)">{label}</span>
    </div>
  )
}

function Display() {
  const { state } = useSynth()
  const W = 200
  const H = 48
  const path = Array.from({ length: 121 }, (_, i) => {
    const p = i / 120
    const y = sample(p * 2, state.faders.morph, state.faders.fm) * (0.15 + state.faders.level * 0.85)
    return `${i ? 'L' : 'M'}${(p * W).toFixed(1)},${(H / 2 - y * (H / 2 - 3)).toFixed(1)}`
  }).join('')
  const lit = state.pads.filter(Boolean).length

  return (
    <div className="a-display flex h-full flex-col justify-between">
      <div className="flex justify-between text-[#8f8c84]">
        <span>AURA·ONE</span>
        <span>PATCH 07</span>
      </div>
      <div className="flex items-baseline justify-between gap-[1cqw]">
        <span className="text-[1.2cqw] text-[#8f8c84]">{state.last.label}</span>
        <span className="truncate text-[2.2cqw] leading-none tracking-tight">{state.last.value}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[40%] w-full" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="#3a3935" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={path} fill="none" stroke="var(--a-accent)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex justify-between text-[1.1cqw] text-[#8f8c84]">
        <span>
          PADS {String(lit).padStart(2, '0')}/16
        </span>
        <span className={state.sound ? 'text-(--a-accent)' : ''}>SND {state.sound ? 'ON' : 'OFF'}</span>
      </div>
    </div>
  )
}

function RoundButton({ label, onClick, active = false }: { label: string; onClick: () => void; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-[0.6cqw]">
      <button
        onClick={onClick}
        aria-pressed={active}
        aria-label={label}
        className="relative size-[5cqw] rounded-full transition-transform duration-200 active:scale-[0.94]"
        style={{
          background: 'linear-gradient(180deg, #f1f0ec, #cbcac4)',
          boxShadow: '0 0.45cqw 0.9cqw -0.2cqw rgb(0 0 0 / 0.4), inset 0 0.1cqw 0 rgb(255 255 255 / 0.9)',
          transitionTimingFunction: 'var(--a-ease)',
        }}
      >
        <span
          className="absolute top-1/2 left-1/2 size-[1cqw] -translate-1/2 rounded-full transition-colors duration-300"
          style={{ background: active ? 'var(--a-accent)' : '#8d8c86', boxShadow: active ? '0 0 1cqw var(--a-accent)' : 'none' }}
        />
      </button>
      <span className="amono text-[1cqw] tracking-[0.12em] text-(--a-ink-2)">{label}</span>
    </div>
  )
}

export function Device({ label = 'Sintetizador Aura One interactivo' }: { label?: string }) {
  const api = useSynth()
  const { state, togglePad, setPads, toggleSound, highlight } = api
  const [hit, setHit] = useState<number | null>(null)

  const hl = (id: PartId) => (highlight === id ? 'true' : undefined)

  return (
    <div className="a-device" role="group" aria-label={label}>
      <div className="a-chassis">
        <div className="a-plate">
          {[
            [2.2, 3.4],
            [97.8, 3.4],
            [2.2, 96.6],
            [97.8, 96.6],
          ].map(([x, y]) => (
            <span key={`${x}-${y}`} className="a-screw" style={{ left: `calc(${x}% - 0.65cqw)`, top: `calc(${y}% - 0.65cqw)` }} />
          ))}
        </div>
      </div>

      <div className="a-part" data-highlight={hl('display')} style={box('display')}>
        <Display />
      </div>

      <div className="a-part flex items-start justify-between px-[1cqw]" data-highlight={hl('knobs')} style={box('knobs')}>
        {KNOBS.map((k) => (
          <Knob key={k.id} id={k.id} label={k.label} />
        ))}
      </div>

      <div className="a-part flex justify-between px-[0.6cqw]" data-highlight={hl('faders')} style={box('faders')}>
        {FADERS.map((f) => (
          <Fader key={f.id} id={f.id} label={f.label} />
        ))}
      </div>

      <div className="a-part flex flex-col items-center justify-between py-[0.6cqw]" data-highlight={hl('transport')} style={box('transport')}>
        <RoundButton label="SOUND" active={state.sound} onClick={toggleSound} />
        <RoundButton label="CLEAR" onClick={() => setPads(Array(16).fill(false))} />
        <RoundButton label="RAND" onClick={() => setPads(Array.from({ length: 16 }, () => Math.random() < 0.38))} />
      </div>

      <div className="a-part grid grid-cols-4 gap-[1.1cqw] p-[0.4cqw]" data-highlight={hl('pads')} style={box('pads')}>
        {state.pads.map((on, i) => (
          <button
            key={i}
            className="a-pad"
            aria-pressed={on}
            aria-label={`Pad ${i + 1}`}
            data-hit={hit === i ? 'true' : undefined}
            onPointerDown={() => {
              setHit(i)
              playPad(i, state)
            }}
            onPointerUp={() => setHit(null)}
            onPointerLeave={() => setHit(null)}
            onClick={() => togglePad(i)}
          />
        ))}
      </div>

      <div className="a-part a-grille rounded-[1.4cqw]" data-highlight={hl('grille')} style={box('grille')} aria-hidden="true" />

      <div className="a-part flex flex-col justify-end text-right" data-highlight={hl('plate')} style={box('plate')}>
        <span className="text-[1.9cqw] font-semibold tracking-[-0.03em] text-(--a-ink)">aura one</span>
        <span className="amono text-[1cqw] tracking-[0.12em] text-(--a-mute)">Nº 0137 / 0500</span>
      </div>
    </div>
  )
}
