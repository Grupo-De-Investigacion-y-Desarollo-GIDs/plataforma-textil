import type { CategoriaOficioTextil } from '@prisma/client'

export const CATEGORIAS_OFICIO_TEXTIL: CategoriaOficioTextil[] = [
  'APRENDIZ',
  'MEDIO_OFICIAL',
  'OFICIAL',
  'OFICIAL_CALIFICADO',
]

export const LABEL_OFICIO_TEXTIL: Record<CategoriaOficioTextil, string> = {
  APRENDIZ: 'Aprendices',
  MEDIO_OFICIAL: 'Medio oficial',
  OFICIAL: 'Oficial',
  OFICIAL_CALIFICADO: 'Oficial calificado',
}

export const DESCRIPCION_OFICIO_TEXTIL: Record<CategoriaOficioTextil, string> = {
  APRENDIZ: 'Menos de 1 año de experiencia',
  MEDIO_OFICIAL: '1 a 3 años de experiencia',
  OFICIAL: '3 a 5 años de experiencia',
  OFICIAL_CALIFICADO: 'Más de 5 años de experiencia',
}
