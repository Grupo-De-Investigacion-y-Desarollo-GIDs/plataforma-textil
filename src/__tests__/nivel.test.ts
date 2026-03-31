import { describe, it, expect } from 'vitest'
import {
  calcularNivelPuro,
  VALIDACIONES_PLATA,
  VALIDACIONES_ORO,
  PTS_VERIFICADO_AFIP,
  PTS_POR_VALIDACION,
  PTS_POR_CERTIFICADO,
  PUNTAJE_MAX,
} from '@/lib/nivel'
import type { DatosTaller } from '@/lib/nivel'

function datos(overrides: Partial<DatosTaller> = {}): DatosTaller {
  return {
    verificadoAfip: false,
    tiposValidacionCompletados: [],
    numCertificadosActivos: 0,
    ...overrides,
  }
}

describe('calcularNivelPuro', () => {
  describe('nivel BRONCE', () => {
    it('taller nuevo sin nada es BRONCE con puntaje 0', () => {
      const r = calcularNivelPuro(datos())
      expect(r.nivel).toBe('BRONCE')
      expect(r.puntaje).toBe(0)
    })

    it('taller con AFIP verificado pero sin validaciones es BRONCE', () => {
      const r = calcularNivelPuro(datos({ verificadoAfip: true }))
      expect(r.nivel).toBe('BRONCE')
      expect(r.puntaje).toBe(PTS_VERIFICADO_AFIP)
    })

    it('taller con validaciones PLATA pero sin AFIP es BRONCE', () => {
      const r = calcularNivelPuro(datos({
        verificadoAfip: false,
        tiposValidacionCompletados: VALIDACIONES_PLATA,
        numCertificadosActivos: 1,
      }))
      expect(r.nivel).toBe('BRONCE')
    })

    it('taller con AFIP y validaciones PLATA pero sin certificados es BRONCE', () => {
      const r = calcularNivelPuro(datos({
        verificadoAfip: true,
        tiposValidacionCompletados: VALIDACIONES_PLATA,
        numCertificadosActivos: 0,
      }))
      expect(r.nivel).toBe('BRONCE')
    })
  })

  describe('nivel PLATA', () => {
    it('taller con AFIP + validaciones PLATA + 1 certificado es PLATA', () => {
      const r = calcularNivelPuro(datos({
        verificadoAfip: true,
        tiposValidacionCompletados: VALIDACIONES_PLATA,
        numCertificadosActivos: 1,
      }))
      expect(r.nivel).toBe('PLATA')
    })

    it('puntaje PLATA se calcula correctamente', () => {
      const r = calcularNivelPuro(datos({
        verificadoAfip: true,
        tiposValidacionCompletados: VALIDACIONES_PLATA,
        numCertificadosActivos: 1,
      }))
      const esperado = PTS_VERIFICADO_AFIP + (VALIDACIONES_PLATA.length * PTS_POR_VALIDACION) + (1 * PTS_POR_CERTIFICADO)
      expect(r.puntaje).toBe(esperado)
    })
  })

  describe('nivel ORO', () => {
    it('taller con todas las validaciones ORO + AFIP + certificado es ORO', () => {
      const r = calcularNivelPuro(datos({
        verificadoAfip: true,
        tiposValidacionCompletados: VALIDACIONES_ORO,
        numCertificadosActivos: 1,
      }))
      expect(r.nivel).toBe('ORO')
    })

    it('puntaje ORO se calcula correctamente (capped a 100)', () => {
      const r = calcularNivelPuro(datos({
        verificadoAfip: true,
        tiposValidacionCompletados: VALIDACIONES_ORO,
        numCertificadosActivos: 2,
      }))
      // 10 + (7*10) + (2*15) = 110, capped a 100
      const raw = PTS_VERIFICADO_AFIP + (VALIDACIONES_ORO.length * PTS_POR_VALIDACION) + (2 * PTS_POR_CERTIFICADO)
      expect(raw).toBe(110)
      expect(r.puntaje).toBe(PUNTAJE_MAX)
    })

    it('validaciones ORO incompletas (falta 1) da PLATA', () => {
      const parcial = VALIDACIONES_ORO.slice(0, -1)
      const r = calcularNivelPuro(datos({
        verificadoAfip: true,
        tiposValidacionCompletados: parcial,
        numCertificadosActivos: 1,
      }))
      expect(r.nivel).toBe('PLATA')
    })
  })

  describe('puntaje', () => {
    it('se limita a PUNTAJE_MAX (100)', () => {
      const r = calcularNivelPuro(datos({
        verificadoAfip: true,
        tiposValidacionCompletados: VALIDACIONES_ORO,
        numCertificadosActivos: 10,
      }))
      expect(r.puntaje).toBe(PUNTAJE_MAX)
    })

    it('AFIP verificado suma PTS_VERIFICADO_AFIP', () => {
      const sinAfip = calcularNivelPuro(datos({ verificadoAfip: false }))
      const conAfip = calcularNivelPuro(datos({ verificadoAfip: true }))
      expect(conAfip.puntaje - sinAfip.puntaje).toBe(PTS_VERIFICADO_AFIP)
    })

    it('cada validacion suma PTS_POR_VALIDACION', () => {
      const con1 = calcularNivelPuro(datos({ tiposValidacionCompletados: ['CUIT_MONOTRIBUTO'] }))
      const con2 = calcularNivelPuro(datos({ tiposValidacionCompletados: ['CUIT_MONOTRIBUTO', 'ART'] }))
      expect(con2.puntaje - con1.puntaje).toBe(PTS_POR_VALIDACION)
    })

    it('cada certificado suma PTS_POR_CERTIFICADO', () => {
      const con0 = calcularNivelPuro(datos({ numCertificadosActivos: 0 }))
      const con1 = calcularNivelPuro(datos({ numCertificadosActivos: 1 }))
      expect(con1.puntaje - con0.puntaje).toBe(PTS_POR_CERTIFICADO)
    })
  })

  describe('constantes', () => {
    it('VALIDACIONES_ORO contiene todas las de PLATA', () => {
      for (const v of VALIDACIONES_PLATA) {
        expect(VALIDACIONES_ORO).toContain(v)
      }
    })

    it('VALIDACIONES_ORO tiene mas requisitos que PLATA', () => {
      expect(VALIDACIONES_ORO.length).toBeGreaterThan(VALIDACIONES_PLATA.length)
    })
  })
})
