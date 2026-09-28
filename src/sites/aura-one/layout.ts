export const PANELS = ['Intro', 'Anatomía', 'Síntesis', 'Reserva']

/* Posición de cada parte en % de la caja del dispositivo. La anatomía usa las mismas coordenadas. */
export const PARTS = {
  display: { left: 6, top: 9, w: 38, h: 30 },
  knobs: { left: 48.5, top: 8, w: 45.5, h: 26 },
  faders: { left: 6, top: 45, w: 24, h: 46 },
  transport: { left: 33, top: 45, w: 11, h: 46 },
  pads: { left: 48.5, top: 40, w: 30, h: 51 },
  grille: { left: 81.5, top: 40, w: 12.5, h: 32 },
  plate: { left: 81.5, top: 76, w: 12.5, h: 15 },
} as const

export type PartId = keyof typeof PARTS
