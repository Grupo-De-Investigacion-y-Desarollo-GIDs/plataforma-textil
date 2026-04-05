import { auth } from '@/compartido/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/compartido/lib/prisma'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Search, BookOpen, BarChart3, Shield, Award, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    const role = (session.user as { role?: string }).role
    switch (role) {
      case 'TALLER': redirect('/taller')
      case 'MARCA': redirect('/marca/directorio')
      case 'ESTADO': redirect('/estado')
      case 'ADMIN': redirect('/admin')
    }
  }

  // Contadores reales
  const [talleres, marcas, certificados, colecciones] = await Promise.all([
    prisma.taller.count(),
    prisma.marca.count(),
    prisma.certificado.count({ where: { revocado: false } }),
    prisma.coleccion.findMany({
      where: { activa: true },
      select: { id: true, titulo: true, institucion: true, duracion: true, _count: { select: { videos: true } } },
      take: 3,
      orderBy: { createdAt: 'asc' },
    }),
  ]).catch(() => [0, 0, 0, []])

  return (
    <div className="min-h-screen bg-white">

      {/* ── HEADER PÚBLICO ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
              <span className="font-overpass font-bold text-white text-xs">PDT</span>
            </div>
            <span className="font-overpass font-bold text-brand-blue text-base hidden sm:inline">
              Plataforma Digital Textil
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/directorio" className="text-sm text-gray-600 hover:text-brand-blue transition-colors font-overpass hidden md:inline">
              Directorio
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-brand-blue transition-colors font-overpass">
              Ingresar
            </Link>
            <Link
              href="/registro?rol=TALLER"
              className="text-sm text-brand-blue border border-brand-blue px-3 py-1.5 rounded-lg font-overpass font-semibold hover:bg-blue-50 transition-colors"
            >
              Soy taller
            </Link>
            <Link
              href="/registro?rol=MARCA"
              className="hidden sm:inline text-sm bg-brand-blue text-white px-3 py-1.5 rounded-lg font-overpass font-semibold hover:bg-blue-800 transition-colors"
            >
              Soy marca
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-brand-blue uppercase tracking-wider mb-4">
            Una iniciativa de OIT Argentina y UNTREF
          </p>
          <h1 className="font-overpass font-bold text-4xl sm:text-5xl lg:text-6xl text-brand-blue leading-tight mb-6">
            Plataforma Digital Textil
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Conectamos talleres formalizados con marcas que buscan proveedores confiables
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link
              href="/registro?rol=TALLER"
              className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white px-8 py-3.5 rounded-lg font-overpass font-semibold text-base hover:bg-blue-800 transition-colors"
            >
              Soy taller <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/registro?rol=MARCA"
              className="inline-flex items-center justify-center gap-2 border-2 border-brand-blue text-brand-blue px-8 py-3.5 rounded-lg font-overpass font-semibold text-base hover:bg-blue-50 transition-colors"
            >
              Soy marca
            </Link>
          </div>

          {/* Contadores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: talleres as number, label: 'Talleres activos' },
              { value: marcas as number, label: 'Marcas registradas' },
              { value: certificados as number, label: 'Certificados emitidos' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-overpass font-bold text-3xl text-brand-blue">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ¿QUIÉN SOS? ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-overpass font-bold text-3xl text-center text-gray-900 mb-3">
            ¿Quién sos?
          </h2>
          <p className="text-gray-500 text-center mb-12">Elegí tu perfil para ver cómo te ayudamos</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Taller */}
            <div className="rounded-2xl border-2 border-gray-100 p-9 hover:border-brand-blue/40 hover:shadow-lg transition-all flex flex-col">
              <div className="text-5xl mb-3">🏭</div>
              <h3 className="font-overpass font-bold text-xl text-brand-blue mb-2">Soy Taller</h3>
              <p className="text-sm text-gray-600 mb-5">
                Formalizá tu taller, capacitate y accedé a mejores oportunidades comerciales
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {['Perfil público verificado', 'Capacitación gratuita', 'Certificaciones oficiales', 'Visibilidad ante marcas'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/registro?rol=TALLER"
                className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white px-6 py-2.5 rounded-lg font-overpass font-semibold text-sm hover:bg-blue-800 transition-colors"
              >
                Registrarme <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Marca */}
            <div className="rounded-2xl border-2 border-gray-100 p-9 hover:border-brand-blue/40 hover:shadow-lg transition-all flex flex-col">
              <div className="text-5xl mb-3">👗</div>
              <h3 className="font-overpass font-bold text-xl text-brand-blue mb-2">Soy Marca</h3>
              <p className="text-sm text-gray-600 mb-5">
                Encontrá proveedores verificados y formalizados para tu cadena de producción
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {['Directorio con filtros', 'Contacto directo', 'Proveedores certificados', 'Trazabilidad de producción'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/registro?rol=MARCA"
                className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white px-6 py-2.5 rounded-lg font-overpass font-semibold text-sm hover:bg-blue-800 transition-colors"
              >
                Registrarme <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            ¿Sos de un organismo publico?{' '}
            <a
              href="mailto:soporte@plataformatextil.ar?subject=Solicitud de acceso - Estado"
              className="text-brand-blue font-semibold hover:underline"
            >
              Solicita acceso institucional
            </a>
          </p>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="py-20 px-4 bg-blue-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-overpass font-bold text-3xl text-center text-gray-900 mb-3">
            Cómo funciona
          </h2>
          <p className="text-gray-500 text-center mb-14">Un camino claro hacia la formalización</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: '1',
                icon: Shield,
                title: 'Registrate y verificá tu CUIT',
                desc: 'Verificamos tu CUIT automáticamente con ARCA. Tu taller recibe nivel BRONCE al instante.',
              },
              {
                step: '2',
                icon: BookOpen,
                title: 'Capacitate y certificá',
                desc: 'Cursos gratuitos curados por OIT e INTI. Certificados oficiales con código QR verificable.',
              },
              {
                step: '3',
                icon: Search,
                title: 'Conectate con marcas',
                desc: 'Tu taller aparece en el directorio con nivel verificado y las marcas te contactan directamente.',
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                <div className="w-14 h-14 rounded-full bg-brand-blue text-white flex items-center justify-center mx-auto mb-4 font-overpass font-bold text-xl">
                  {item.step}
                </div>
                <item.icon className="w-6 h-6 text-brand-blue mx-auto mb-3" />
                <h3 className="font-overpass font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-0.5 bg-brand-blue/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SISTEMA DE NIVELES ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-overpass font-bold text-3xl text-center text-gray-900 mb-3">
            Sistema de niveles
          </h2>
          <p className="text-gray-500 text-center mb-12">Tu taller crece con vos</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                nivel: 'BRONCE',
                emoji: '🥉',
                color: 'border-amber-300 bg-amber-50',
                titleColor: 'text-amber-700',
                requisitos: ['CUIT verificado en ARCA'],
                beneficios: ['Nivel inicial al registrarte', 'Perfil en la plataforma'],
              },
              {
                nivel: 'PLATA',
                emoji: '🥈',
                color: 'border-gray-300 bg-gray-50',
                titleColor: 'text-gray-700',
                requisitos: ['+ Empleados registrados', '+ Capacitación básica'],
                beneficios: ['Aparecés en el directorio', 'Acceso a marcas formales'],
              },
              {
                nivel: 'ORO',
                emoji: '🥇',
                color: 'border-yellow-400 bg-yellow-50',
                titleColor: 'text-yellow-700',
                requisitos: ['+ Habilitaciones completas', '+ Certificaciones de calidad'],
                beneficios: ['Prioridad en búsquedas', 'Acceso a mejores pedidos'],
              },
            ].map((item) => (
              <div key={item.nivel} className={`rounded-2xl border-2 p-6 ${item.color}`}>
                <div className="text-4xl mb-2">{item.emoji}</div>
                <h3 className={`font-overpass font-bold text-xl mb-4 ${item.titleColor}`}>{item.nivel}</h3>
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Requisitos</p>
                  {item.requisitos.map(r => (
                    <p key={r} className="text-sm text-gray-700 flex items-start gap-1.5 mb-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" /> {r}
                    </p>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Beneficios</p>
                  {item.beneficios.map(b => (
                    <p key={b} className="text-sm text-gray-700 flex items-start gap-1.5 mb-1">
                      <Award className="w-3.5 h-3.5 text-brand-blue mt-0.5 shrink-0" /> {b}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAPACITACIÓN ── */}
      {(colecciones as { id: string; titulo: string; institucion: string | null; duracion: string | null; _count: { videos: number } }[]).length > 0 && (
        <section className="py-20 px-4 bg-blue-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-overpass font-bold text-3xl text-center text-gray-900 mb-3">
              Capacitación con certificación oficial
            </h2>
            <p className="text-gray-500 text-center mb-12">Cursos gratuitos curados por instituciones reconocidas</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {(colecciones as { id: string; titulo: string; institucion: string | null; duracion: string | null; _count: { videos: number } }[]).map((col) => (
                <div key={col.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5 text-brand-blue" />
                  </div>
                  <h3 className="font-overpass font-bold text-base text-gray-900 mb-1">{col.titulo}</h3>
                  {col.institucion && (
                    <p className="text-xs text-brand-blue font-semibold mb-2">{col.institucion}</p>
                  )}
                  <p className="text-xs text-gray-500 mb-3">
                    {col._count.videos} videos{col.duracion ? ` · ${col.duracion}` : ''}
                  </p>
                  <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Certificado al completar
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link href="/registro?rol=TALLER" className="inline-flex items-center gap-2 text-brand-blue font-overpass font-semibold text-sm hover:underline">
                Ver todos los cursos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── VERIFICAR CERTIFICADO ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <Award className="w-10 h-10 text-brand-blue mx-auto mb-4" />
          <h2 className="font-overpass font-bold text-2xl text-gray-900 mb-2">
            Verificación de certificados
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            ¿Recibiste un certificado? Verificá su autenticidad
          </p>
          <form
            action="/verificar"
            method="get"
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              name="code"
              placeholder="Ej: PDT-CERT-2026-001234"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              pattern="PDT-CERT-\d{4}-\d{6}"
              title="Formato: PDT-CERT-YYYY-XXXXXX"
            />
            <button
              type="submit"
              className="bg-brand-blue text-white px-6 py-3 rounded-lg font-overpass font-semibold text-sm hover:bg-blue-800 transition-colors whitespace-nowrap"
            >
              Verificar
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-3">O escaneá el código QR del certificado impreso</p>
        </div>
      </section>

      {/* ── INSTITUCIONES ── */}
      <section className="py-16 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
            Instituciones que respaldan
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {['OIT', 'UNTREF', 'INTI', 'FACTA'].map(inst => (
              <div key={inst} className="w-20 h-12 flex items-center justify-center">
                <span className="font-overpass font-bold text-lg text-gray-400">{inst}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 px-4 bg-brand-blue text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-overpass font-bold text-3xl mb-3">
            Empeza hoy
          </h2>
          <p className="text-blue-200 mb-8">El registro es gratuito y toma menos de 5 minutos</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/registro?rol=TALLER"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-blue px-10 py-4 rounded-lg font-overpass font-bold text-base hover:bg-blue-50 transition-colors"
            >
              Soy taller <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/registro?rol=MARCA"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-10 py-4 rounded-lg font-overpass font-bold text-base hover:bg-blue-900 transition-colors"
            >
              Soy marca <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-blue-200">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-white font-semibold hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </section>

      {/* ── FOOTER PÚBLICO ── */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center">
                  <span className="font-overpass font-bold text-white text-xs">PDT</span>
                </div>
                <span className="font-overpass font-bold text-white text-sm">Plataforma Digital Textil</span>
              </div>
              <p className="text-xs leading-relaxed">
                Una iniciativa de OIT Argentina y UNTREF para la formalización del sector textil.
              </p>
            </div>
            <div>
              <p className="font-overpass font-semibold text-white text-sm mb-3">Plataforma</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">Ingresar</Link></li>
                <li><Link href="/registro?rol=TALLER" className="hover:text-white transition-colors">Registrarse</Link></li>
                <li><Link href="/directorio" className="hover:text-white transition-colors">Directorio de talleres</Link></li>
                <li><Link href="/verificar" className="hover:text-white transition-colors">Verificar certificado</Link></li>
                <li><Link href="/denunciar" className="hover:text-white transition-colors">Hacer una denuncia</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-overpass font-semibold text-white text-sm mb-3">Legal y contacto</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terminos" className="hover:text-white transition-colors">Términos y condiciones</Link></li>
                <li><Link href="/privacidad" className="hover:text-white transition-colors">Política de privacidad</Link></li>
                <li><Link href="/ayuda" className="hover:text-white transition-colors">Ayuda / FAQ</Link></li>
                <li>
                  <a href="mailto:soporte@plataformatextil.ar" className="hover:text-white transition-colors">
                    soporte@plataformatextil.ar
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-xs text-center">
            © 2026 Plataforma Digital Textil | OIT Argentina – UNTREF
          </div>
        </div>
      </footer>
    </div>
  )
}
