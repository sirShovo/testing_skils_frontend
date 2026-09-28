import { createContext, useContext } from 'react'

export type Lang = 'es' | 'en'

/** Texto localizado. */
export type L = { es: string; en: string }

export const I18nContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'es',
  setLang: () => {},
})

export function useI18n() {
  const { lang, setLang } = useContext(I18nContext)
  const t = (l: L) => l[lang]
  return { lang, setLang, t, ui: UI[lang] }
}

export function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem('brut-lang')
    if (stored === 'es' || stored === 'en') return stored
  } catch {
    /* Almacenamiento bloqueado: se usa el idioma del navegador. */
  }
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function storeLang(lang: Lang) {
  try {
    localStorage.setItem('brut-lang', lang)
  } catch {
    /* Sin persistencia; el idioma sigue aplicado en esta sesión. */
  }
}

/* Cadenas de interfaz (las de contenido viven en data.ts). */
const es = {
  docTitle: 'Sebastian Agudelo — Desarrollador Full Stack',
  // Encabezado
  tzLabel: 'Medellín · UTC−5',
  relative: 'Respecto a ti',
  sameTime: 'Misma hora',
  status: 'Estado',
  inHours: 'En horario',
  offHours: 'Fuera de horario',
  offShort: 'Fuera',
  current: 'Actualmente',
  session: 'Sesión',
  theme: 'Tema',
  paper: 'Papel',
  carbon: 'Carbón',
  language: 'Idioma',
  // Hero
  kicker: '[ Portafolio / Índice de proyectos ]',
  meta: {
    unit: 'Unidad',
    coords: 'Coordenadas',
    discipline: 'Disciplina',
    base: 'Base',
    issue: 'Emisión',
  },
  disciplineValue: 'Frontend + Full Stack',
  profile: '01 — Perfil',
  actions: 'Acciones',
  index: 'Índice',
  console: 'Consola',
  contact: 'Contacto',
  // Índice
  indexTitle: 'Índice',
  records: 'Registros',
  period: 'Periodo',
  order: 'Orden',
  orderValue: 'Cronológico inverso',
  interaction: 'Interacción',
  interactionValue: 'Fila → demo',
  colNo: 'No.',
  colProject: 'Proyecto',
  colDomain: 'Dominio',
  colYear: 'Año',
  colMetric: 'Clave',
  role: 'Rol',
  stack: 'Stack',
  preview: '[ Demo interactiva ]',
  detailOf: 'Detalle de',
  // Principios
  principlesKicker: '02 — Filosofía / Principios',
  principlesLede: 'Cinco reglas de trabajo que aplico en cada proyecto.',
  principlesTitle: ['Princi', 'pios'],
  marginNote: '[ Nota al margen ]',
  quote: 'Una interfaz rápida es una interfaz que respeta el tiempo de quien la usa.',
  // Contacto
  contactKicker: '03 — Contacto',
  contactTitle: ['¿Construimos', 'algo juntos?'],
  languagesLabel: 'Idiomas',
  languagesValue: 'Español nativo · Inglés técnico',
  location: 'Ubicación',
  colophon: 'Sin imágenes · sin rastreadores',
  // Consola
  consoleTag: '[ Consola ]',
  consoleHint: (n: number) => `${n} comandos · pulsa \` para abrir`,
  consoleCollapse: 'Esc para plegar',
  consoleLabel: 'Consola del perfil',
  commandLabel: 'Comando',
}

type UIStrings = typeof es

const en: UIStrings = {
  docTitle: 'Sebastian Agudelo — Full Stack Developer',
  tzLabel: 'Medellín · UTC−5',
  relative: 'Relative to you',
  sameTime: 'Same time',
  status: 'Status',
  inHours: 'Working hours',
  offHours: 'Off hours',
  offShort: 'Off',
  current: 'Currently',
  session: 'Session',
  theme: 'Theme',
  paper: 'Paper',
  carbon: 'Carbon',
  language: 'Language',
  kicker: '[ Portfolio / Project index ]',
  meta: {
    unit: 'Unit',
    coords: 'Coordinates',
    discipline: 'Discipline',
    base: 'Base',
    issue: 'Issue',
  },
  disciplineValue: 'Frontend + Full Stack',
  profile: '01 — Profile',
  actions: 'Actions',
  index: 'Index',
  console: 'Console',
  contact: 'Contact',
  indexTitle: 'Index',
  records: 'Records',
  period: 'Period',
  order: 'Order',
  orderValue: 'Reverse chronological',
  interaction: 'Interaction',
  interactionValue: 'Row → demo',
  colNo: 'No.',
  colProject: 'Project',
  colDomain: 'Domain',
  colYear: 'Year',
  colMetric: 'Key',
  role: 'Role',
  stack: 'Stack',
  preview: '[ Interactive demo ]',
  detailOf: 'Details of',
  principlesKicker: '02 — Philosophy / Principles',
  principlesLede: 'Five working rules I bring to every project.',
  principlesTitle: ['Princi', 'ples'],
  marginNote: '[ Margin note ]',
  quote: 'A fast interface is one that respects the time of the person using it.',
  contactKicker: '03 — Contact',
  contactTitle: ['Shall we build', 'something?'],
  languagesLabel: 'Languages',
  languagesValue: 'Native Spanish · Technical English',
  location: 'Location',
  colophon: 'No images · no trackers',
  consoleTag: '[ Console ]',
  consoleHint: (n: number) => `${n} commands · press \` to open`,
  consoleCollapse: 'Esc to collapse',
  consoleLabel: 'Profile console',
  commandLabel: 'Command',
}

const UI: Record<Lang, UIStrings> = { es, en }
