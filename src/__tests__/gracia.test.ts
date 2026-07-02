import { describe, it, expect } from 'vitest'
import {
  clasificarGracia,
  estadoCuentaInicial,
  DIAS_GRACIA,
  DIAS_VENCE_PRONTO,
} from '@/compartido/lib/gracia'

// Fechas fabricadas → testeable sin esperar 60 días reales.
const INICIO = new Date('2026-01-01T00:00:00.000Z')
const masDias = (n: number, extraMs = 0) =>
  new Date(INICIO.getTime() + n * 86_400_000 + extraMs)

describe('clasificarGracia (pura, fechas inyectadas)', () => {
  describe('NO_APLICA', () => {
    it('taller verificado => NO_APLICA aunque tenga inicioGracia', () => {
      const r = clasificarGracia({ verificadoAfip: true, inicioGracia: INICIO }, masDias(90))
      expect(r.estado).toBe('NO_APLICA')
      expect(r.diasRestantes).toBe(0)
    })

    it('sin inicioGracia (null) => NO_APLICA', () => {
      expect(clasificarGracia({ verificadoAfip: false, inicioGracia: null }, masDias(70)).estado).toBe('NO_APLICA')
    })

    it('inicioGracia ausente/undefined => NO_APLICA', () => {
      expect(clasificarGracia({}, masDias(70)).estado).toBe('NO_APLICA')
    })
  })

  describe('ventana de estados por día (sin verificar)', () => {
    const enGracia = { verificadoAfip: false, inicioGracia: INICIO }

    it('día 0 => EN_GRACIA, quedan 60', () => {
      const r = clasificarGracia(enGracia, masDias(0))
      expect(r.estado).toBe('EN_GRACIA')
      expect(r.diasTranscurridos).toBe(0)
      expect(r.diasRestantes).toBe(DIAS_GRACIA)
    })

    it('día 49 => EN_GRACIA (aún no vence pronto), quedan 11', () => {
      const r = clasificarGracia(enGracia, masDias(49))
      expect(r.estado).toBe('EN_GRACIA')
      expect(r.diasRestantes).toBe(11)
    })

    it('día 50 => VENCE_PRONTO (ventana del email), quedan 10', () => {
      const r = clasificarGracia(enGracia, masDias(DIAS_VENCE_PRONTO))
      expect(r.estado).toBe('VENCE_PRONTO')
      expect(r.diasRestantes).toBe(10)
    })

    it('día 59 => VENCE_PRONTO, queda 1', () => {
      const r = clasificarGracia(enGracia, masDias(59))
      expect(r.estado).toBe('VENCE_PRONTO')
      expect(r.diasRestantes).toBe(1)
    })

    it('día 60 => INACTIVA, quedan 0', () => {
      const r = clasificarGracia(enGracia, masDias(DIAS_GRACIA))
      expect(r.estado).toBe('INACTIVA')
      expect(r.diasRestantes).toBe(0)
    })

    it('día 61 => INACTIVA (sigue inactiva, no se rompe)', () => {
      expect(clasificarGracia(enGracia, masDias(61)).estado).toBe('INACTIVA')
    })

    it('día 100 => INACTIVA', () => {
      expect(clasificarGracia(enGracia, masDias(100)).estado).toBe('INACTIVA')
    })
  })

  describe('tolerancia a corrida perdida (ventana, no día exacto)', () => {
    it('el email dispara en CUALQUIER día de la ventana [50, 60), no solo el 50', () => {
      const t = { verificadoAfip: false, inicioGracia: INICIO }
      // Si el cron se saltea el día 50, los días 51..59 siguen en VENCE_PRONTO.
      for (const d of [50, 51, 55, 59]) {
        expect(clasificarGracia(t, masDias(d)).estado).toBe('VENCE_PRONTO')
      }
    })

    it('fracción de día no adelanta el estado (floor de días)', () => {
      const t = { verificadoAfip: false, inicioGracia: INICIO }
      // día 59 + 23h sigue siendo día 59 => VENCE_PRONTO, no INACTIVA.
      expect(clasificarGracia(t, masDias(59, 23 * 3_600_000)).estado).toBe('VENCE_PRONTO')
    })
  })
})

describe('estadoCuentaInicial (estado al alta)', () => {
  it('verificado => ACTIVA sin reloj de gracia', () => {
    expect(estadoCuentaInicial(true, INICIO)).toEqual({ estadoCuenta: 'ACTIVA', inicioGracia: null })
  })

  it('sin verificar => EN_GRACIA con el reloj arrancando en su alta', () => {
    expect(estadoCuentaInicial(false, INICIO)).toEqual({ estadoCuenta: 'EN_GRACIA', inicioGracia: INICIO })
  })

  it('un taller creado sin verificar arranca en día 0 de EN_GRACIA', () => {
    const { inicioGracia } = estadoCuentaInicial(false, INICIO)
    const r = clasificarGracia({ verificadoAfip: false, inicioGracia }, INICIO)
    expect(r.estado).toBe('EN_GRACIA')
    expect(r.diasRestantes).toBe(DIAS_GRACIA)
  })
})
