export type Site = {
  slug: string
  name: string
  description: string
  skill: string
}

// Registro de landings. El index (bento grid) se construirá a partir de esta lista.
export const sites: Site[] = [
  {
    slug: 'kestradb',
    name: 'KestraDB',
    description: 'Base de datos vectorial distribuida',
    skill: 'minimalist-ui',
  },
]
