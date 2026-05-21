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
import { IconTaller, IconMarca, IconTrazabilidad, IconCapacitacion, IconPedido } from '@/compartido/iconos'
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

  const { hero, impacto, carrusel } = LANDING_COPY

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
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest font-overpass font-bold text-terra-600 mb-2">
              Asi funciona
            </p>
            <h2 className="font-serif font-bold text-4xl lg:text-5xl text-ink-primary mb-4">
              Acompañamos al sector textil en cada paso del recorrido.
            </h2>
          </div>

          <div className="mb-10">
            <Image
              src="/landing/proceso-textil.webp"
              alt="Diagrama del proceso: un taller textil se suma, una marca lo descubre, se contactan y trabajan juntos"
              width={1600}
              height={900}
              className="w-full h-auto"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <h3 className="font-serif font-bold text-lg text-ink-primary mb-2">
                1. Un taller textil se suma
              </h3>
              <p className="text-sm text-ink-secondary">
                Aprende con cursos gratuitos, arma su perfil y muestra lo que sabe hacer.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-serif font-bold text-lg text-ink-primary mb-2">
                2. Una marca lo descubre
              </h3>
              <p className="text-sm text-ink-secondary">
                Lo encuentra en el directorio y conoce sus capacidades, su trayectoria y su recorrido.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-serif font-bold text-lg text-ink-primary mb-2">
                3. Se contactan y trabajan juntos
              </h3>
              <p className="text-sm text-ink-secondary">
                Se conectan de forma directa y empiezan a trabajar juntos.
              </p>
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

        </div>
      </section>

      {/* ═══ DISCLAIMER PILOTO ═══ */}
      <section className="bg-pastel-yellow border-t border-yellow-200/50 py-4">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-xs text-ink-secondary">
            <span className="font-overpass font-bold">Programa piloto en curso.</span>{' '}
            Plataforma Digital Textil es una iniciativa de OIT Argentina y UNTREF
            en fase de piloto, Conurbano Sur, mayo 2026. Los datos y funcionalidades
            pueden evolucionar durante esta etapa.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
