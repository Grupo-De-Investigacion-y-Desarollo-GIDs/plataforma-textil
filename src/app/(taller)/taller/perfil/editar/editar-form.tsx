'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/compartido/componentes/ui/button'
import Link from 'next/link'

interface Props {
  taller: {
    id: string
    nombre: string
    ubicacion: string | null
    zona: string | null
    descripcion: string | null
    fundado: number | null
    user: {
      email: string
      name: string | null
      phone: string | null
    }
  }
}

export function EditarPerfilForm({ taller }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [nombre, setNombre] = useState(taller.nombre)
  const [ubicacion, setUbicacion] = useState(taller.ubicacion ?? '')
  const [zona, setZona] = useState(taller.zona ?? '')
  const [descripcion, setDescripcion] = useState(taller.descripcion ?? '')
  const [fundado, setFundado] = useState(taller.fundado?.toString() ?? '')
  const [userName, setUserName] = useState(taller.user.name ?? '')
  const [userPhone, setUserPhone] = useState(taller.user.phone ?? '')

  async function handleGuardar() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/talleres/${taller.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          ubicacion: ubicacion || null,
          zona: zona || null,
          descripcion: descripcion || null,
          fundado: fundado ? parseInt(fundado) : null,
          user: {
            name: userName,
            phone: userPhone,
          },
        }),
      })
      if (res.ok) {
        router.push('/taller/perfil')
      } else {
        const data = await res.json()
        setError(data.error ?? 'Error al guardar los cambios')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/taller/perfil" className="text-brand-blue hover:underline text-sm">
          ← Volver al perfil
        </Link>
      </div>
      <h1 className="text-2xl font-bold font-overpass text-brand-blue">Editar datos básicos</h1>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Sección: Datos de la empresa */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-overpass font-bold text-gray-800">Datos de la empresa</h2>
        <div>
          <label className="text-sm font-medium text-gray-700">Nombre del taller</label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Ubicación</label>
          <input
            value={ubicacion}
            onChange={e => setUbicacion(e.target.value)}
            placeholder="Ej: Av. Corrientes 1234, CABA"
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Zona / Barrio</label>
          <input
            value={zona}
            onChange={e => setZona(e.target.value)}
            placeholder="Ej: La Matanza, Zona Oeste"
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Descripción del taller</label>
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Contá brevemente qué hace tu taller, en qué se especializa..."
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Año de fundación</label>
          <input
            type="number"
            value={fundado}
            onChange={e => setFundado(e.target.value)}
            placeholder="Ej: 2015"
            min={1900}
            max={new Date().getFullYear()}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Sección: Datos del responsable */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-overpass font-bold text-gray-800">Datos del responsable</h2>
        <div>
          <label className="text-sm font-medium text-gray-700">Nombre completo</label>
          <input
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="Nombre y apellido del responsable"
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Teléfono de contacto</label>
          <input
            value={userPhone}
            onChange={e => setUserPhone(e.target.value)}
            placeholder="Ej: +54 11 1234-5678"
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            value={taller.user.email}
            disabled
            className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            El email es tu credencial de login. Para cambiarlo escribí a soporte.
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <Link
          href="/taller/perfil"
          className="flex-1 text-center border border-gray-300 text-gray-600 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50"
        >
          Cancelar
        </Link>
        <button
          onClick={handleGuardar}
          disabled={saving || !nombre.trim()}
          className="flex-1 bg-brand-blue text-white px-4 py-2.5 rounded-lg text-sm hover:bg-brand-blue/90 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
