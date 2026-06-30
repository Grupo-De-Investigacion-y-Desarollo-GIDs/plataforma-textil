import { describe, it, expect } from 'vitest'
import {
  BLOQUES_VIDRIERA,
  bloqueVisible,
  bloqueVisiblePublico,
  bloqueVisibleVidriera,
  badgeFormacionVisible,
  tallerElegibleDirectorio,
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

  describe('set del piloto (Etapa 2.2-C1): 11 keys toggle-libre', () => {
    it('incluye las nuevas keys ademas de las de #437 (+ inscripcion en la 2a vuelta)', () => {
      const esperadas = [
        'formacion', 'equipo', 'espacio', 'capacidad', 'organizacion',
        'maquinaria', 'procesos', 'prendas', 'anioFundacion', 'portfolio',
        'inscripcion',
      ]
      expect([...BLOQUES_VIDRIERA].sort()).toEqual([...esperadas].sort())
      expect(BLOQUES_VIDRIERA).toHaveLength(11)
    })

    it('NO incluye tiempos (= SAM) ni certificaciones externas (fuera del piloto)', () => {
      expect((BLOQUES_VIDRIERA as readonly string[]).includes('tiempos')).toBe(false)
      expect((BLOQUES_VIDRIERA as readonly string[]).includes('certificaciones')).toBe(false)
    })
  })

  // Matriz flag × visibilidad — el corazon de 2.2-B (privacy-by-default).
  describe('bloqueVisiblePublico: render condicional por modeloB_revisado', () => {
    describe('modeloB_revisado=true (existentes) => BEHAVIOR-PRESERVING (#437)', () => {
      it('flag=true + visibilidad=null => todo visible (existentes intactos)', () => {
        const taller = { modeloB_revisado: true, visibilidadVidriera: null }
        for (const b of BLOQUES_VIDRIERA) {
          expect(bloqueVisiblePublico(taller, b)).toBe(true)
        }
      })

      it('flag=true + campo ausente => todo visible', () => {
        const taller = { modeloB_revisado: true }
        for (const b of BLOQUES_VIDRIERA) {
          expect(bloqueVisiblePublico(taller, b)).toBe(true)
        }
      })

      it('flag=true + un bloque en false explicito => ese bloque oculto, resto visible', () => {
        const taller = { modeloB_revisado: true, visibilidadVidriera: { maquinaria: false } }
        expect(bloqueVisiblePublico(taller, 'maquinaria')).toBe(false)
        expect(bloqueVisiblePublico(taller, 'procesos')).toBe(true)
        expect(bloqueVisiblePublico(taller, 'portfolio')).toBe(true)
      })
    })

    describe('modeloB_revisado=false (nuevos) => privacy-by-default', () => {
      it('flag=false + visibilidad=null => bloques toggle-libre OCULTOS', () => {
        const taller = { modeloB_revisado: false, visibilidadVidriera: null }
        for (const b of BLOQUES_VIDRIERA) {
          expect(bloqueVisiblePublico(taller, b)).toBe(false)
        }
      })

      it('flag ausente (default Prisma) se comporta como false => oculto', () => {
        const taller = { visibilidadVidriera: null }
        for (const b of BLOQUES_VIDRIERA) {
          expect(bloqueVisiblePublico(taller, b)).toBe(false)
        }
      })

      it('flag=false + un bloque en true explicito => SOLO ese bloque visible', () => {
        const taller = { modeloB_revisado: false, visibilidadVidriera: { procesos: true } }
        expect(bloqueVisiblePublico(taller, 'procesos')).toBe(true)
        expect(bloqueVisiblePublico(taller, 'prendas')).toBe(false)
        expect(bloqueVisiblePublico(taller, 'maquinaria')).toBe(false)
      })

      it('flag=false + un bloque en false explicito => oculto (igual que el default)', () => {
        const taller = { modeloB_revisado: false, visibilidadVidriera: { maquinaria: false } }
        expect(bloqueVisiblePublico(taller, 'maquinaria')).toBe(false)
      })

      it('flag=false + valor no-booleano (string "true") => NO se muestra (defensivo)', () => {
        const taller = { modeloB_revisado: false, visibilidadVidriera: { procesos: 'true' } }
        expect(bloqueVisiblePublico(taller, 'procesos')).toBe(false)
      })
    })

    describe('robustez de tipos crudos', () => {
      it('visibilidadVidriera array u otros tipos => oculto si flag=false', () => {
        expect(bloqueVisiblePublico({ modeloB_revisado: false, visibilidadVidriera: [] }, 'equipo')).toBe(false)
        expect(bloqueVisiblePublico({ modeloB_revisado: false, visibilidadVidriera: 'x' }, 'equipo')).toBe(false)
      })

      it('visibilidadVidriera array u otros tipos => visible si flag=true', () => {
        expect(bloqueVisiblePublico({ modeloB_revisado: true, visibilidadVidriera: [] }, 'equipo')).toBe(true)
        expect(bloqueVisiblePublico({ modeloB_revisado: true, visibilidadVidriera: 42 }, 'equipo')).toBe(true)
      })
    })
  })

  // Resolver de render (Etapa 2.2-C1): net-new = SOLO-OPT-IN, legacy = flag-aware.
  describe('bloqueVisibleVidriera: net-new opt-in vs legacy flag-aware', () => {
    const NET_NEW: BloqueVidriera[] = ['equipo', 'espacio', 'capacidad', 'organizacion', 'anioFundacion', 'inscripcion']
    const LEGACY: BloqueVidriera[] = ['procesos', 'prendas', 'maquinaria', 'portfolio', 'formacion']

    it('CRÍTICO: existente (flag=true, null) NO expone bloques net-new (vidriera igual a 2.2-B)', () => {
      const taller = { modeloB_revisado: true, visibilidadVidriera: null }
      for (const b of NET_NEW) expect(bloqueVisibleVidriera(taller, b)).toBe(false)
    })

    it('existente (flag=true, null) SIGUE mostrando los bloques legacy (behavior-preserving)', () => {
      const taller = { modeloB_revisado: true, visibilidadVidriera: null }
      for (const b of LEGACY) expect(bloqueVisibleVidriera(taller, b)).toBe(true)
    })

    it('net-new se muestra SOLO con true explícito, sin importar el flag', () => {
      for (const b of NET_NEW) {
        expect(bloqueVisibleVidriera({ modeloB_revisado: true, visibilidadVidriera: { [b]: true } }, b)).toBe(true)
        expect(bloqueVisibleVidriera({ modeloB_revisado: false, visibilidadVidriera: { [b]: true } }, b)).toBe(true)
        expect(bloqueVisibleVidriera({ modeloB_revisado: true, visibilidadVidriera: { [b]: false } }, b)).toBe(false)
      }
    })

    it('nuevo (flag=false, null) no muestra nada (net-new ni legacy)', () => {
      const taller = { modeloB_revisado: false, visibilidadVidriera: null }
      for (const b of [...NET_NEW, ...LEGACY]) expect(bloqueVisibleVidriera(taller, b)).toBe(false)
    })

    it('legacy coincide con bloqueVisiblePublico (flag-aware)', () => {
      const t1 = { modeloB_revisado: true, visibilidadVidriera: { maquinaria: false } }
      expect(bloqueVisibleVidriera(t1, 'maquinaria')).toBe(bloqueVisiblePublico(t1, 'maquinaria'))
      const t2 = { modeloB_revisado: false, visibilidadVidriera: { procesos: true } }
      expect(bloqueVisibleVidriera(t2, 'procesos')).toBe(bloqueVisiblePublico(t2, 'procesos'))
    })
  })

  // Formación granular (Etapa 2.2-C1, §6.2).
  describe('badgeFormacionVisible: master + override por badge', () => {
    it('master oculto (flag=false, null) => ningun badge se muestra', () => {
      const taller = { modeloB_revisado: false, visibilidadVidriera: null }
      expect(badgeFormacionVisible(taller, 'cert-1')).toBe(false)
    })

    it('master visible (flag=true) + badge ausente => visible', () => {
      const taller = { modeloB_revisado: true, visibilidadVidriera: { formacion: true } }
      expect(badgeFormacionVisible(taller, 'cert-1')).toBe(true)
    })

    it('master visible + badge en false explicito => oculto', () => {
      const taller = {
        modeloB_revisado: true,
        visibilidadVidriera: { formacion: true, formacionBadges: { 'cert-1': false } },
      }
      expect(badgeFormacionVisible(taller, 'cert-1')).toBe(false)
      expect(badgeFormacionVisible(taller, 'cert-2')).toBe(true) // otro badge sigue visible
    })

    it('master visible + badge en true explicito => visible', () => {
      const taller = {
        modeloB_revisado: false,
        visibilidadVidriera: { formacion: true, formacionBadges: { 'cert-1': true } },
      }
      expect(badgeFormacionVisible(taller, 'cert-1')).toBe(true)
    })

    it('si el master esta oculto, el override por badge se ignora', () => {
      const taller = {
        modeloB_revisado: true,
        visibilidadVidriera: { formacion: false, formacionBadges: { 'cert-1': true } },
      }
      expect(badgeFormacionVisible(taller, 'cert-1')).toBe(false)
    })

    it('formacionBadges no-objeto (defensivo) => badge visible si master on', () => {
      const taller = {
        modeloB_revisado: true,
        visibilidadVidriera: { formacion: true, formacionBadges: 'x' },
      }
      expect(badgeFormacionVisible(taller, 'cert-1')).toBe(true)
    })
  })

  // R-DIR — elegibilidad de directorio (Etapa 2.2-C1, §4.4). Cambio de supuesto vs #437.
  describe('tallerElegibleDirectorio: visibilidad condiciona inclusion', () => {
    const conProcesos = [{ id: 'p1' }]
    const conPrendas = [{ id: 'r1' }]

    it('existente (flag=true, null) con procesos => elegible (behavior-preserving)', () => {
      const taller = { modeloB_revisado: true, visibilidadVidriera: null, procesos: conProcesos, prendas: [] }
      expect(tallerElegibleDirectorio(taller)).toBe(true)
    })

    it('CASO OBLIGATORIO: nuevo (flag=false) con todo toggle-libre oculto => NO aparece', () => {
      const taller = { modeloB_revisado: false, visibilidadVidriera: null, procesos: conProcesos, prendas: conPrendas }
      expect(tallerElegibleDirectorio(taller)).toBe(false)
    })

    it('nuevo (flag=false) con procesos activado explicito => elegible', () => {
      const taller = { modeloB_revisado: false, visibilidadVidriera: { procesos: true }, procesos: conProcesos, prendas: [] }
      expect(tallerElegibleDirectorio(taller)).toBe(true)
    })

    it('nuevo (flag=false) con solo rubro/prenda activado => elegible (via rubro)', () => {
      const taller = { modeloB_revisado: false, visibilidadVidriera: { prendas: true }, procesos: [], prendas: conPrendas }
      expect(tallerElegibleDirectorio(taller)).toBe(true)
    })

    it('existente (flag=true) que oculto procesos Y prendas => NO aparece', () => {
      const taller = {
        modeloB_revisado: true,
        visibilidadVidriera: { procesos: false, prendas: false },
        procesos: conProcesos,
        prendas: conPrendas,
      }
      expect(tallerElegibleDirectorio(taller)).toBe(false)
    })

    it('sin procesos ni prendas cargados => no elegible aunque flag=true', () => {
      const taller = { modeloB_revisado: true, visibilidadVidriera: null, procesos: [], prendas: [] }
      expect(tallerElegibleDirectorio(taller)).toBe(false)
    })
  })
})
