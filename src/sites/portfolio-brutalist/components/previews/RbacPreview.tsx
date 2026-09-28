import { useState } from 'react'
import { useI18n, type L } from '../../i18n'

type Action = 'read' | 'create' | 'update' | 'delete'
const ACTIONS: { id: Action; method: string }[] = [
  { id: 'read', method: 'GET' },
  { id: 'create', method: 'POST' },
  { id: 'update', method: 'PATCH' },
  { id: 'delete', method: 'DELETE' },
]

const RESOURCES: { id: string; label: L; path: string }[] = [
  { id: 'users', label: { es: 'Usuarios', en: 'Users' }, path: '/users' },
  { id: 'invoices', label: { es: 'Facturación', en: 'Invoicing' }, path: '/invoices' },
  { id: 'inventory', label: { es: 'Inventario', en: 'Inventory' }, path: '/inventory' },
  { id: 'shipping', label: { es: 'Envíos', en: 'Shipping' }, path: '/shipments' },
  { id: 'reports', label: { es: 'Reportes', en: 'Reports' }, path: '/reports' },
]

// Permisos como cadena "recurso:acción"; * = todas las acciones.
const ROLES: { id: string; label: L; grants: string[] }[] = [
  { id: 'admin', label: { es: 'Admin', en: 'Admin' }, grants: ['users:*', 'invoices:*', 'inventory:*', 'shipping:*', 'reports:*'] },
  {
    id: 'ops',
    label: { es: 'Operaciones', en: 'Operations' },
    grants: ['inventory:*', 'shipping:read', 'shipping:create', 'shipping:update', 'reports:read'],
  },
  {
    id: 'accounting',
    label: { es: 'Contabilidad', en: 'Accounting' },
    grants: ['invoices:read', 'invoices:create', 'invoices:update', 'reports:read', 'users:read'],
  },
  { id: 'customer', label: { es: 'Cliente', en: 'Customer' }, grants: ['invoices:read', 'shipping:read'] },
]

const can = (grants: string[], res: string, act: Action) => grants.includes(`${res}:*`) || grants.includes(`${res}:${act}`)

export function RbacPreview() {
  const { t, lang } = useI18n()
  const [roleId, setRoleId] = useState('ops')
  const role = ROLES.find((r) => r.id === roleId)!
  const [log, setLog] = useState<{ line: string; ok: boolean }[]>([])

  const request = (res: (typeof RESOURCES)[number], act: (typeof ACTIONS)[number]) => {
    const ok = can(role.grants, res.id, act.id)
    const line = `${act.method.padEnd(6, ' ')} /api${res.path} → ${ok ? '200 OK' : '403 Forbidden'}`
    setLog((l) => [{ line, ok }, ...l].slice(0, 5))
  }

  const allowed = RESOURCES.reduce((n, r) => n + ACTIONS.filter((a) => can(role.grants, r.id, a.id)).length, 0)
  const CW = 46
  const CH = 30
  const LX = 92

  return (
    <div className="space-y-4">
      <div className="bm flex flex-wrap items-center gap-2">
        {ROLES.map((r) => (
          <button key={r.id} className="b-btn" aria-pressed={r.id === roleId} onClick={() => (setRoleId(r.id), setLog([]))}>
            {t(r.label)}
          </button>
        ))}
        <output className="ml-auto tabular-nums">
          {allowed}/{RESOURCES.length * ACTIONS.length} {lang === 'es' ? 'permisos' : 'grants'}
        </output>
      </div>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <svg
          viewBox={`0 0 ${LX + CW * ACTIONS.length + 2} ${CH * (RESOURCES.length + 1) + 2}`}
          className="w-full max-w-[20rem] border border-current"
          role="group"
          aria-label={lang === 'es' ? 'Matriz de permisos; pulsa una celda para simular la petición' : 'Permission matrix; click a cell to simulate the request'}
        >
          {ACTIONS.map((a, j) => (
            <text key={a.id} x={LX + j * CW + CW / 2} y={CH / 2 + 4} textAnchor="middle" fontSize="8" fontFamily="var(--b-mono)" fill="currentColor" letterSpacing="0.6">
              {a.method}
            </text>
          ))}
          {RESOURCES.map((r, i) => (
            <g key={r.id}>
              <line x1="0" x2={LX + CW * ACTIONS.length + 2} y1={CH * (i + 1)} y2={CH * (i + 1)} stroke="currentColor" strokeWidth="0.75" />
              <text x="8" y={CH * (i + 1) + CH / 2 + 4} fontSize="9" fontFamily="var(--b-mono)" fill="currentColor" letterSpacing="0.6">
                {t(r.label).toUpperCase()}
              </text>
              {ACTIONS.map((a, j) => {
                const ok = can(role.grants, r.id, a.id)
                const x = LX + j * CW + 8
                const y = CH * (i + 1) + 6
                return (
                  <g
                    key={a.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${a.method} ${t(r.label)}: ${ok ? (lang === 'es' ? 'permitido' : 'allowed') : lang === 'es' ? 'denegado' : 'denied'}`}
                    onClick={() => request(r, a)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        request(r, a)
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    <rect x={x} y={y} width={CW - 16} height={CH - 12} fill={ok ? 'currentColor' : 'var(--b-bg)'} stroke="currentColor" />
                    {!ok && <path d={`M${x} ${y + CH - 12}L${x + CW - 16} ${y}`} stroke="var(--b-red)" strokeWidth="1.5" />}
                  </g>
                )
              })}
            </g>
          ))}
        </svg>

        <div className="bm flex flex-col gap-2">
          <p className="text-[10px] text-(--b-mute)">{lang === 'es' ? '/// Peticiones simuladas' : '/// Simulated requests'}</p>
          <ol className="space-y-1 font-(family-name:--b-mono) text-[11px] normal-case tracking-normal" aria-live="polite">
            {log.length === 0 && <li className="text-(--b-mute)">{lang === 'es' ? 'Pulsa una celda de la matriz.' : 'Click a cell in the matrix.'}</li>}
            {log.map((l, i) => (
              <li key={i} className={`whitespace-pre ${l.ok ? '' : 'text-(--b-red-ink)'} ${i ? 'opacity-60' : ''}`}>
                {l.line}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
