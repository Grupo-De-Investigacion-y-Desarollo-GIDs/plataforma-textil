import { describe, it, expect } from 'vitest'
import {
  BLOQUES_VIDRIERA,
  bloqueVisible,
  normalizarVisibilidad,
  samVisible,
  type BloqueVidriera,
} from '@/compartido/lib/visibilidad-vidriera'

describe('visibilidad-vidriera', () => {
  describe('default = todo visible (behavior-preserving)', () => {
    it('null => todos los bloques visibles', () => {
      for (const b of BLOQUES_VIDRIERA) {
        expect(bloqueVisible({ visibilidadVidriera: null }, b)).toBe(true)
      }
    })

    it('campo ausente (undefined) => todos visibles', () => {
      for (const b of BLOQUES_VIDRIERA) {
        expect(bloqueVisible({}, b)).toBe(true)
      }
    })

    it('objeto vacio {} => todos visibles', () => {
      const norm = normalizarVisibilidad({})
      for (const b of BLOQUES_VIDRIERA) expect(norm[b]).toBe(true)
    })

    it('key ausente dentro del objeto => ese bloque visible', () => {
      // solo declara maquinaria; el resto debe quedar visible
      const taller = { visibilidadVidriera: { maquinaria: true } }
      expect(bloqueVisible(taller, 'equipo')).toBe(true)
      expect(bloqueVisible(taller, 'formacion')).toBe(true)
    })
  })

  describe('solo false explicito oculta', () => {
    it('flag en false => bloque oculto', () => {
      const taller = { visibilidadVidriera: { maquinaria: false } }
      expect(bloqueVisible(taller, 'maquinaria')).toBe(false)
    })

    it('flag en true => bloque visible', () => {
      const taller = { visibilidadVidriera: { formacion: true } }
      expect(bloqueVisible(taller, 'formacion')).toBe(true)
    })

    it('oculta solo el bloque marcado, el resto sigue visible', () => {
      const taller = { visibilidadVidriera: { espacio: false } }
      expect(bloqueVisible(taller, 'espacio')).toBe(false)
      expect(bloqueVisible(taller, 'capacidad')).toBe(true)
      expect(bloqueVisible(taller, 'organizacion')).toBe(true)
    })
  })

  describe('JSON invalido / defensivo => visible', () => {
    it('valor no-booleano (string "false") no oculta', () => {
      const taller = { visibilidadVidriera: { maquinaria: 'false' } }
      expect(bloqueVisible(taller, 'maquinaria')).toBe(true)
    })

    it('array u otros tipos => todo visible', () => {
      expect(bloqueVisible({ visibilidadVidriera: [] }, 'equipo')).toBe(true)
      expect(bloqueVisible({ visibilidadVidriera: 'x' }, 'equipo')).toBe(true)
      expect(bloqueVisible({ visibilidadVidriera: 42 }, 'equipo')).toBe(true)
    })

    it('0 / null por bloque no cuentan como false explicito => visible', () => {
      const taller = { visibilidadVidriera: { equipo: 0, espacio: null } }
      expect(bloqueVisible(taller, 'equipo')).toBe(true)
      expect(bloqueVisible(taller, 'espacio')).toBe(true)
    })
  })

  describe('invariante Credenciales: nunca toggleable', () => {
    it('credenciales no esta en la lista de bloques toggleables', () => {
      expect((BLOQUES_VIDRIERA as readonly string[]).includes('credenciales')).toBe(false)
    })

    it('una key "credenciales: false" en el JSON no afecta a ningun bloque real', () => {
      const taller = { visibilidadVidriera: { credenciales: false } as Record<string, unknown> }
      for (const b of BLOQUES_VIDRIERA) {
        expect(bloqueVisible(taller, b as BloqueVidriera)).toBe(true)
      }
    })
  })

  describe('invariante SAM: nunca publico', () => {
    it('SAM no es visible en contexto publico', () => {
      expect(samVisible('publico')).toBe(false)
    })

    it('SAM si es visible en contexto privado', () => {
      expect(samVisible('privado')).toBe(true)
    })

    it('SAM publico es false aunque el bloque capacidad este visible', () => {
      const taller = { visibilidadVidriera: { capacidad: true } }
      expect(bloqueVisible(taller, 'capacidad')).toBe(true)
      expect(samVisible('publico')).toBe(false)
    })
  })
})
