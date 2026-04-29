'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Modal } from '@/compartido/componentes/ui/modal'
import { Edit, AlertTriangle } from 'lucide-react'

interface ReglaNivel {
  id: string
  nivel: string
  puntosMinimos: number
  requiereVerificadoAfip: boolean
  certificadosAcademiaMin: number
  descripcion: string | null
  beneficios: string[]
}

interface PreviewResult {
  totalTalleres: number
  talleresAfectados: number
  suben: number
  bajan: number
  detalle: { nombre: string; nivelActual: string; nivelNuevo: string }[]
}

const nivelVariant: Record<string, 'warning' | 'default' | 'success'> = {
  BRONCE: 'warning',
  PLATA: 'default',
  ORO: 'success',
}

export default function EstadoConfiguracionNivelesPage() {
  const [reglas, setReglas] = useState<ReglaNivel[]>([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState<ReglaNivel | null>(null)
  const [editData, setEditData] = useState({ puntosMinimos: 0, requiereVerificadoAfip: false, certificadosAcademiaMin: 0, descripcion: '' })
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [toast, setToast] = useState('')

  const fetchReglas = useCallback(async () => {
    try {
      const res = await fetch('/api/estado/configuracion-niveles')
      if (res.ok) setReglas(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReglas() }, [fetchReglas])

  function openEdit(regla: ReglaNivel) {
    setEditModal(regla)
    setEditData({
      puntosMinimos: regla.puntosMinimos,
      requiereVerificadoAfip: regla.requiereVerificadoAfip,
      certificadosAcademiaMin: regla.certificadosAcademiaMin,
      descripcion: regla.descripcion || '',
    })
    setPreview(null)
  }

  async function handlePreview() {
    if (!editModal) return
    setLoadingPreview(true)
    try {
      const reglasProposadas = reglas.map(r =>
        r.id === editModal.id
          ? { nivel: r.nivel, puntosMinimos: editData.puntosMinimos, requiereVerificadoAfip: editData.requiereVerificadoAfip, certificadosAcademiaMin: editData.certificadosAcademiaMin }
          : { nivel: r.nivel, puntosMinimos: r.puntosMinimos, requiereVerificadoAfip: r.requiereVerificadoAfip, certificadosAcademiaMin: r.certificadosAcademiaMin }
      )
      const res = await fetch('/api/estado/configuracion-niveles/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reglas: reglasProposadas }),
      })
      if (res.ok) setPreview(await res.json())
    } finally {
      setLoadingPreview(false)
    }
  }

  async function handleSave() {
    if (!editModal) return
    setSaving(true)
    try {
      const res = await fetch(`/api/estado/configuracion-niveles/${editModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (!res.ok) { setToast('Error al guardar'); return }
      setToast(`Regla ${editModal.nivel} actualizada`)
      setEditModal(null)
      fetchReglas()
    } finally {
      setSaving(false)
    }
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Configuracion de Niveles</h1>
      <p className="text-gray-500 text-sm mb-6">Criterios para que los talleres alcancen cada nivel — configuracion regulatoria del Estado</p>

      {loading ? (
        <p className="text-sm text-gray-500 text-center py-8">Cargando...</p>
      ) : (
        <div className="space-y-4">
          {reglas.map(regla => (
            <Card key={regla.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={nivelVariant[regla.nivel] || 'default'} className="text-sm px-3 py-1">{regla.nivel}</Badge>
                    <span className="text-sm text-gray-500">{regla.puntosMinimos} pts minimos</span>
                  </div>
                  {regla.descripcion && <p className="text-sm text-gray-600 mb-3">{regla.descripcion}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>AFIP: {regla.requiereVerificadoAfip ? 'Requerido' : 'No requerido'}</span>
                    <span>Certificados academia: {regla.certificadosAcademiaMin}</span>
                  </div>
                  {regla.beneficios.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Beneficios:</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {regla.beneficios.map((b, i) => <li key={i}>- {b}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
                <button onClick={() => openEdit(regla)} className="p-2 hover:bg-gray-100 rounded" aria-label="Editar regla">
                  <Edit className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Editar regla ${editModal?.nivel}`} size="lg">
        {editModal && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Puntos minimos</label>
              <input type="number" min={0} value={editData.puntosMinimos} onChange={e => setEditData({ ...editData, puntosMinimos: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editData.requiereVerificadoAfip} onChange={e => setEditData({ ...editData, requiereVerificadoAfip: e.target.checked })} className="rounded" />
              <span className="text-sm">Requiere verificacion AFIP</span>
            </label>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Certificados de academia minimos</label>
              <input type="number" min={0} value={editData.certificadosAcademiaMin} onChange={e => setEditData({ ...editData, certificadosAcademiaMin: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descripcion</label>
              <textarea value={editData.descripcion} onChange={e => setEditData({ ...editData, descripcion: e.target.value })} rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>

            {/* Preview de impacto */}
            <div className="border-t pt-4">
              <Button size="sm" variant="secondary" onClick={handlePreview} disabled={loadingPreview}>
                {loadingPreview ? 'Calculando...' : 'Ver impacto del cambio'}
              </Button>
              {preview && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {preview.talleresAfectados === 0
                      ? 'Ningun taller cambiaria de nivel con esta configuracion.'
                      : `${preview.talleresAfectados} de ${preview.totalTalleres} talleres cambiarian de nivel:`}
                  </p>
                  {preview.bajan > 0 && (
                    <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                      <AlertTriangle className="w-4 h-4" />
                      {preview.bajan} taller{preview.bajan > 1 ? 'es' : ''} bajaria{preview.bajan > 1 ? 'n' : ''} de nivel
                    </div>
                  )}
                  {preview.suben > 0 && (
                    <p className="text-sm text-green-600 mt-1">{preview.suben} taller{preview.suben > 1 ? 'es' : ''} subiria{preview.suben > 1 ? 'n' : ''} de nivel</p>
                  )}
                  {preview.detalle.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {preview.detalle.map((d, i) => (
                        <p key={i} className="text-xs text-gray-600">{d.nombre}: {d.nivelActual} → {d.nivelNuevo}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditModal(null)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
