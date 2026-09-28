import { useCallback, useEffect, useRef, useState } from 'react'
import { usePalette } from '../../theme'
import { useCanvas } from './useCanvas'

const SIZE = 56

type Frame = { arr: number[]; active: number[]; sorted: number; ops: number }
type Algo = 'insertion' | 'quick' | 'merge'

const shuffled = () => {
  const a = Array.from({ length: SIZE }, (_, i) => i + 1)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Cada algoritmo emite fotogramas; la animación solo los reproduce.
function* insertion(src: number[]): Generator<Frame> {
  const a = [...src]
  let ops = 0
  for (let i = 1; i < a.length; i++) {
    let j = i
    while (j > 0 && a[j - 1] > a[j]) {
      ;[a[j - 1], a[j]] = [a[j], a[j - 1]]
      ops++
      yield { arr: [...a], active: [j - 1, j], sorted: 0, ops }
      j--
    }
  }
  yield { arr: a, active: [], sorted: a.length, ops }
}

function* quick(src: number[]): Generator<Frame> {
  const a = [...src]
  let ops = 0
  const stack: [number, number][] = [[0, a.length - 1]]
  while (stack.length) {
    const [lo, hi] = stack.pop()!
    if (lo >= hi) continue
    const pivot = a[hi]
    let i = lo
    for (let j = lo; j < hi; j++) {
      ops++
      if (a[j] < pivot) {
        ;[a[i], a[j]] = [a[j], a[i]]
        i++
      }
      yield { arr: [...a], active: [j, hi], sorted: 0, ops }
    }
    ;[a[i], a[hi]] = [a[hi], a[i]]
    stack.push([lo, i - 1], [i + 1, hi])
  }
  yield { arr: a, active: [], sorted: a.length, ops }
}

function* merge(src: number[]): Generator<Frame> {
  const a = [...src]
  let ops = 0
  for (let width = 1; width < a.length; width *= 2) {
    for (let lo = 0; lo < a.length - width; lo += width * 2) {
      const mid = lo + width
      const hi = Math.min(lo + width * 2, a.length)
      const merged: number[] = []
      let i = lo
      let j = mid
      while (i < mid || j < hi) {
        ops++
        if (j >= hi || (i < mid && a[i] <= a[j])) merged.push(a[i++])
        else merged.push(a[j++])
      }
      for (let k = 0; k < merged.length; k++) {
        a[lo + k] = merged[k]
        yield { arr: [...a], active: [lo + k], sorted: 0, ops }
      }
    }
  }
  yield { arr: a, active: [], sorted: a.length, ops }
}

const ALGOS: Record<Algo, { label: string; fn: (a: number[]) => Generator<Frame>; big: string }> = {
  insertion: { label: 'Inserción', fn: insertion, big: 'O(n²)' },
  quick: { label: 'Quicksort', fn: quick, big: 'O(n log n)' },
  merge: { label: 'Merge', fn: merge, big: 'O(n log n)' },
}

export function SortPreview() {
  const pal = usePalette()
  const { ref, size, ctx } = useCanvas(3.2)
  const [algo, setAlgo] = useState<Algo>('quick')
  const [frame, setFrame] = useState<Frame>(() => ({ arr: shuffled(), active: [], sorted: 0, ops: 0 }))
  const [running, setRunning] = useState(false)
  const raf = useRef(0)

  const draw = useCallback(() => {
    const c = ctx()
    if (!c || !size.w) return
    c.fillStyle = pal.bg
    c.fillRect(0, 0, size.w, size.h)
    const bw = size.w / SIZE
    frame.arr.forEach((v, i) => {
      const h = (v / SIZE) * (size.h - 8)
      c.fillStyle = frame.active.includes(i) ? pal.red : frame.sorted ? pal.fg : pal.mute
      c.fillRect(i * bw + 1, size.h - h, Math.max(bw - 2, 1), h)
    })
  }, [ctx, size, pal, frame])

  useEffect(draw, [draw])
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const run = () => {
    cancelAnimationFrame(raf.current)
    const gen = ALGOS[algo].fn(frame.sorted ? shuffled() : frame.arr)
    setRunning(true)
    const tick = () => {
      // Varios pasos por fotograma para que inserción no dure un minuto.
      let last: IteratorResult<Frame> | null = null
      for (let k = 0; k < (algo === 'insertion' ? 8 : 3); k++) {
        last = gen.next()
        if (last.done) break
        setFrame(last.value)
      }
      if (last && !last.done) raf.current = requestAnimationFrame(tick)
      else setRunning(false)
    }
    tick()
  }

  const reset = () => {
    cancelAnimationFrame(raf.current)
    setRunning(false)
    setFrame({ arr: shuffled(), active: [], sorted: 0, ops: 0 })
  }

  return (
    <div className="space-y-3">
      <canvas ref={ref} className="block w-full border border-current" aria-label={`Visualización de ${ALGOS[algo].label} sobre ${SIZE} elementos`} />
      <div className="bm flex flex-wrap items-center gap-2">
        {(Object.keys(ALGOS) as Algo[]).map((k) => (
          <button key={k} className="b-btn" aria-pressed={algo === k} disabled={running} onClick={() => setAlgo(k)}>
            {ALGOS[k].label}
          </button>
        ))}
        <span className="mx-2 hidden h-4 w-px bg-current sm:block" />
        <button className="b-btn" onClick={run} disabled={running}>
          [ Ordenar ]
        </button>
        <button className="b-btn" onClick={reset}>
          [ Mezclar ]
        </button>
        <output className="ml-auto tabular-nums">
          {ALGOS[algo].big} · {frame.ops} ops
        </output>
      </div>
    </div>
  )
}
