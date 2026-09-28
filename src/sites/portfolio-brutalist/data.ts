import type { L } from './i18n'

export const PROFILE = {
  name: 'Sebastian Agudelo',
  fullName: 'Sebastian Agudelo Bornacelly',
  role: 'Full Stack Web Developer',
  unit: 'SAB-01',
  rev: 'REV 2026',
  city: 'Medellín',
  country: 'CO',
  timeZone: 'America/Bogota',
  email: 'bornacelly99@gmail.com',
  linkedin: 'linkedin.com/in/sebastian-agudelo-bornacelli',
  github: 'github.com/sirShovo',
  current: { es: 'Frontend Developer · Trustcore Services', en: 'Frontend Developer · Trustcore Services' } as L,
  bio: {
    es: 'Desarrollador Full Stack con más de 5 años construyendo sistemas empresariales (CRM/ERP) y plataformas públicas. Me especializo en arquitectura frontend y rendimiento, con Angular, React, FastAPI y Node.js. Hoy trabajo como desarrollador frontend en Trustcore Services.',
    en: 'Full Stack Developer with 5+ years building enterprise systems (CRM/ERP) and public platforms. I specialize in frontend architecture and performance with Angular, React, FastAPI and Node.js. I currently work as a frontend developer at Trustcore Services.',
  } as L,
}

export type PreviewKind = 'rbac' | 'ssr' | 'sort' | 'invoice' | 'sensors'

export type Project = {
  id: string
  no: string
  name: string
  domain: L
  period: string
  year: number
  headline: L
  summary: L
  role: L
  metrics: [L, L][]
  stack: string[]
  preview: PreviewKind
  previewNote: L
}

