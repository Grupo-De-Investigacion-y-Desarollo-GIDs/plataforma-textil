import Link from 'next/link'
import { Breadcrumbs } from '@/compartido/componentes/ui/breadcrumbs'

export default function OnboardingMarcaPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Breadcrumbs items={[
          { label: 'Ayuda', href: '/ayuda' },
          { label: 'Guia para marcas' },
        ]} />
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mt-4">
          Como empezar como Marca en la Plataforma Digital Textil
        </h1>
        <p className="text-gray-600 mt-2">
          Esta guia te lleva por los primeros pasos para encontrar talleres verificados y gestionar tu produccion.
        </p>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">1</span>
          <h2 className="font-overpass font-bold text-xl text-brand-blue">Registrarte y completar tu perfil</h2>
        </div>
        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
          <li>Entra a <Link href="/registro" className="text-brand-blue hover:underline font-medium">/registro</Link> y elegí el rol Marca</li>
          <li>Completa tus datos: nombre de la marca, tipo, ubicacion</li>
          <li>Indica tu volumen mensual estimado</li>
          <li>Confirma tu email</li>
        </ol>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">2</span>
          <h2 className="font-overpass font-bold text-xl text-brand-blue">Crear un pedido</h2>
        </div>
        <p className="text-sm text-gray-600 mb-3">Desde tu panel, crea un pedido indicando:</p>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li><strong>Tipo de prenda:</strong> remeras, pantalones, camperas, etc.</li>
          <li><strong>Cantidad:</strong> cuantas unidades necesitas</li>
          <li><strong>Proceso productivo:</strong> confeccion, estampado, bordado, etc.</li>
          <li><strong>Plazo:</strong> cuando lo necesitas listo</li>
          <li><strong>Detalles adicionales:</strong> tallas, colores, especificaciones tecnicas</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">3</span>
          <h2 className="font-overpass font-bold text-xl text-brand-blue">Recibir y comparar cotizaciones</h2>
        </div>
        <p className="text-sm text-gray-600 mb-3">Los talleres compatibles veran tu pedido y te enviaran cotizaciones. Para cada una podes ver:</p>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Precio por unidad y total</li>
          <li>Plazo de entrega propuesto</li>
          <li>Nivel del taller (Bronce, Plata, Oro)</li>
          <li>Badges de verificacion (CUIT verificado, documentos aprobados)</li>
          <li>Rating y pedidos completados</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">4</span>
          <h2 className="font-overpass font-bold text-xl text-brand-blue">Aceptar y dar seguimiento</h2>
        </div>
        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
          <li>Elige la cotizacion que mas te convenga</li>
          <li>Se crea automaticamente una orden de manufactura</li>
          <li>Segui el estado del pedido desde tu panel</li>
          <li>Coordina detalles por la plataforma o WhatsApp</li>
        </ol>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-overpass font-bold text-xl text-brand-blue mb-3">Que buscar en cada taller</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">CUIT Verificado</span>
            <span>El taller tiene su CUIT validado por ARCA</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Documentos</span>
            <span>Tiene documentacion de formalizacion aprobada</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-semibold">Nivel</span>
            <span>Bronce, Plata u Oro indica su grado de formalizacion</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">Certificados</span>
            <span>Capacitaciones completadas en la plataforma</span>
          </div>
        </div>
      </section>

      <section className="bg-brand-blue/5 rounded-xl border border-brand-blue/20 p-6">
        <h2 className="font-overpass font-bold text-xl text-brand-blue mb-3">Necesitas ayuda?</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p>📧 soporte@plataformatextil.ar</p>
          <p>📱 Respuesta estimada: 24-48 hs habiles</p>
        </div>
      </section>
    </div>
  )
}
