import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CURSOS } from '../../scripts/seed-cursos'

const EVALUACIONES = JSON.parse(
  readFileSync(join(__dirname, '../../scripts/seed-cursos-evaluaciones.json'), 'utf-8'),
) as Record<string, { preguntas: Array<{ texto?: string; pregunta?: string; opciones: string[]; correcta: number }>; puntajeMinimo: number }>


describe('seed-cursos — cursos reales (no placeholders)', () => {
  it('son 6 cursos con id, titulo y video propios', () => {
    expect(CURSOS).toHaveLength(6)
    for (const c of CURSOS) {
      expect(c.id).toMatch(/^c[a-z0-9]+$/)
      expect(c.titulo.length).toBeGreaterThan(3)
      expect(c.video.youtubeUrl).toMatch(/^https:\/\/youtu\.be\//)
    }
  })

  it('ningún video es el rickroll placeholder (dQw4w9WgXcQ)', () => {
    for (const c of CURSOS) {
      expect(c.video.youtubeUrl).not.toContain('dQw4w9WgXcQ')
      expect(c.video.youtubeUrl).not.toContain('youtube.com/watch')
    }
  })

  it('ids de colección y de video son únicos', () => {
    const colIds = CURSOS.map(c => c.id)
    const vidIds = CURSOS.map(c => c.video.id)
    expect(new Set(colIds).size).toBe(colIds.length)
    expect(new Set(vidIds).size).toBe(vidIds.length)
  })

  it('TODOS los cursos tienen evaluación (sin ella el avance se corta)', () => {
    // Regresión: dejar cursos sin evaluación rompe la progresión (Sergio, evento).
    for (const c of CURSOS) {
      expect(EVALUACIONES[c.id], `curso "${c.titulo}" sin evaluación`).toBeDefined()
    }
    expect(Object.keys(EVALUACIONES)).toHaveLength(6)
  })

  it('las evaluaciones tienen preguntas con opciones y respuesta correcta válida', () => {
    for (const [, ev] of Object.entries(EVALUACIONES)) {
      expect(ev.puntajeMinimo).toBeGreaterThan(0)
      expect(ev.preguntas.length).toBeGreaterThanOrEqual(3)
      for (const q of ev.preguntas) {
        expect(q.texto ?? q.pregunta, 'pregunta sin texto').toBeTruthy()
        expect(q.opciones.length).toBeGreaterThanOrEqual(2)
        expect(q.correcta).toBeGreaterThanOrEqual(0)
        expect(q.correcta).toBeLessThan(q.opciones.length)
      }
    }
  })

  it('los cursos con procesosTarget lo declaran por nombre (no por id hardcodeado)', () => {
    // Los ids de proceso cambian en cada reseed; el módulo los resuelve por nombre.
    const conProcesos = CURSOS.filter(c => c.procesosTargetNombres.length > 0)
    expect(conProcesos.length).toBeGreaterThan(0)
    for (const c of conProcesos) {
      for (const n of c.procesosTargetNombres) expect(n).not.toMatch(/^c[a-z0-9]{20,}$/) // no es un cuid
    }
  })
})