export const PROJECTS: Project[] = [
  {
    id: 'cinteli',
    no: '01',
    name: 'Cinteli',
    domain: { es: 'Plataforma empresarial', en: 'Enterprise platform' },
    period: '2024',
    year: 2024,
    headline: { es: 'Tech Lead', en: 'Tech Lead' },
    summary: {
      es: 'Aplicaciones web escalables con Angular y FastAPI. Definí la arquitectura base, los estándares de desarrollo y el roadmap técnico; lideré un equipo multidisciplinario en sincronía diaria con el CEO.',
      en: 'Scalable web applications with Angular and FastAPI. I defined the base architecture, development standards and technical roadmap, and led a multidisciplinary team in daily sync with the CEO.',
    },
    role: { es: 'Tech Lead → Frontend Team Lead', en: 'Tech Lead → Frontend Team Lead' },
    metrics: [
      [{ es: 'Seguridad', en: 'Security' }, { es: 'Control de acceso por roles', en: 'Role-based access control' }],
      [{ es: 'Integraciones', en: 'Integrations' }, { es: 'Facturación, auth, storage, logística', en: 'Invoicing, auth, storage, shipping' }],
      [{ es: 'Rendimiento', en: 'Performance' }, { es: 'SEO técnico · Core Web Vitals', en: 'Technical SEO · Core Web Vitals' }],
    ],
    stack: ['Angular 19', 'FastAPI', 'PrimeNG', 'AWS', 'Scrum'],
    preview: 'rbac',
    previewNote: {
      es: 'Demo: control de acceso por roles. Elige un rol y mira qué módulos y acciones quedan habilitados.',
      en: 'Demo: role-based access control. Pick a role and see which modules and actions are enabled.',
    },
  },
  {
    id: 'santovecino',
    no: '02',
    name: 'SantoVecino',
    domain: { es: 'Plataforma pública', en: 'Public platform' },
    period: '2023 — 2024',
    year: 2023,
    headline: { es: '−70 % carga', en: '−70 % load' },
    summary: {
      es: 'Reduje un 70 % el tiempo de carga de la plataforma principal con SSR y optimización frontend. Construí desde cero "Santo Vecino Empresas" con funciones sociales para retener usuarios, y un dashboard administrativo.',
      en: 'Cut the main platform load time by 70 % with SSR and frontend optimization. Built "Santo Vecino Empresas" from scratch with social features to improve retention, plus an admin dashboard.',
    },
    role: { es: 'Desarrollador web', en: 'Web developer' },
    metrics: [
      [{ es: 'Tiempo de carga', en: 'Load time' }, { es: '−70 %', en: '−70 %' }],
      [{ es: 'Técnica', en: 'Technique' }, { es: 'Server-Side Rendering', en: 'Server-Side Rendering' }],
      [{ es: 'Diseño', en: 'Design' }, { es: 'Figma → código', en: 'Figma → code' }],
    ],
    stack: ['Angular', 'SSR', 'Tailwind CSS', 'Figma'],
    preview: 'ssr',
    previewNote: {
      es: 'Demo: línea de tiempo de carga con renderizado en cliente frente a renderizado en servidor.',
      en: 'Demo: page-load timeline with client-side rendering versus server-side rendering.',
    },
  },
  {
    id: 'genesis',
    no: '03',
    name: 'Genesis',
    domain: { es: 'CRM y datos', en: 'CRM & data' },
    period: '2022 — 2023',
    year: 2022,
    headline: { es: 'CRM + BI', en: 'CRM + BI' },
    summary: {
      es: 'Sistemas CRM corporativos con Angular y Bootstrap sobre PostgreSQL y MongoDB. Migración y transformación de datos para dashboards de Power BI, y un directorio público de alto rendimiento con React y Tailwind.',
      en: 'Corporate CRM systems with Angular and Bootstrap on PostgreSQL and MongoDB. Data migration and transformation for Power BI dashboards, plus a high-performance public directory in React and Tailwind.',
    },
    role: { es: 'Desarrollador Full Stack', en: 'Full Stack developer' },
    metrics: [
      [{ es: 'Producto', en: 'Product' }, { es: 'CRM corporativo', en: 'Corporate CRM' }],
      [{ es: 'Datos', en: 'Data' }, { es: 'Migración → Power BI', en: 'Migration → Power BI' }],
      [{ es: 'Público', en: 'Public' }, { es: 'Directorio en React', en: 'React directory' }],
    ],
    stack: ['Angular', 'React', 'PostgreSQL', 'MongoDB', 'Power BI'],
    preview: 'sort',
    previewNote: {
      es: 'Demo: algoritmos de ordenación, la base de cualquier transformación de datos a gran escala.',
      en: 'Demo: sorting algorithms, the building block of any large-scale data transformation.',
    },
  },
  {
    id: 'intecgra',
    no: '04',
    name: 'Intecgra360',
    domain: { es: 'CRM / ERP', en: 'CRM / ERP' },
    period: '2021 — 2022',
    year: 2021,
    headline: { es: 'API DIAN', en: 'DIAN API' },
    summary: {
      es: 'Desarrollo evolutivo y mantenimiento de sistemas CRM/ERP con Angular 12+ y Angular Material sobre FastAPI. Integré la API de la DIAN para facturación electrónica y configuré CI/CD en Google Cloud con Docker.',
      en: 'Ongoing development and maintenance of CRM/ERP systems with Angular 12+ and Angular Material on FastAPI. Integrated the DIAN API for electronic invoicing and set up CI/CD on Google Cloud with Docker.',
    },
    role: { es: 'Desarrollador Full Stack', en: 'Full Stack developer' },
    metrics: [
      [{ es: 'Facturación', en: 'Invoicing' }, { es: 'Electrónica vía DIAN', en: 'Electronic via DIAN' }],
      [{ es: 'Despliegue', en: 'Deployment' }, { es: 'CI/CD en GCP', en: 'CI/CD on GCP' }],
      [{ es: 'Contenedores', en: 'Containers' }, { es: 'Docker', en: 'Docker' }],
    ],
    stack: ['Angular 12+', 'Angular Material', 'FastAPI', 'GCP', 'Docker'],
    preview: 'invoice',
    previewNote: {
      es: 'Demo: máquina de estados de una factura electrónica. Solo están habilitadas las transiciones válidas.',
      en: 'Demo: state machine of an electronic invoice. Only valid transitions are enabled.',
    },
  },
  {
    id: 'aafreedom',
    no: '05',
    name: 'A&A Freedom',
    domain: { es: 'Telemetría y salud', en: 'Telemetry & health' },
    period: '2019 — 2021',
    year: 2019,
    headline: { es: '13 sensores', en: '13 sensors' },
    summary: {
      es: 'Captura de datos en tiempo real y medición meteorológica con 13 sensores usando Python y React. También desarrollé plataformas y landing pages para el sector salud con PHP 7.',
      en: 'Real-time data capture and weather measurement across 13 sensors using Python and React. Also built healthcare platforms and landing pages with PHP 7.',
    },
    role: { es: 'Desarrollador web', en: 'Web developer' },
    metrics: [
      [{ es: 'Sensores', en: 'Sensors' }, { es: '13 en tiempo real', en: '13 in real time' }],
      [{ es: 'Captura', en: 'Capture' }, { es: 'Python', en: 'Python' }],
      [{ es: 'Visualización', en: 'Visualization' }, { es: 'React', en: 'React' }],
    ],
    stack: ['Python', 'React', 'PHP 7', 'HTML', 'CSS'],
    preview: 'sensors',
    previewNote: {
      es: 'Demo: panel de telemetría con 13 sensores simulados. Selecciona uno para ver su serie.',
      en: 'Demo: telemetry panel with 13 simulated sensors. Select one to see its series.',
    },
  },
]

