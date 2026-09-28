import { useMemo, useState } from 'react'

const KEYS = 72
const VNODES = 6
const NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

// FNV-1a + finalizador de murmur3 (mejor avalancha en cadenas cortas) → posición en [0, 1).
function hash(s: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 2 ** 32
}

type Point = { node: string; pos: number }

function build(nodes: string[]) {
  const points: Point[] = nodes
    .flatMap((n) => Array.from({ length: VNODES }, (_, v) => ({ node: n, pos: hash(`${n}#${v}`) })))
    .sort((a, b) => a.pos - b.pos)
  const owner = (p: number) => (points.find((pt) => pt.pos >= p) ?? points[0]).node
  const keys = Array.from({ length: KEYS }, (_, i) => {
    const pos = hash(`key:${i}`)
    return { id: i, pos, node: owner(pos) }
  })
  return { points, keys }
}

const R = 92
const C = 120
const at = (p: number, r = R) => {
  const a = p * Math.PI * 2 - Math.PI / 2
  return [C + Math.cos(a) * r, C + Math.sin(a) * r] as const
}

export function RingPreview() {
  const [nodes, setNodes] = useState(['A', 'B', 'C', 'D'])
  const [prev, setPrev] = useState<Map<number, string> | null>(null)
  const { points, keys } = useMemo(() => build(nodes), [nodes])
  const moved = prev ? keys.filter((k) => prev.get(k.id) !== k.node).length : 0

  const change = (next: string[]) => {
    setPrev(new Map(keys.map((k) => [k.id, k.node])))
    setNodes(next)
  }

  const counts = nodes.map((n) => ({ n, c: keys.filter((k) => k.node === n).length }))
  const maxCount = Math.max(...counts.map((x) => x.c), 1)

  return (
    <div className="grid gap-4 sm:grid-cols-[15rem_1fr]">
      <svg viewBox="0 0 240 240" className="w-full border border-current" role="img" aria-label={`Anillo de hashing con ${nodes.length} nodos y ${KEYS} claves`}>
        <circle cx={C} cy={C} r={R} fill="none" stroke="currentColor" strokeWidth="1" />
        {keys.map((k) => {
          const [x1, y1] = at(k.pos, R - 4)
          const [x2, y2] = at(k.pos, R - 14)
          const hot = prev && prev.get(k.id) !== k.node
          return <line key={k.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot ? 'var(--b-red)' : 'currentColor'} strokeWidth={hot ? 2 : 1} opacity={hot ? 1 : 0.55} />
        })}
        {points.map((p) => {
          const [x, y] = at(p.pos)
          const [lx, ly] = at(p.pos, R + 14)
          return (
            <g key={`${p.node}-${p.pos}`}>
              <rect x={x - 4} y={y - 4} width="8" height="8" fill="var(--b-bg)" stroke="currentColor" strokeWidth="1.5" />
              <text x={lx} y={ly + 3} textAnchor="middle" fontSize="9" fontFamily="var(--b-mono)" fill="currentColor">
                {p.node}
              </text>
            </g>
          )
        })}
        <text x={C} y={C - 4} textAnchor="middle" fontSize="22" fontWeight="900" fontFamily="var(--b-sans)" fill="currentColor">
          {nodes.length}
        </text>
        <text x={C} y={C + 12} textAnchor="middle" fontSize="8" fontFamily="var(--b-mono)" fill="currentColor" letterSpacing="1">
          NODOS × {VNODES} VNODES
        </text>
      </svg>

      <div className="bm flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <button className="b-btn" disabled={nodes.length >= NAMES.length} onClick={() => change([...nodes, NAMES[nodes.length]])}>
            [ + Nodo ]
          </button>
          <button className="b-btn" disabled={nodes.length <= 2} onClick={() => change(nodes.slice(0, -1))}>
            [ − Nodo ]
          </button>
        </div>
        <output className="text-[11px]">
          {prev ? (
            <>
              <span className="text-(--b-red-ink)">{moved}</span> de {KEYS} claves remapeadas ({Math.round((moved / KEYS) * 100)} %) · ideal ≈{' '}
              {Math.round(100 / Math.max(nodes.length, prev ? new Set(prev.values()).size : 1))} %
            </>
          ) : (
            'Añade o quita un nodo: solo se mueven las claves marcadas en rojo.'
          )}
        </output>
        <table className="w-full border-collapse text-[10px]">
          <caption className="sr-only">Claves por nodo</caption>
          <tbody>
            {counts.map(({ n, c }) => (
              <tr key={n} className="border-t border-current">
                <th scope="row" className="w-6 py-1 text-left font-normal">
                  {n}
                </th>
                <td className="py-1">
                  <span className="block h-2 bg-current" style={{ width: `${(c / maxCount) * 100}%` }} />
                </td>
                <td className="w-8 py-1 text-right tabular-nums">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
