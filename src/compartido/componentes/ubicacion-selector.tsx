'use client'

import { useState } from 'react'
import ubicaciones from '@/compartido/data/ubicaciones-ar.json'

interface UbicacionSelectorProps {
  provincia?: string
  partido?: string
  ubicacionDetalle?: string
  onChange: (values: { provincia: string; partido: string; ubicacionDetalle: string }) => void
}

export function UbicacionSelector({ provincia, partido, ubicacionDetalle, onChange }: UbicacionSelectorProps) {
  const [prov, setProv] = useState(provincia ?? '')
  const [part, setPart] = useState(partido ?? '')
  const [detalle, setDetalle] = useState(ubicacionDetalle ?? '')

  const partidos = ubicaciones.provincias
    .find(p => p.nombre === prov)?.partidos ?? []

  function handleProvincia(value: string) {
    setProv(value)
    setPart('')
    onChange({ provincia: value, partido: '', ubicacionDetalle: detalle })
  }

  function handlePartido(value: string) {
    setPart(value)
    onChange({ provincia: prov, partido: value, ubicacionDetalle: detalle })
  }

  function handleDetalle(value: string) {
    setDetalle(value)
    onChange({ provincia: prov, partido: part, ubicacionDetalle: value })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
        <select
          value={prov}
          onChange={e => handleProvincia(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
        >
          <option value="">Seleccioná una provincia</option>
          {ubicaciones.provincias.map(p => (
            <option key={p.id} value={p.nombre}>{p.nombre}</option>
          ))}
        </select>
      </div>

      {prov && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {prov === 'Ciudad Autónoma de Buenos Aires' ? 'Comuna' : 'Partido / Departamento'}
          </label>
          <select
            value={part}
            onChange={e => handlePartido(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          >
            <option value="">Seleccioná {prov === 'Ciudad Autónoma de Buenos Aires' ? 'una comuna' : 'un partido'}</option>
            {partidos.map(p => (
              <option key={p.id} value={p.nombre}>{p.nombre}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Detalle de ubicación <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          value={detalle}
          onChange={e => handleDetalle(e.target.value)}
          placeholder="Ej: Barrio Flores, a 3 cuadras de Av. Rivadavia"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
        />
      </div>
    </div>
  )
}
