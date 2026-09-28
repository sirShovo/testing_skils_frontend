import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/eb-garamond/wght-italic.css'
import './brut.css'
import { useCallback, useEffect, useState } from 'react'
import { Console } from './components/Console'
import { Header } from './components/Header'
import { ProjectIndex } from './components/ProjectIndex'
import { Colophon, Contact, Hero, Principles } from './components/Sections'
import { PROFILE } from './data'
import { readStoredTheme, storeTheme, ThemeContext, type Theme } from './theme'

// Portafolio generado con la skill `industrial-brutalist-ui`.
export default function BrutalistPortfolio() {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)
  const [openId, setOpenId] = useState<string | null>('quorum')
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [startedAt] = useState(() => Date.now())

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    storeTheme(t)
  }, [])

  useEffect(() => {
    const prev = document.title
    document.title = `${PROFILE.name} — ${PROFILE.role}`
    return () => {
      document.title = prev
    }
  }, [])

  // ` abre/cierra la consola, salvo mientras se escribe en otro campo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '`') return
      const el = e.target as HTMLElement
      if (el.tagName === 'INPUT' && el.getAttribute('aria-label') !== 'Comando') return
      e.preventDefault()
      setConsoleOpen((o) => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openProject = useCallback((id: string | null) => {
    setOpenId(id)
    if (id) requestAnimationFrame(() => document.getElementById(`p-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="brut min-h-screen pb-12" data-theme={theme}>
        <div className="b-grain" aria-hidden="true" />
        <Header startedAt={startedAt} />
        <main className="mx-auto max-w-[1600px] border-x-2 border-(--b-fg)">
          <Hero onOpenConsole={() => setConsoleOpen(true)} />
          <ProjectIndex openId={openId} onToggle={(id) => setOpenId((cur) => (cur === id ? null : id))} />
          <Principles />
          <Contact />
          <Colophon />
        </main>
        <Console open={consoleOpen} setOpen={setConsoleOpen} actions={{ openProject, setTheme, theme }} />
      </div>
    </ThemeContext.Provider>
  )
}
