import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark'

// Colores resueltos para Canvas, que no puede leer variables CSS directamente.
export const PALETTE: Record<Theme, { bg: string; fg: string; mute: string; faint: string; red: string }> = {
  light: { bg: '#f4f4f0', fg: '#0a0a0a', mute: '#57574f', faint: '#d6d5cd', red: '#e61919' },
  dark: { bg: '#0e0e0e', fg: '#eaeaea', mute: '#a3a39c', faint: '#2c2c2a', red: '#ff2a2a' },
}

export const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: 'light',
  setTheme: () => {},
})

export const usePalette = () => PALETTE[useContext(ThemeContext).theme]

export function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('brut-theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* Almacenamiento bloqueado: se usa la preferencia del sistema. */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem('brut-theme', theme)
  } catch {
    /* Sin persistencia; el tema sigue aplicado en esta sesión. */
  }
}
