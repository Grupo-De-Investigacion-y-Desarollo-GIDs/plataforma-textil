'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NuevaColeccionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    institucion: '',
    duracion: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/colecciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/admin/colecciones/${data.id}`)
      }
    } catch {
      // Error silencioso
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Link href="/admin/colecciones" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a colecciones
      </Link>

      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Nueva Colección</h1>
      <p className="text-gray-500 text-sm mb-6">Creá una nueva colección de videos de capacitación</p>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <div className="space-y-4">
            <Input
              label="Título de la colección"
              value={form.titulo}
              onChange={e => setForm(prev => ({ ...prev, titulo: e.target.value }))}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                rows={3}
                value={form.descripcion}
                onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Categoría"
                value={form.categoria}
                onChange={e => setForm(prev => ({ ...prev, categoria: e.target.value }))}
              />
              <Input
                label="Institución"
                value={form.institucion}
                onChange={e => setForm(prev => ({ ...prev, institucion: e.target.value }))}
              />
            </div>
            <Input
              label="Duración estimada"
              placeholder="Ej: 2 horas"
              value={form.duracion}
              onChange={e => setForm(prev => ({ ...prev, duracion: e.target.value }))}
            />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading || !form.titulo} className="flex-1">
            {loading ? 'Creando...' : 'Crear Colección'}
          </Button>
          <Link href="/admin/colecciones">
            <Button type="button" variant="secondary">Cancelar</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
