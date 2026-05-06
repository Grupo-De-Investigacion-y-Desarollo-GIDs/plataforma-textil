import Link from 'next/link'

export default function OnboardingTallerPage() {
  const registroUrl = process.env.NEXTAUTH_URL ?? 'https://plataforma-textil.vercel.app'

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link href="/ayuda" className="text-sm text-brand-blue hover:underline">&larr; Volver a Ayuda</Link>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mt-4">
          Como empezar en la Plataforma Digital Textil
        </h1>
        <p className="text-gray-600 mt-2">
          Esta guia te lleva por los primeros pasos para empezar a recibir pedidos de marcas formales en la plataforma.
        </p>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-overpass font-bold text-xl text-brand-blue mb-3">Antes de empezar</h2>
        <p className="text-sm text-gray-600 mb-3">Necesitas tener a mano:</p>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Tu CUIT (de tu monotributo o IVA)</li>
          <li>Tu email</li>
          <li>Tu celular con WhatsApp</li>
          <li>Un documento que pruebe tu CUIT (constancia de inscripcion)</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">1</span>
          <h2 className="font-overpass font-bold text-xl text-brand-blue">Registrarte (5 minutos)</h2>
        </div>
        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
          <li>Entra a <Link href="/registro" className="text-brand-blue hover:underline font-medium">{registroUrl}/registro</Link></li>
          <li>Completa tus datos basicos</li>
          <li>Verificamos tu CUIT con ARCA automaticamente</li>
          <li>Confirma tu email haciendo click en el link que te llega</li>
        </ol>
        <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
          <p className="text-sm text-amber-800">
            <strong>Si tu CUIT da error:</strong> probablemente estas como Empleado en relacion de dependencia, no como Monotributo. Habla con tu contador o consulta AFIP.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">2</span>
          <h2 className="font-overpass font-bold text-xl text-brand-blue">Completar tu perfil (10 minutos)</h2>
        </div>
        <p className="text-sm text-gray-600 mb-3">Una vez adentro, completa:</p>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li><strong>Tu taller:</strong> nombre comercial, ubicacion, descripcion</li>
          <li><strong>Tu capacidad:</strong> cuantas piezas mensuales podes producir</li>
          <li><strong>Procesos que haces:</strong> confeccion, estampado, bordado, etc.</li>
          <li><strong>Tipos de prendas:</strong> remeras, camperas, vestidos, etc.</li>
        </ul>
        <p className="text-sm text-gray-500 mt-3">Esto nos permite hacer match con los pedidos correctos.</p>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">3</span>
          <h2 className="font-overpass font-bold text-xl text-brand-blue">Subir tus primeros documentos (15 minutos)</h2>
        </div>
        <p className="text-sm text-gray-600 mb-3">En la seccion <strong>Formalizacion</strong>, subi:</p>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Constancia de monotributo o inscripcion IVA</li>
          <li>Habilitacion municipal (si la tenes)</li>
          <li>Constancia de ART (si tenes empleados)</li>
        </ul>
        <p className="text-sm text-gray-500 mt-3">El Estado los revisa y aprueba en 24-48hs habiles.</p>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">4</span>
          <h2 className="font-overpass font-bold text-xl text-brand-blue">Cuando recibis un pedido</h2>
        </div>
        <p className="text-sm text-gray-600 mb-3">Te notificamos por WhatsApp y por la plataforma. Tenes que:</p>
        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
          <li>Abrir el pedido y ver los detalles</li>
          <li>Calcular si podes hacerlo (tiempo, capacidad, precio)</li>
          <li>Cotizar dentro del plazo (generalmente 48hs)</li>
          <li>Esperar la respuesta de la marca</li>
        </ol>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-overpass font-bold text-xl text-brand-blue mb-3">Niveles del taller</h2>
        <p className="text-sm text-gray-600 mb-4">A medida que completas documentos y trabajos, subis de nivel:</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
            <span className="text-2xl">🥉</span>
            <div>
              <p className="font-overpass font-semibold text-amber-800">BRONCE</p>
              <p className="text-sm text-amber-700">Nivel inicial al registrarte</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
            <span className="text-2xl">🥈</span>
            <div>
              <p className="font-overpass font-semibold text-gray-800">PLATA</p>
              <p className="text-sm text-gray-600">Con documentos clave aprobados + 1 capacitacion</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <span className="text-2xl">🥇</span>
            <div>
              <p className="font-overpass font-semibold text-yellow-800">ORO</p>
              <p className="text-sm text-yellow-700">Tope, con todos los documentos + capacitaciones avanzadas</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">Cada nivel te da acceso a mejores pedidos.</p>
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
