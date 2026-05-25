import type { NivelTaller } from '@/compartido/types'

const MAPA_ETAPAS: Record<NivelTaller, string> = {
  BRONCE: 'Etapa inicial',
  PLATA: 'En proceso de formalización',
  ORO: 'Formalización consolidada',
}

/**
 * Convierte el nivel interno (BRONCE/PLATA/ORO) a la etapa visible para el usuario.
 */
export function nivelAEtapa(nivel: NivelTaller | string): string {
  return MAPA_ETAPAS[nivel as NivelTaller] ?? 'Etapa inicial'
}
