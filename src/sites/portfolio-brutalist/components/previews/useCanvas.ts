import { useEffect, useRef, useState } from 'react'

/* Canvas nítido en pantallas HiDPI: ajusta el backing store al tamaño CSS × devicePixelRatio. */
export function useCanvas(aspect: number) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0, dpr: 1 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width)
      const h = Math.round(w / aspect)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      el.width = w * dpr
      el.height = h * dpr
      el.style.height = `${h}px`
      setSize({ w, h, dpr })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [aspect])

  const ctx = () => {
    const c = ref.current?.getContext('2d')
    if (c) c.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
    return c ?? null
  }

  return { ref, size, ctx }
}
