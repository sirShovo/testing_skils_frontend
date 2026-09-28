// Enlaza .claude/skills -> .agents/skills para que Claude Code descubra las
// skills instaladas con `npx skills` (que las deja en .agents/skills).
// En Windows usa una junction, que no requiere permisos de administrador.
import { existsSync, lstatSync, mkdirSync, readlinkSync, symlinkSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = resolve(root, '.agents/skills')
const link = resolve(root, '.claude/skills')

if (!existsSync(target)) {
  console.log('[skills] .agents/skills no existe; nada que enlazar.')
  process.exit(0)
}

let stat = null
try {
  stat = lstatSync(link)
} catch {
  // No existe: se crea abajo.
}

if (stat?.isSymbolicLink()) {
  console.log(`[skills] .claude/skills ya enlaza a ${readlinkSync(link)}`)
  process.exit(0)
}

if (stat) {
  console.warn('[skills] .claude/skills es una carpeta real; bórrala y vuelve a ejecutar `pnpm skills:link`.')
  process.exit(0)
}

mkdirSync(dirname(link), { recursive: true })
symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir')
console.log('[skills] .claude/skills -> .agents/skills')
