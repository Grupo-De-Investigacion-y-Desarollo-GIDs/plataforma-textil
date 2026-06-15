import { describe, it, expect } from 'vitest'
import {
  labelOrganizacion,
  labelRegistro,
  labelEscalabilidad,
  ORGANIZACION_LABELS,
  REGISTRO_LABELS,
  ESCALABILIDAD_LABELS,
} from '@/compartido/lib/taller-formulario'

// Regresión de consistencia W-A: el formulario guarda valores nuevos, y tanto el perfil
// del taller como el dashboard sectorial de ESTADO derivan sus labels de estas funciones
// compartidas. Si el mapeo vuelve a quedar viejo, estos tests fallan en AMBOS consumidores
// a la vez (los dos llaman a las mismas funciones).

describe('W-A escalabilidad — valores nuevos del formulario muestran label correcto', () => {
  // El form guarda turnos/contratar/tercerizar/maquinaria (step 10, P2).
  it("'turnos' NO muestra 'Sin capacidad de escalar' (el bug)", () => {
    expect(labelEscalabilidad('turnos')).toBe('Ampliando turnos u horas de trabajo')
    expect(labelEscalabilidad('turnos')).not.toBe('Sin capacidad de escalar')
  })
  it("'maquinaria' tiene label (antes caía a 'Desconocido'/'Sin capacidad')", () => {
    expect(labelEscalabilidad('maquinaria')).toBe('Invirtiendo en maquinaria/equipamiento')
  })
  it("'contratar' y 'tercerizar' siguen correctos", () => {
    expect(labelEscalabilidad('contratar')).toBe('Contratando personal')
    expect(labelEscalabilidad('tercerizar')).toBe('Tercerizando parte de la producción')
  })
  it('valores VIEJOS (turno/horas-extra/no) ya no están en el mapa → fallback', () => {
    expect(ESCALABILIDAD_LABELS['turno']).toBeUndefined()
    expect(ESCALABILIDAD_LABELS['horas-extra']).toBeUndefined()
    expect(labelEscalabilidad('horas-extra')).toBe('Desconocido')
    expect(labelEscalabilidad('horas-extra', 'horas-extra')).toBe('horas-extra')
  })
  it('null/undefined → fallback', () => {
    expect(labelEscalabilidad(null)).toBe('Desconocido')
    expect(labelEscalabilidad(undefined)).toBe('Desconocido')
  })
})

describe('W-A organizacion — "mixta" muestra su propio label, no "Prenda completa"', () => {
  it("'mixta' NO se muestra como 'Prenda completa' (el bug del else)", () => {
    expect(labelOrganizacion('mixta')).toBe('Organización mixta')
    expect(labelOrganizacion('mixta')).not.toBe('Prenda completa')
  })
  it('linea/modular/completa siguen correctos', () => {
    expect(labelOrganizacion('linea')).toBe('En línea')
    expect(labelOrganizacion('modular')).toBe('Modular')
    expect(labelOrganizacion('completa')).toBe('Prenda completa')
  })
})

describe('W-A registro — "no" y "sin-sistematico" son labels distintos', () => {
  it("'no' y 'sin-sistematico' no se colapsan en el mismo texto (el bug del else)", () => {
    expect(labelRegistro('no')).toBe('No llevan registro')
    expect(labelRegistro('sin-sistematico')).toBe('Sin registro sistemático')
    expect(labelRegistro('no')).not.toBe(labelRegistro('sin-sistematico'))
  })
  it('papel/excel/software correctos', () => {
    expect(labelRegistro('papel')).toBe('Papel/cuaderno')
    expect(labelRegistro('excel')).toBe('Excel/planilla')
    expect(labelRegistro('software')).toBe('Sistema/software')
  })
  it("clave muerta 'ninguno' ya no existe en el mapa", () => {
    expect(REGISTRO_LABELS['ninguno']).toBeUndefined()
  })
})
