'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

export interface CarruselItem {
  id: string
  tipo: 'NOVEDAD' | 'CURSO' | 'INDICADOR'
  titulo: string
  subtitulo?: string
  imagen?: string | null
  href: string
}

interface CarruselNovedadesProps {
  items: CarruselItem[]
}

const TIPO_BADGE = {
  NOVEDAD: { label: 'Novedad', className: 'bg-white text-green-700' },
  CURSO: { label: 'Curso', className: 'bg-white text-brand-blue' },
  INDICADOR: { label: 'Indicador', className: 'bg-white text-purple-700' },
}

export function CarruselNovedades({ items }: CarruselNovedadesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState)
    return () => el.removeEventListener('scroll', updateScrollState)
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  if (items.length === 0) return null

  return (
    <div className="relative">
      {/* Flechas */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Anterior"
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Siguiente"
          className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center hover:bg-brand-blue-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mb-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {items.map(item => {
          const badge = TIPO_BADGE[item.tipo]
          return (
            <a
              key={item.id}
              href={item.href}
              className="flex-shrink-0 w-72 snap-start group"
            >
              <div className="bg-white rounded-card overflow-hidden border border-gray-100 hover:shadow-card-hover transition-shadow card-lift">
                <div className="relative aspect-[4/3] bg-pastel-blue">
                  {item.imagen ? (
                    <Image
                      src={item.imagen}
                      alt={item.titulo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-serif font-bold text-2xl text-brand-blue opacity-30">PDT</span>
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 inline-block px-2.5 py-1 rounded-full text-[10px] font-overpass font-bold uppercase tracking-widest shadow-soft ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-serif font-bold text-lg leading-snug group-hover:text-brand-blue transition-colors">
                    {item.titulo}
                  </h3>
                  {item.subtitulo && (
                    <p className="text-xs text-ink-muted mt-2">{item.subtitulo}</p>
                  )}
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
