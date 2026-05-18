import { auth } from '@/compartido/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/compartido/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { HeaderPublic } from '@/compartido/componentes/layout/header-public'
import { Footer } from '@/compartido/componentes/layout/footer'
import { getShowPilotPill } from '@/compartido/lib/env'
import { CarruselNovedades, type CarruselItem } from '@/compartido/componentes/ui/carrusel-novedades'
import { IconTaller, IconMarca, IconVerificado, IconTrazabilidad, IconCapacitacion, IconPedido } from '@/compartido/iconos'
import { LANDING_COPY } from '@/compartido/lib/content/institutional'

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
      case 'CONTENIDO': redirect('/contenido')
    }
  }

  // Queries paralelas para stats + carrusel
  const [vidrierasPublicadas, marcasExplorando, cursosPublicados, encuentrosGenerados, novedades, colecciones] = await Promise.all([
    prisma.taller.count({ where: { verificadoAfip: true } }),
    prisma.marca.count(),
    prisma.coleccion.count({ where: { activa: true } }),
    prisma.pedido.count(),
    prisma.novedad.findMany({
      where: { publicado: true },
      orderBy: { fecha: 'desc' },
      take: 2,
      select: { id: true, tipo: true, titulo: true, slug: true, fecha: true, imagenUrl: true },
    }),
    prisma.coleccion.findMany({
      where: { activa: true },
      orderBy: { createdAt: 'desc' },
      take: 2,
      select: { id: true, titulo: true, duracion: true, videos: { select: { id: true } } },
    }),
  ]).catch(() => [0, 0, 0, 0, [], []] as const)

  // Armar items del carrusel (mezcla novedades + cursos)
  const carruselItems: CarruselItem[] = [
    ...(novedades as { id: string; tipo: string; titulo: string; slug: string; fecha: Date; imagenUrl: string | null }[]).map(n => ({
      id: n.id,
      tipo: (n.tipo === 'INDICADOR' ? 'INDICADOR' : 'NOVEDAD') as CarruselItem['tipo'],
      titulo: n.titulo,
      subtitulo: n.fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
      imagen: n.imagenUrl,
      href: `/novedades/${n.slug}`,
    })),
    ...(colecciones as { id: string; titulo: string; duracion: string | null; videos: { id: string }[] }[]).map(c => ({
      id: c.id,
      tipo: 'CURSO' as const,
      titulo: c.titulo,
      subtitulo: `${c.videos.length} videos${c.duracion ? ` · ${c.duracion}` : ''}`,
      imagen: null,
      href: '/academia-publica',
    })),
  ]

  const { hero, actores, impacto, carrusel, ctaBanner } = LANDING_COPY

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HeaderPublic showPilotPill={getShowPilotPill()} />

      {/* ═══ HERO ═══ */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 pattern-grid opacity-40" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-terra-50 opacity-70" />
        <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-pastel-blue opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <h1 className="font-serif font-extrabold text-5xl lg:text-7xl text-ink-primary leading-[1.05] tracking-tight">
              {hero.titleParts[0]}<br />
              {hero.titleParts[1]}<br />
              <span className="italic font-medium text-ink-secondary">{hero.titleParts[2]}</span>
            </h1>
            <p className="text-ink-secondary text-lg mt-6 leading-relaxed max-w-xl">
              {hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href={hero.ctaTaller.href}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-blue text-white font-overpass font-semibold rounded-lg hover:bg-brand-blue-dark shadow-soft transition-colors"
              >
                <IconTaller className="w-4 h-4" />
                {hero.ctaTaller.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={hero.ctaMarca.href}
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-ink-primary text-ink-primary font-overpass font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                <IconMarca className="w-4 h-4" />
                {hero.ctaMarca.label}
              </Link>
            </div>
          </div>

          {/* Hero image + floating cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-card-hover">
              <Image
                src="/images/landing/hero-taller.png"
                alt={hero.imageAlt}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Card flotante: trazabilidad */}
            <div className="absolute -left-6 top-12 bg-white rounded-2xl shadow-card-hover p-4 max-w-[200px] border border-gray-100 hidden md:block">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-pastel-terra flex items-center justify-center">
                  <IconTrazabilidad className="w-4 h-4 text-terra-600" />
                </div>
                <p className="font-overpass font-bold text-xs text-ink-primary">{hero.cardTrazabilidad.title}</p>
              </div>
              <p className="text-xs text-ink-secondary leading-snug">{hero.cardTrazabilidad.subtitle}</p>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ ASI FUNCIONA ═══ */}
      <section id="como-funciona" className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest font-overpass font-bold text-terra-600 mb-2">
              Asi funciona
            </p>
            <h2 className="font-serif font-bold text-4xl lg:text-5xl text-ink-primary mb-4">
              Acompañamos al sector textil en cada paso del recorrido.
            </h2>
          </div>
          <div className="space-y-6 text-lg text-ink-secondary leading-relaxed">
            <p>
              Un taller textil se suma. Aprende con cursos gratuitos, arma su perfil
              y muestra lo que sabe hacer.
            </p>
            <p>
              Una marca de indumentaria lo descubre en el directorio. Conoce sus
              capacidades, su trayectoria y su recorrido.
            </p>
            <p>
              Se contactan directo y empiezan a trabajar juntos.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ PARA CADA ACTOR ═══ */}
      <section className="bg-gray-50 py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest font-overpass font-bold text-terra-600 mb-2">
              {actores.eyebrow}
            </p>
            <h2 className="font-serif font-bold text-4xl lg:text-5xl text-ink-primary">
              {actores.title}
            </h2>
            <p className="text-ink-secondary mt-3 max-w-2xl mx-auto">{actores.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Talleres */}
            <div className="bg-white rounded-card shadow-card border border-gray-100 card-lift hover:shadow-card-hover overflow-hidden">
              <div className="h-2 bg-brand-blue" />
              <div className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-pastel-blue flex items-center justify-center mb-5">
                  <IconTaller className="w-7 h-7 text-brand-blue" />
                </div>
                <h3 className="font-serif font-bold text-2xl mb-4">{actores.talleres.title}</h3>
                <ul className="space-y-2.5 text-ink-secondary mb-6 text-sm">
                  {actores.talleres.bullets.map(b => (
                    <li key={b} className="flex items-start gap-2">
                      <IconVerificado className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href={actores.talleres.cta.href}
                  className="inline-flex items-center gap-1 text-brand-blue font-overpass font-semibold text-sm hover:gap-2 transition-all"
                >
                  {actores.talleres.cta.label} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            {/* Marcas */}
            <div className="bg-white rounded-card shadow-card border border-gray-100 card-lift hover:shadow-card-hover overflow-hidden">
              <div className="h-2 bg-green-700" />
              <div className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-pastel-green flex items-center justify-center mb-5">
                  <IconMarca className="w-7 h-7 text-green-700" />
                </div>
                <h3 className="font-serif font-bold text-2xl mb-4">{actores.marcas.title}</h3>
                <ul className="space-y-2.5 text-ink-secondary mb-6 text-sm">
                  {actores.marcas.bullets.map(b => (
                    <li key={b} className="flex items-start gap-2">
                      <IconVerificado className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href={actores.marcas.cta.href}
                  className="inline-flex items-center gap-1 text-green-700 font-overpass font-semibold text-sm hover:gap-2 transition-all"
                >
                  {actores.marcas.cta.label} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ IMPACTO ═══ */}
      <section id="impacto" className="bg-ink-primary text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 pattern-weave opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest font-overpass font-bold text-terra-300 mb-3">
              {impacto.eyebrow}
            </p>
            <h2 className="font-serif font-bold text-4xl lg:text-5xl mb-6 leading-tight">
              {impacto.titleParts[0]} <span className="italic text-terra-300">{impacto.titleParts[1]}</span>
            </h2>
            <p className="text-gray-300 leading-relaxed max-w-md">{impacto.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {[
              { value: vidrierasPublicadas, label: 'Vidrieras de talleres publicadas', icon: IconTaller, iconColor: 'text-pastel-blue' },
              { value: marcasExplorando, label: 'Marcas explorando proveedores formales', icon: IconMarca, iconColor: 'text-pastel-green' },
              { value: cursosPublicados, label: 'Cursos publicados', icon: IconCapacitacion, iconColor: 'text-terra-300' },
              { value: encuentrosGenerados, label: 'Encuentros generados', icon: IconPedido, iconColor: 'text-pastel-blue' },
            ].map(stat => (
              <div key={stat.label} className="bg-ink-primary p-8">
                <stat.icon className={`w-6 h-6 ${stat.iconColor} mb-4`} />
                <div className="font-serif font-extrabold text-5xl lg:text-6xl text-white leading-none">
                  {stat.value}
                </div>
                <p className="text-xs uppercase tracking-wider text-gray-400 mt-3 font-overpass font-bold">
                  {stat.label}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Datos a mayo 2026
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CARRUSEL NOVEDADES + CURSOS ═══ */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-overpass font-bold text-terra-600 mb-2">
                {carrusel.eyebrow}
              </p>
              <h2 className="font-serif font-bold text-4xl lg:text-5xl text-ink-primary">
                {carrusel.title}
              </h2>
              <p className="text-ink-secondary mt-2">{carrusel.subtitle}</p>
            </div>
          </div>

          {carruselItems.length > 0 ? (
            <CarruselNovedades items={carruselItems} />
          ) : (
            <p className="text-center text-ink-secondary py-8">Próximamente</p>
          )}

          <div className="text-center mt-10">
            <Link
              href={carrusel.verTodas.href}
              className="inline-flex items-center gap-2 text-brand-blue font-overpass font-semibold hover:underline"
            >
              {carrusel.verTodas.label} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ BANNER CTA ═══ */}
      <section className="bg-brand-blue relative overflow-hidden">
        <div className="absolute inset-0 pattern-weave opacity-30" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-terra-600 opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="font-serif font-bold text-3xl lg:text-4xl text-white leading-tight">
              {ctaBanner.titleParts[0]} <span className="italic text-terra-300">{ctaBanner.titleParts[1]}</span>
            </h2>
            <p className="text-blue-100 mt-3">{ctaBanner.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              href={ctaBanner.ctaTaller.href}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-blue font-overpass font-semibold rounded-lg hover:bg-pastel-blue transition-colors"
            >
              <IconTaller className="w-4 h-4" />
              {ctaBanner.ctaTaller.label}
            </Link>
            <Link
              href={ctaBanner.ctaMarca.href}
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/40 text-white font-overpass font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              <IconMarca className="w-4 h-4" />
              {ctaBanner.ctaMarca.label}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
