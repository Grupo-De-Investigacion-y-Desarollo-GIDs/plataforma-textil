import Link from 'next/link'
import { Mail, MessageCircle, ShieldCheck, FileText, User, BookOpen } from 'lucide-react'

const faqItems = [
  {
    q: 'Como me registro como taller o marca?',
    a: 'Ingresa a Registro, elige tu rol y completa el formulario en 3 pasos.',
  },
  {
    q: 'Como recupero mi contrasena?',
    a: 'En Login selecciona "Olvide mi contrasena" y sigue el enlace enviado por email.',
  },
  {
    q: 'Donde veo mis notificaciones?',
    a: 'Si ya iniciaste sesion, entra a la seccion Cuenta > Notificaciones.',
  },
  {
    q: 'Como verifico un certificado?',
    a: 'Usa la pagina Verificar e ingresa el codigo del certificado.',
  },
]

export default function AyudaPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-overpass font-bold text-3xl text-brand-blue">Ayuda y Soporte</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/ayuda/onboarding-taller" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-blue hover:shadow-card transition-all">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-brand-blue" />
            <h2 className="font-overpass font-semibold text-brand-blue">Guia para talleres</h2>
          </div>
          <p className="text-sm text-gray-600">Como registrarte, completar tu perfil y recibir pedidos.</p>
        </Link>

        <Link href="/ayuda/onboarding-marca" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-blue hover:shadow-card transition-all">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-brand-blue" />
            <h2 className="font-overpass font-semibold text-brand-blue">Guia para marcas</h2>
          </div>
          <p className="text-sm text-gray-600">Como crear pedidos, recibir cotizaciones y gestionar produccion.</p>
        </Link>

        <Link href="/registro" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-blue hover:shadow-card transition-all">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-brand-blue" />
            <h2 className="font-overpass font-semibold text-brand-blue">Registro</h2>
          </div>
          <p className="text-sm text-gray-600">Crear cuenta como Taller o Marca.</p>
        </Link>

        <Link href="/verificar" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-blue hover:shadow-card transition-all">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-brand-blue" />
            <h2 className="font-overpass font-semibold text-brand-blue">Verificar certificado</h2>
          </div>
          <p className="text-sm text-gray-600">Validar certificados con su codigo.</p>
        </Link>

        <Link href="/terminos" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-blue hover:shadow-card transition-all">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-brand-blue" />
            <h2 className="font-overpass font-semibold text-brand-blue">Terminos y condiciones</h2>
          </div>
          <p className="text-sm text-gray-600">Condiciones de uso de la plataforma.</p>
        </Link>

        <Link href="/privacidad" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-blue hover:shadow-card transition-all">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-brand-blue" />
            <h2 className="font-overpass font-semibold text-brand-blue">Politica de privacidad</h2>
          </div>
          <p className="text-sm text-gray-600">Como tratamos tus datos personales.</p>
        </Link>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-overpass font-bold text-xl text-brand-blue mb-4">Preguntas frecuentes</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.q} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              <h3 className="font-overpass font-semibold text-brand-blue mb-1">{item.q}</h3>
              <p className="text-sm text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-overpass font-bold text-xl text-brand-blue mb-4">Contacto</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-blue" /> soporte@plataformatextil.ar</p>
          <p className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-brand-blue" /> Respuesta estimada: 24-48 hs habiles</p>
        </div>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-overpass font-bold text-xl text-amber-800 mb-2">¿Queres reportar una situacion?</h2>
        <p className="text-sm text-amber-700 mb-4">
          Podes hacer una denuncia de forma anonima o consultar el estado de una denuncia existente.
        </p>
        <div className="flex gap-3">
          <a href="/denunciar"
            className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold text-sm bg-amber-600 text-white px-4 py-2 hover:bg-amber-700 transition-colors">
            Hacer una denuncia
          </a>
          <a href="/consultar-denuncia"
            className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold text-sm border border-amber-600 text-amber-700 px-4 py-2 hover:bg-amber-100 transition-colors">
            Consultar estado
          </a>
        </div>
      </section>
    </div>
  )
}