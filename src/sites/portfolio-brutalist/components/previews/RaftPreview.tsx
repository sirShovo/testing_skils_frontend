import { useEffect, useState } from 'react'

type Role = 'follower' | 'candidate' | 'leader' | 'down'
type Node = { id: number; role: Role; term: number; timer: number }
type Sim = { nodes: Node[]; tick: number; log: string[] }

const N = 5
const TICK = 100
const HEARTBEAT = 3 // ticks
const randTimeout = () => 15 + Math.floor(Math.random() * 15) // 1.5–3 s

const initialSim = (msg = 'T1 · N1 líder inicial'): Sim => ({
  nodes: Array.from({ length: N }, (_, i) => ({ id: i, role: i === 0 ? 'leader' : 'follower', term: 1, timer: randTimeout() })),
  tick: 0,
  log: [msg],
})

const pushLog = (log: string[], msgs: string[]) => (msgs.length ? [...msgs, ...log].slice(0, 5) : log)

/* Un paso de simulación simplificada: heartbeats, timeouts y votación por mayoría. */
function step(sim: Sim): Sim {
  const tick = sim.tick + 1
  const nodes = sim.nodes.map((n) => ({ ...n }))
  const msgs: string[] = []
  const alive = nodes.filter((n) => n.role !== 'down')
  const leader = alive.find((n) => n.role === 'leader')

  if (leader && tick % HEARTBEAT === 0) {
    for (const n of alive) {
      if (n.id !== leader.id && n.term <= leader.term) {
        n.term = leader.term
        n.role = 'follower'
        n.timer = randTimeout()
      }
    }
  }

  for (const n of alive) {
    if (n.role === 'leader') continue
    n.timer -= 1
    if (n.timer > 0) continue
    // Timeout: pasa a candidata, sube el término y pide votos.
    n.role = 'candidate'
    n.term += 1
    n.timer = randTimeout()
    const voters = alive.filter((v) => v.id === n.id || v.term < n.term)
    for (const v of voters) {
      if (v.id !== n.id) {
        v.term = n.term
        v.role = 'follower'
        v.timer = randTimeout()
      }
    }
    if (voters.length > N / 2) {
      for (const other of alive) if (other.role === 'leader') other.role = 'follower'
      n.role = 'leader'
      msgs.push(`T${n.term} · N${n.id + 1} gana con ${voters.length}/${N} votos`)
    } else {
      msgs.push(`T${n.term} · N${n.id + 1} sin quórum (${voters.length}/${N})`)
    }
    break
  }
  return { nodes, tick, log: pushLog(sim.log, msgs) }
}

function toggleNode(sim: Sim, id: number): Sim {
  const target = sim.nodes[id]
  const down = target.role === 'down'
  const msg = down ? `N${id + 1} vuelve como seguidora` : `N${id + 1} caída${target.role === 'leader' ? ' (era líder)' : ''}`
  return {
    ...sim,
    nodes: sim.nodes.map((n) =>
      n.id !== id ? n : down ? { ...n, role: 'follower', timer: randTimeout() } : { ...n, role: 'down' },
    ),
    log: pushLog(sim.log, [msg]),
  }
}

const pos = (i: number) => {
  const a = (i / N) * Math.PI * 2 - Math.PI / 2
  return [150 + Math.cos(a) * 88, 115 + Math.sin(a) * 88] as const
}

export function RaftPreview({ active }: { active: boolean }) {
  const [sim, setSim] = useState(() => initialSim())

  useEffect(() => {
    if (!active) return
    const t = window.setInterval(() => setSim(step), TICK)
    return () => window.clearInterval(t)
  }, [active])

  const { nodes, tick, log } = sim
  const leader = nodes.find((n) => n.role === 'leader')
  const beat = tick % HEARTBEAT === 0
  const toggle = (id: number) => setSim((s) => toggleNode(s, id))

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
      <svg viewBox="0 0 300 230" className="w-full border border-current" role="group" aria-label="Simulación de un cluster Raft de 5 nodos">
        {leader &&
          nodes.map((n) => {
            if (n.id === leader.id || n.role === 'down') return null
            const [x1, y1] = pos(leader.id)
            const [x2, y2] = pos(n.id)
            return (
              <line
                key={n.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={beat ? 'var(--b-red)' : 'currentColor'}
                strokeWidth={beat ? 1.5 : 0.75}
                strokeDasharray={beat ? undefined : '2 3'}
              />
            )
          })}
        {nodes.map((n) => {
          const [x, y] = pos(n.id)
          const down = n.role === 'down'
          const onRed = n.role === 'leader'
          return (
            <g
              key={n.id}
              role="button"
              tabIndex={0}
              aria-label={`Nodo ${n.id + 1}, ${n.role}, término ${n.term}. Pulsa para ${down ? 'recuperarlo' : 'tirarlo'}`}
              onClick={() => toggle(n.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggle(n.id)
                }
              }}
              className="cursor-pointer outline-none"
            >
              <rect
                x={x - 22}
                y={y - 22}
                width="44"
                height="44"
                fill={onRed ? 'var(--b-red)' : 'var(--b-bg)'}
                stroke={n.role === 'candidate' ? 'var(--b-red)' : 'currentColor'}
                strokeWidth={n.role === 'candidate' ? 2.5 : 1.5}
                strokeDasharray={n.role === 'candidate' ? '4 3' : undefined}
                opacity={down ? 0.35 : 1}
              />
              {down && (
                <path d={`M${x - 22} ${y - 22}L${x + 22} ${y + 22}M${x + 22} ${y - 22}L${x - 22} ${y + 22}`} stroke="currentColor" />
              )}
              <text x={x} y={y - 2} textAnchor="middle" fontSize="12" fontWeight="800" fill={onRed ? '#fff' : 'currentColor'} fontFamily="var(--b-sans)">
                N{n.id + 1}
              </text>
              <text x={x} y={y + 12} textAnchor="middle" fontSize="8" fill={onRed ? '#fff' : 'currentColor'} fontFamily="var(--b-mono)">
                T{n.term}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="bm flex flex-col gap-3">
        <p className="text-[11px] normal-case tracking-normal">
          Pulsa un nodo para tirarlo o recuperarlo. Tumba a la líder y observa la elección.
        </p>
        <dl className="grid grid-cols-2 gap-px border border-current bg-current">
          {(['leader', 'candidate', 'follower', 'down'] as const).map((r) => (
            <div key={r} className="bg-(--b-bg) px-2 py-1.5 text-(--b-fg)">
              <dt className="text-[9px] text-(--b-mute)">{r}</dt>
              <dd className="text-sm tabular-nums">{nodes.filter((n) => n.role === r).length}</dd>
            </div>
          ))}
        </dl>
        <ol className="space-y-1 text-[10px]" aria-live="polite">
          {log.map((l, i) => (
            <li key={`${l}-${i}`} className={i === 0 ? 'text-(--b-red-ink)' : ''}>
              {'>'} {l}
            </li>
          ))}
        </ol>
        <button className="b-btn self-start" onClick={() => setSim(initialSim('T1 · reinicio'))}>
          [ Reiniciar ]
        </button>
      </div>
    </div>
  )
}
