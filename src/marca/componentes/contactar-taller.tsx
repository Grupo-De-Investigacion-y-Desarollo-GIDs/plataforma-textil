'use client'
import { useState } from 'react'
import { Modal } from '@/compartido/componentes/ui/modal'
import { MessageCircle } from 'lucide-react'

interface ContactarTallerProps {
  taller: {
    id: string
    nombre: string
    nivel: string
    phone: string | null
  }
  marca: {
    id: string
    tipo: string | null
    ubicacion: string | null
    volumenMensual: number
  }
}

export function ContactarTaller({ taller, marca }: ContactarTallerProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tipo, setTipo] = useState(marca.tipo ?? '')
  const [ubicacion, setUbicacion] = useState(marca.ubicacion ?? '')
  const [volumen, setVolumen] = useState(marca.volumenMensual > 0 ? String(marca.volumenMensual) : '')
  const [guardando, setGuardando] = useState(false)

  const perfilCompleto = !!marca.tipo && !!marca.ubicacion && marca.volumenMensual > 0

  function handleContactar() {
    if (!perfilCompleto) {
      setModalAbierto(true)
      return
    }
    abrirWhatsApp()
  }

  function abrirWhatsApp() {
    if (!taller.phone) {
      alert('Este taller no tiene telefono registrado. Intenta contactarlo por otro medio.')
      return
    }
    const phoneClean = taller.phone.replace(/\D/g, '')
    const mensaje = encodeURIComponent(
      `Hola ${taller.nombre}, te contacto desde la Plataforma Digital Textil (PDT). ` +
      `Soy una marca de indumentaria y me interesa trabajar con tu taller.`
    )
    window.open(`https://wa.me/${phoneClean}?text=${mensaje}`, '_blank')
  }

  async function handleGuardarPerfil() {
    if (!tipo || !ubicacion || !volumen) return
    setGuardando(true)
    const res = await fetch(`/api/marcas/${marca.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo,
        ubicacion,
        volumenMensual: parseInt(volumen),
      }),
    })
    setGuardando(false)
    if (res.ok) {
      setModalAbierto(false)
      abrirWhatsApp()
    }
  }

  return (
    <>
      <button
        onClick={handleContactar}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
      >
        <MessageCircle className="w-4 h-4" />
        Contactar por WhatsApp
      </button>

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Completa tu perfil para contactar"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Para que el taller sepa quien los contacta, necesitamos algunos datos de tu marca.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Tipo de marca</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Selecciona...</option>
              <option value="Diseno independiente">Diseno independiente</option>
              <option value="Marca comercial">Marca comercial</option>
              <option value="Indumentaria deportiva">Indumentaria deportiva</option>
              <option value="Ropa de trabajo">Ropa de trabajo</option>
              <option value="Moda infantil">Moda infantil</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Ubicacion</label>
            <input type="text" value={ubicacion} onChange={e => setUbicacion(e.target.value)}
              placeholder="Ej: Palermo, CABA"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Volumen mensual aproximado (unidades)</label>
            <input type="number" value={volumen} onChange={e => setVolumen(e.target.value)}
              placeholder="Ej: 500"
              min="1"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={() => setModalAbierto(false)}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleGuardarPerfil}
            disabled={!tipo || !ubicacion || !volumen || guardando}
            className="flex-1 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90 disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Guardar y contactar'}
          </button>
        </div>
      </Modal>
    </>
  )
}
