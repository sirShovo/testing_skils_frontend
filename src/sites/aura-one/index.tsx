import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './aura.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BottomIsland, MenuOverlay, TopIsland } from './components/Chrome'
import { PanelAnatomy } from './components/PanelAnatomy'
import { PanelIntro } from './components/PanelIntro'
import { PanelSpecs } from './components/PanelSpecs'
import { PanelSynthesis } from './components/PanelSynthesis'
import { PANELS } from './layout'
import { describe, FADERS, INITIAL, KNOBS, SynthContext, type SynthApi, type SynthState } from './synth'

const isHorizontal = () => window.matchMedia('(min-width: 768px)').matches

// Página generada con la skill `high-end-visual-design`.
export default function AuraOne() {
  const [state, setState] = useState<SynthState>(INITIAL)
  const [highlight, setHighlight] = useState<string | null>(null)
  const [active, setActive] = useState(0)
  const [menu, setMenu] = useState(false)
  const track = useRef<HTMLDivElement>(null)
  const sections = useRef<(HTMLElement | null)[]>([])
  const activeRef = useRef(0)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const prev = document.title
    document.title = 'Aura One — Sintetizador táctil'
    return () => {
      document.title = prev
    }
  }, [])

  const api = useMemo<SynthApi>(
    () => ({
      state,
      highlight,
      setHighlight,
      setKnob: (id, v) =>
        setState((s) => ({ ...s, knobs: { ...s.knobs, [id]: v }, last: { label: KNOBS.find((k) => k.id === id)!.label, value: describe(id, v) } })),
      setFader: (id, v) =>
        setState((s) => ({ ...s, faders: { ...s.faders, [id]: v }, last: { label: FADERS.find((f) => f.id === id)!.label, value: describe(id, v) } })),
      togglePad: (i) =>
        setState((s) => {
          const pads = s.pads.map((p, j) => (j === i ? !p : p))
          return { ...s, pads, last: { label: `PAD ${String(i + 1).padStart(2, '0')}`, value: pads[i] ? 'ON' : 'OFF' } }
        }),
      setPads: (pads) => setState((s) => ({ ...s, pads, last: { label: 'PATTERN', value: `${pads.filter(Boolean).length}/16` } })),
      toggleSound: () => setState((s) => ({ ...s, sound: !s.sound, last: { label: 'SOUND', value: s.sound ? 'OFF' : 'ON' } })),
    }),
    [state, highlight],
  )

  const anim = useRef(0)

  // Desplazamiento propio con rAF: curva de desaceleración pesada y snap en pausa mientras dura,
  // en lugar de depender de `behavior: 'smooth'`, cuya curva y soporte varían entre navegadores.
  const goTo = useCallback((i: number) => {
    const index = Math.max(0, Math.min(PANELS.length - 1, i))
    const target = sections.current[index]
    const el = track.current
    if (!target || !el) return
    if (!isHorizontal()) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    cancelAnimationFrame(anim.current)
    const from = el.scrollLeft
    const to = index * el.clientWidth
    const duration = 950
    const start = performance.now()
    const ease = (t: number) => 1 - Math.pow(1 - t, 4)
    el.style.scrollSnapType = 'none'
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      el.scrollLeft = from + (to - from) * ease(t)
      if (t < 1) anim.current = requestAnimationFrame(frame)
      else el.style.scrollSnapType = ''
    }
    anim.current = requestAnimationFrame(frame)
  }, [])

  useEffect(() => () => cancelAnimationFrame(anim.current), [])

  // Panel activo: el que ocupa más de la mitad del viewport (sirve en horizontal y en vertical).
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index))
        }
      },
      { threshold: 0.55 },
    )
    sections.current.forEach((s) => s && io.observe(s))
    return () => io.disconnect()
  }, [])

  // Rueda vertical → cambio de panel, salvo que el panel tenga su propio scroll pendiente.
  useEffect(() => {
    const el = track.current!
    let acc = 0
    let locked = false
    const onWheel = (e: WheelEvent) => {
      if (!isHorizontal() || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      const panel = (e.target as HTMLElement).closest('section')
      if (panel) {
        const down = e.deltaY > 0
        // Tolerancia de unos píxeles para no quedarse "enganchado" en paneles que desbordan por redondeo.
        const canScroll = down ? panel.scrollTop + panel.clientHeight < panel.scrollHeight - 6 : panel.scrollTop > 6
        if (canScroll) return
      }
      e.preventDefault()
      if (locked) return
      acc += e.deltaY
      if (Math.abs(acc) > 40) {
        goTo(activeRef.current + Math.sign(acc))
        acc = 0
        locked = true
        window.setTimeout(() => (locked = false), 750)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [goTo])

  // Teclado: flechas, Re Pág/Av Pág, Inicio/Fin. Se ignora dentro de campos y sliders.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isHorizontal() || menu) return
      const t = e.target instanceof Element ? e.target : null
      if (t?.closest('input, select, textarea, [role="slider"], [contenteditable="true"]')) return
      const map: Record<string, number> = {
        ArrowRight: activeRef.current + 1,
        PageDown: activeRef.current + 1,
        ArrowLeft: activeRef.current - 1,
        PageUp: activeRef.current - 1,
        Home: 0,
        End: PANELS.length - 1,
      }
      if (e.key in map) {
        e.preventDefault()
        goTo(map[e.key])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo, menu])

  const pickFromMenu = useCallback(
    (i: number) => {
      setMenu(false)
      goTo(i)
    },
    [goTo],
  )

  const panels = [<PanelIntro key="intro" goTo={goTo} />, <PanelAnatomy key="anatomy" />, <PanelSynthesis key="synthesis" />, <PanelSpecs key="specs" />]

  return (
    <SynthContext.Provider value={api}>
      <div className="aura md:h-[100dvh] md:overflow-hidden">
        <div className="a-grain" aria-hidden="true" />
        <TopIsland open={menu} setOpen={setMenu} />
        <MenuOverlay open={menu} active={active} onPick={pickFromMenu} />

        <div
          ref={track}
          className="md:flex md:h-full md:snap-x md:snap-mandatory md:overflow-x-auto md:overflow-y-hidden md:overscroll-x-contain [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {panels.map((panel, i) => (
            <section
              key={i}
              ref={(el) => {
                sections.current[i] = el
              }}
              data-index={i}
              aria-label={PANELS[i]}
              className="relative min-h-[100dvh] md:h-full md:w-screen md:shrink-0 md:snap-start md:overflow-y-auto"
            >
              {/* Numeración de panel en el margen */}
              <span className="amono pointer-events-none absolute top-7 right-8 hidden text-[10px] tracking-[0.2em] text-(--a-mute) uppercase md:block">
                {String(i + 1).padStart(2, '0')} / {String(PANELS.length).padStart(2, '0')}
              </span>
              {panel}
            </section>
          ))}
        </div>

        {!menu && <BottomIsland active={active} goTo={goTo} />}
      </div>
    </SynthContext.Provider>
  )
}
