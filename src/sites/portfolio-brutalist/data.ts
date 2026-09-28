export const PROFILE = {
  name: 'Lena Vásquez',
  role: 'Systems & Interface Engineer',
  unit: 'LV-01',
  rev: 'REV 4.2',
  city: 'Medellín',
  country: 'CO',
  timeZone: 'America/Bogota',
  email: 'contacto@lena-vasquez.dev',
  availability: 'Abierta a 1 proyecto · ene 2027',
  bio: 'Diseño sistemas que se pueden razonar y las interfaces que los hacen visibles: motores de consenso, planificadores de rutas y las herramientas con las que los equipos los operan.',
}

export type PreviewKind = 'raft' | 'astar' | 'sort' | 'ring' | 'statechart'

export type Project = {
  id: string
  no: string
  name: string
  domain: string
  year: number
  headline: string
  summary: string
  role: string
  metrics: [string, string][]
  stack: string[]
  preview: PreviewKind
}

export const PROJECTS: Project[] = [
  {
    id: 'quorum',
    no: '01',
    name: 'Quorum',
    domain: 'Consenso distribuido',
    year: 2026,
    headline: '12K elec/s',
    summary:
      'Implementación didáctica de Raft con inspector en vivo. La usan tres equipos de plataforma para entrenar guardias antes de tocar el cluster real.',
    role: 'Autora · mantenedora',
    metrics: [
      ['Nodos simulados', '5 – 101'],
      ['Elecciones / s', '12 000'],
      ['Invariantes TLA+', '94 %'],
    ],
    stack: ['Rust', 'WASM', 'TLA+', 'SVG'],
    preview: 'raft',
  },
  {
    id: 'routefield',
    no: '02',
    name: 'Routefield',
    domain: 'Planificación de rutas',
    year: 2025,
    headline: '3.1 ms p95',
    summary:
      'Planificador para 140 vehículos autónomos en un centro logístico. Replanifica en caliente cuando un pasillo se bloquea, sin detener la flota.',
    role: 'Lead técnica',
    metrics: [
      ['Celdas de mapa', '2.4 M'],
      ['Replan p95', '3.1 ms'],
      ['Colisiones', '0 en 14 meses'],
    ],
    stack: ['C++20', 'ROS 2', 'Protobuf', 'Canvas'],
    preview: 'astar',
  },
  {
    id: 'ledgersort',
    no: '03',
    name: 'Ledgersort',
    domain: 'Procesamiento batch',
    year: 2024,
    headline: '−71 % ventana',
    summary:
      'Ordenación externa para la conciliación nocturna de un banco digital. La ventana de cierre pasó de 38 a 11 minutos con el mismo hardware.',
    role: 'Ingeniera staff',
    metrics: [
      ['Filas / noche', '900 M'],
      ['Ventana de cierre', '38 → 11 min'],
      ['Memoria pico', '6 GiB'],
    ],
    stack: ['Go', 'Arrow', 'Parquet', 'Kubernetes'],
    preview: 'sort',
  },
  {
    id: 'hashring',
    no: '04',
    name: 'Hashring',
    domain: 'Caché distribuida',
    year: 2023,
    headline: '97.2 % hit',
    summary:
      'Capa de caché con hashing consistente y nodos virtuales para una CDN regional. Escalar de 32 a 48 nodos movió solo la fracción de claves necesaria.',
    role: 'Ingeniera de infraestructura',
    metrics: [
      ['Hit ratio', '97.2 %'],
      ['Remapeo al escalar', '≈ 1/n claves'],
      ['Nodos en producción', '48'],
    ],
    stack: ['Zig', 'eBPF', 'RESP', 'SVG'],
    preview: 'ring',
  },
  {
    id: 'statecraft',
    no: '05',
    name: 'Statecraft',
    domain: 'Interfaces con estado',
    year: 2022,
    headline: '−63 % bugs UI',
    summary:
      'Librería de statecharts para formularios críticos. Cada pantalla se describe como un árbol de estados verificable; los estados imposibles dejan de ser posibles.',
    role: 'Autora',
    metrics: [
      ['Pantallas migradas', '212'],
      ['Bugs de estado', '−63 %'],
      ['Tamaño', '3.4 kB gz'],
    ],
    stack: ['TypeScript', 'React', 'Statecharts', 'SVG'],
    preview: 'statechart',
  },
]

export const PRINCIPLES = [
  {
    no: '01',
    title: 'La latencia es una decisión de diseño',
    body: 'Cada milisegundo se elige en algún momento: en el formato del mensaje, en el número de saltos, en lo que se decide cachear. Prefiero decidirlo en la pizarra que descubrirlo en producción.',
  },
  {
    no: '02',
    title: 'El estado tiene que poder dibujarse',
    body: 'Si no puedo dibujar el diagrama de estados de una interfaz o de un protocolo, todavía no lo entiendo. Y si no lo entiendo, no lo puedo probar.',
  },
  {
    no: '03',
    title: 'Fallar en voz alta, recuperarse en silencio',
    body: 'Los errores se registran con contexto suficiente para reproducirlos. La recuperación, en cambio, no debería necesitar a una persona despierta.',
  },
  {
    no: '04',
    title: 'Menos capas, más contratos',
    body: 'Una abstracción se gana su sitio cuando elimina decisiones, no cuando las esconde. Un contrato explícito entre dos sistemas vale más que tres capas de adaptadores.',
  },
  {
    no: '05',
    title: 'La herramienta es parte del producto',
    body: 'El inspector, el CLI y el panel de operación se diseñan con el mismo cuidado que la interfaz pública. Son lo que usa el equipo a las cuatro de la mañana.',
  },
]

export const HISTORY = [
  { hash: 'a91f3e2', date: '2026-01', msg: 'Independiente: sistemas e interfaces para equipos de infraestructura' },
  { hash: '7c0d5b8', date: '2023-04', msg: 'Staff Engineer · Fondo Pacífico, plataforma de datos' },
  { hash: '3e8a1f0', date: '2021-02', msg: 'Senior Engineer · Red Umbral, CDN regional' },
  { hash: 'b27c946', date: '2019-06', msg: 'Software Engineer · Almacenes Kiru, robótica logística' },
  { hash: '0f4e2d1', date: '2018-12', msg: 'Ingeniería de Sistemas · Universidad Nacional, sede Medellín' },
]

export const STACK = {
  lenguajes: ['Rust', 'Go', 'TypeScript', 'C++', 'Zig'],
  sistemas: ['Raft', 'CRDTs', 'eBPF', 'Kafka', 'Postgres'],
  interfaz: ['React', 'Canvas', 'WebGL', 'Statecharts', 'Figma'],
  verificación: ['TLA+', 'property testing', 'fuzzing'],
}
