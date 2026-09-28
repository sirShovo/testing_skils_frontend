import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { usePalette } from '../../theme'
import { useCanvas } from './useCanvas'

const COLS = 32
const ROWS = 14
const START = 0
const GOAL = COLS * ROWS - 1

// Mapa inicial con pasillos, estable entre recargas.
function initialWalls() {
  const walls = new Set<number>()
  for (let c = 4; c < COLS - 2; c += 5) {
    const gap = (c * 7) % (ROWS - 2) + 1
    for (let r = 0; r < ROWS; r++) if (Math.abs(r - gap) > 1) walls.add(r * COLS + c)
  }
  walls.delete(START)
  walls.delete(GOAL)
  return walls
}

type Result = { order: number[]; path: number[] }

function astar(walls: Set<number>): Result {
  const h = (i: number) => Math.abs((i % COLS) - (GOAL % COLS)) + Math.abs(Math.floor(i / COLS) - Math.floor(GOAL / COLS))
  const g = new Map<number, number>([[START, 0]])
  const came = new Map<number, number>()
  const open = new Set<number>([START])
  const closed = new Set<number>()
  const order: number[] = []

  while (open.size) {
    let cur = -1
    let best = Infinity
    for (const i of open) {
      const f = (g.get(i) ?? Infinity) + h(i)
      if (f < best || (f === best && h(i) < h(cur))) {
        best = f
        cur = i
      }
    }
    open.delete(cur)
    closed.add(cur)
    order.push(cur)
    if (cur === GOAL) break
    const r = Math.floor(cur / COLS)
    const c = cur % COLS
    const neighbors = [
      r > 0 ? cur - COLS : -1,
      r < ROWS - 1 ? cur + COLS : -1,
      c > 0 ? cur - 1 : -1,
      c < COLS - 1 ? cur + 1 : -1,
    ]
    for (const nb of neighbors) {
      if (nb < 0 || walls.has(nb) || closed.has(nb)) continue
      const tentative = (g.get(cur) ?? 0) + 1
      if (tentative < (g.get(nb) ?? Infinity)) {
        g.set(nb, tentative)
        came.set(nb, cur)
        open.add(nb)
      }
    }
  }

  const path: number[] = []
  if (closed.has(GOAL)) {
    for (let at: number | undefined = GOAL; at !== undefined; at = came.get(at)) path.unshift(at)
  }
  return { order, path }
}

export function AStarPreview() {
  const pal = usePalette()
  const { ref, size, ctx } = useCanvas(COLS / ROWS)
  const [walls, setWalls] = useState(initialWalls)
  const [progress, setProgress] = useState(Infinity) // celdas exploradas visibles
  const [result, setResult] = useState<Result>(() => astar(initialWalls()))
  const painting = useRef<null | boolean>(null)
  const raf = useRef(0)

  const draw = useCallback(() => {
    const c = ctx()
    if (!c || !size.w) return
    const cw = size.w / COLS
    const ch = size.h / ROWS
    c.fillStyle = pal.bg
    c.fillRect(0, 0, size.w, size.h)
    const explored = result.order.slice(0, progress)
    c.fillStyle = pal.faint
    for (const i of explored) c.fillRect((i % COLS) * cw, Math.floor(i / COLS) * ch, cw, ch)
    c.fillStyle = pal.fg
    for (const i of walls) c.fillRect((i % COLS) * cw, Math.floor(i / COLS) * ch, cw, ch)
    if (progress >= result.order.length) {
      c.fillStyle = pal.red
      for (const i of result.path) {
        c.fillRect((i % COLS) * cw + cw * 0.25, Math.floor(i / COLS) * ch + ch * 0.25, cw * 0.5, ch * 0.5)
      }
    }
    // Rejilla
    c.strokeStyle = pal.faint
    c.lineWidth = 1
    c.beginPath()
    for (let x = 1; x < COLS; x++) {
      c.moveTo(Math.round(x * cw) + 0.5, 0)
      c.lineTo(Math.round(x * cw) + 0.5, size.h)
    }
    for (let y = 1; y < ROWS; y++) {
      c.moveTo(0, Math.round(y * ch) + 0.5)
      c.lineTo(size.w, Math.round(y * ch) + 0.5)
    }
    c.stroke()
    // Inicio y meta
    for (const [i, label] of [
      [START, 'A'],
      [GOAL, 'B'],
    ] as const) {
      const x = (i % COLS) * cw
      const y = Math.floor(i / COLS) * ch
      c.fillStyle = pal.red
      c.fillRect(x, y, cw, ch)
      c.fillStyle = '#fff'
      c.font = `800 ${Math.floor(ch * 0.6)}px 'Archivo Variable', sans-serif`
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      c.fillText(label, x + cw / 2, y + ch / 2 + 1)
    }
  }, [ctx, size, pal, walls, result, progress])

  useEffect(draw, [draw])
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const run = () => {
    cancelAnimationFrame(raf.current)
    const r = astar(walls)
    setResult(r)
    let p = 0
    const frame = () => {
      p += 6
      setProgress(p)
      if (p < r.order.length) raf.current = requestAnimationFrame(frame)
    }
    frame()
  }

  const cellAt = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const col = Math.floor(((e.clientX - rect.left) / rect.width) * COLS)
    const row = Math.floor(((e.clientY - rect.top) / rect.height) * ROWS)
    return row * COLS + col
  }

  const paint = (i: number, add: boolean) => {
    if (i === START || i === GOAL) return
    setWalls((w) => {
      if (w.has(i) === add) return w
      const next = new Set(w)
      if (add) next.add(i)
      else next.delete(i)
      return next
    })
    setProgress(0)
  }

  const blocked = progress >= result.order.length && result.path.length === 0

  return (
    <div className="space-y-3">
      <canvas
        ref={ref}
        className="block w-full cursor-crosshair touch-none border border-current"
        aria-label="Rejilla de búsqueda A*. Pulsa y arrastra para dibujar o borrar muros."
        onPointerDown={(e) => {
          const i = cellAt(e)
          painting.current = !walls.has(i)
          paint(i, painting.current)
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => painting.current !== null && paint(cellAt(e), painting.current)}
        onPointerUp={() => (painting.current = null)}
      />
      <div className="bm flex flex-wrap items-center gap-x-5 gap-y-2">
        <button className="b-btn" onClick={run}>
          [ Ejecutar A* ]
        </button>
        <button
          className="b-btn"
          onClick={() => {
            setWalls(initialWalls())
            setResult(astar(initialWalls()))
            setProgress(Infinity)
          }}
        >
          [ Mapa inicial ]
        </button>
        <output className="tabular-nums">
          Exploradas {Math.min(progress, result.order.length)} · Ruta {progress >= result.order.length ? result.path.length : '—'}
        </output>
        {blocked && <span className="text-(--b-red-ink)">Sin ruta posible</span>}
        <span className="text-(--b-mute)">Arrastra sobre la rejilla para editar muros</span>
      </div>
    </div>
  )
}