export const PRINCIPLES: { no: string; title: L; body: L }[] = [
  {
    no: '01',
    title: { es: 'El rendimiento es una funcionalidad', en: 'Performance is a feature' },
    body: {
      es: 'Un 70 % menos de tiempo de carga cambia cómo se usa un producto. Mido Core Web Vitals desde el primer sprint, no cuando alguien se queja.',
      en: 'Cutting load time by 70 % changes how a product is used. I measure Core Web Vitals from the first sprint, not when someone complains.',
    },
  },
  {
    no: '02',
    title: { es: 'Arquitectura antes que velocidad', en: 'Architecture before speed' },
    body: {
      es: 'Definir estándares, capas y contratos al principio es lo que permite ir rápido después. SOLID y arquitectura limpia no son ceremonia: son mantenimiento barato.',
      en: 'Setting standards, layers and contracts early is what lets a team move fast later. SOLID and clean architecture are not ceremony: they are cheap maintenance.',
    },
  },
  {
    no: '03',
    title: { es: 'Del diseño al código, sin pérdidas', en: 'From design to code, lossless' },
    body: {
      es: 'Traducir Figma a componentes fieles y escalables es parte del trabajo del desarrollador, no del diseñador. Cuando faltó diseñador, asumí ese rol.',
      en: 'Turning Figma into faithful, scalable components is part of the developer’s job, not the designer’s. When the team lost its designer, I took on the role.',
    },
  },
  {
    no: '04',
    title: { es: 'Las integraciones son contratos', en: 'Integrations are contracts' },
    body: {
      es: 'Facturación electrónica, autenticación, logística: cada servicio externo se integra con validación, reintentos y estados explícitos. Lo que falla fuera no debería romper lo de dentro.',
      en: 'E-invoicing, authentication, shipping: every external service is integrated with validation, retries and explicit states. What fails outside should not break what’s inside.',
    },
  },
  {
    no: '05',
    title: { es: 'La IA acelera, el criterio decide', en: 'AI accelerates, judgment decides' },
    body: {
      es: 'Uso asistentes y agentes de desarrollo a diario para entregar antes. La revisión, la arquitectura y la responsabilidad sobre el código siguen siendo mías.',
      en: 'I use AI assistants and coding agents daily to ship sooner. Review, architecture and ownership of the code remain mine.',
    },
  },
]

export const HISTORY: { hash: string; date: string; msg: L }[] = [
  { hash: 'f3a9c21', date: 'now', msg: { es: 'Frontend Developer · Trustcore Services', en: 'Frontend Developer · Trustcore Services' } },
  { hash: 'c47e0b9', date: '2025-07', msg: { es: 'Ingeniería de Software (en curso) · Tecnológico de Antioquia', en: 'Software Engineering (in progress) · Tecnológico de Antioquia' } },
  { hash: '9b1d5e4', date: '2024-10', msg: { es: 'Technical Lead / Senior Full Stack · Cinteli Group', en: 'Technical Lead / Senior Full Stack · Cinteli Group' } },
  { hash: '5e82a7f', date: '2023-05', msg: { es: 'Desarrollador web · SantoVecino', en: 'Web Developer · SantoVecino' } },
  { hash: '2d6c3b0', date: '2022-03', msg: { es: 'Desarrollador Full Stack · Genesis Agency', en: 'Full Stack Developer · Genesis Agency' } },
  { hash: 'a0f47c8', date: '2021-04', msg: { es: 'Desarrollador Full Stack · Intecgra360', en: 'Full Stack Web Developer · Intecgra360' } },
  { hash: '71c2e95', date: '2019-02', msg: { es: 'Desarrollador web · A&A Freedom Solutions', en: 'Web Developer · A&A Freedom Solutions' } },
  { hash: '0e5b1d3', date: '2016-01', msg: { es: 'Técnico en Programación de Software · SENA', en: 'Software Programming Technician · SENA' } },
]

export const STACK: { key: L; items: string[] }[] = [
  { key: { es: 'frontend', en: 'frontend' }, items: ['Angular 19', 'React', 'TypeScript', 'Tailwind', 'SSR'] },
  { key: { es: 'backend', en: 'backend' }, items: ['FastAPI', 'Node.js', 'PHP 7', 'REST'] },
  { key: { es: 'datos · cloud', en: 'data · cloud' }, items: ['PostgreSQL', 'MongoDB', 'AWS', 'GCP', 'Docker'] },
  { key: { es: 'método', en: 'method' }, items: ['SOLID', 'Scrum', 'Figma', 'AI agents'] },
]
