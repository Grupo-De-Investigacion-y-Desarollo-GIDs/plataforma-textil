import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { OBJETIVOS, ordenarAssets, type ManifestUser, type Asset } from '../../scripts/seed-evento-imagenes'

const manifest = JSON.parse(
  readFileSync(join(__dirname, '../../scripts/seed-evento-assets/manifest.json'), 'utf-8'),
) as { users: ManifestUser[] }

describe('seed-evento-imagenes — mapeo manifiesto ↔ objetivos', () => {
  it('cada usuario del manifiesto tiene un objetivo mapeado (y viceversa)', () => {
    const codesManifest = manifest.users.map(u => u.user_code).sort()
    const codesObjetivos = Object.keys(OBJETIVOS).sort()
    expect(codesObjetivos).toEqual(codesManifest)
    expect(codesManifest.length).toBe(11) // 6 talleres + 5 marcas
  })

  it('respeta las 3 cuentas showcase que NO siguen el patrón demo.*', () => {
    expect(OBJETIVOS.TAL_006).toEqual({ email: 'carlos.mendoza@pdt.org.ar', kind: 'taller' })
    expect(OBJETIVOS.MAR_004).toEqual({ email: 'valentina.ramos@pdt.org.ar', kind: 'pedido', omId: 'OM-2026-00089' })
    expect(OBJETIVOS.MAR_005).toEqual({ email: 'martin.echevarria@pdt.org.ar', kind: 'pedido', omId: 'OM-2026-00072' })
  })

  it('talleres son kind=taller y marcas son kind=pedido con omId', () => {
    for (const [code, obj] of Object.entries(OBJETIVOS)) {
      if (code.startsWith('TAL_')) {
        expect(obj.kind).toBe('taller')
      } else {
        expect(obj.kind).toBe('pedido')
        expect((obj as { omId: string }).omId).toMatch(/^OM-2026-/)
      }
    }
  })
})

describe('seed-evento-imagenes — orden de assets', () => {
  it('cada usuario del manifiesto tiene 1 logo (0) + 3 fotos (1,2,3)', () => {
    for (const u of manifest.users) {
      const orders = u.assets.map(a => a.sort_order).sort()
      expect(orders).toEqual([0, 1, 2, 3])
      expect(u.assets.filter(a => a.asset_type === 'logo').length).toBe(1)
    }
  })

  it('taller: [foto01, foto02, foto03, LOGO] — logo al cierre, foto primero', () => {
    for (const u of manifest.users.filter(x => x.user_code.startsWith('TAL_'))) {
      const orden = ordenarAssets(u.assets, 'taller')
      expect(orden).toHaveLength(4)
      expect(orden[0].sort_order).toBe(1)            // primera imagen = foto (no logo)
      expect(orden[0].path).not.toMatch(/logo\.png$/i)
      expect(orden.at(-1)!.path).toMatch(/logo\.png$/i) // logo último
    }
  })

  it('marca: solo [foto01, foto02, foto03] — sin logo', () => {
    for (const u of manifest.users.filter(x => x.user_code.startsWith('MAR_'))) {
      const orden = ordenarAssets(u.assets, 'pedido')
      expect(orden).toHaveLength(3)
      expect(orden.some(a => a.path.match(/logo\.png$/i))).toBe(false)
      expect(orden.map(a => a.sort_order)).toEqual([1, 2, 3])
    }
  })

  it('ordena aunque el manifiesto venga desordenado', () => {
    const desordenado: Asset[] = [
      { sort_order: 2, asset_type: 'producto', path: 'x/x_02.jpg', alt_text: '' },
      { sort_order: 0, asset_type: 'logo', path: 'x/x_logo.png', alt_text: '' },
      { sort_order: 3, asset_type: 'proceso', path: 'x/x_03.jpg', alt_text: '' },
      { sort_order: 1, asset_type: 'taller', path: 'x/x_01.jpg', alt_text: '' },
    ]
    expect(ordenarAssets(desordenado, 'taller').map(a => a.sort_order)).toEqual([1, 2, 3, 0])
    expect(ordenarAssets(desordenado, 'pedido').map(a => a.sort_order)).toEqual([1, 2, 3])
  })
})
