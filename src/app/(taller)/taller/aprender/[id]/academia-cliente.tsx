'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Check, Lock, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Video {
  id: string
  titulo: string
  youtubeUrl: string
  duracion: string | null
  orden: number
}

interface Pregunta {
  texto: string
  opciones: string[]
  correcta: number
}

interface AcademiaClienteProps {
  coleccionId: string
  videos: Video[]
  evaluacion: { preguntas: Pregunta[]; puntajeMinimo: number } | null
  progresoInicial: number   // videosVistos al cargar
  certificadoExistente: boolean
}

export function AcademiaCliente({
  coleccionId,
  videos,
  evaluacion,
  progresoInicial,
  certificadoExistente,
}: AcademiaClienteProps) {
  const router = useRouter()
  const [videosVistos, setVideosVistos] = useState<Set<number>>(
    () => new Set(Array.from({ length: progresoInicial }, (_, i) => i))
  )
  const [videoActual, setVideoActual] = useState(progresoInicial < videos.length ? progresoInicial : 0)
  const [guardandoProgreso, setGuardandoProgreso] = useState(false)

  // Quiz
  const [mostrarQuiz, setMostrarQuiz] = useState(false)
  const [respuestas, setRespuestas] = useState<number[]>([])
  const [enviandoQuiz, setEnviandoQuiz] = useState(false)
  const [resultadoQuiz, setResultadoQuiz] = useState<{ aprobado: boolean; calificacion: number; codigo?: string } | null>(null)

  const cantidadVistos = videosVistos.size
  const progreso = videos.length > 0 ? Math.round((cantidadVistos / videos.length) * 100) : 0
  const todosVistos = cantidadVistos === videos.length

  async function marcarVisto(indice: number) {
    if (videosVistos.has(indice)) return
    const nuevosVistos = new Set(videosVistos)
    nuevosVistos.add(indice)
    setVideosVistos(nuevosVistos)
    setGuardandoProgreso(true)
    try {
      await fetch(`/api/colecciones/${coleccionId}/progreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videosVistos: nuevosVistos.size, totalVideos: videos.length }),
      })
    } finally {
      setGuardandoProgreso(false)
    }
  }

  function seleccionarVideo(indice: number) {
    setVideoActual(indice)
    // Marcar el anterior como visto al avanzar
    if (indice > 0) marcarVisto(indice - 1)
  }

  function getYoutubeEmbedUrl(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  async function enviarQuiz() {
    if (!evaluacion) return
    setEnviandoQuiz(true)
    try {
      const res = await fetch(`/api/colecciones/${coleccionId}/evaluacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuestas }),
      })
      const data = await res.json()
      setResultadoQuiz(data)
      if (data.aprobado) router.refresh()
    } finally {
      setEnviandoQuiz(false)
    }
  }

  const embedUrl = videos[videoActual] ? getYoutubeEmbedUrl(videos[videoActual].youtubeUrl) : null

  return (
    <div className="space-y-6">
      {/* Player + progreso */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full aspect-video rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="w-12 h-12 mx-auto mb-2 opacity-60" />
                <p className="text-sm opacity-50">URL de video no disponible</p>
              </div>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <p className="font-semibold text-gray-800 text-sm">
              {videos[videoActual]?.titulo}
            </p>
            {!videosVistos.has(videoActual) && (
              <button
                onClick={() => marcarVisto(videoActual)}
                disabled={guardandoProgreso}
                className="text-xs text-brand-blue font-semibold hover:underline disabled:opacity-50"
              >
                {guardandoProgreso ? 'Guardando...' : '✓ Marcar como visto'}
              </button>
            )}
            {videosVistos.has(videoActual) && (
              <span className="text-xs text-green-600 font-semibold">✓ Visto</span>
            )}
          </div>
        </div>

        {/* Progreso */}
        <Card title="Tu progreso">
          <p className="text-2xl font-overpass font-bold text-brand-blue">
            {cantidadVistos}/{videos.length}
          </p>
          <p className="text-xs text-gray-500 mb-2">videos vistos</p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${progreso}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">{progreso}% completado</p>
          {certificadoExistente && (
            <p className="text-xs text-green-600 font-semibold mt-3">✓ Certificado obtenido</p>
          )}
        </Card>
      </div>

      {/* Lista de videos */}
      <div>
        <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Contenido de la colección</h2>
        <Card>
          <div className="divide-y divide-gray-100">
            {videos.map((v, i) => {
              const visto = videosVistos.has(i)
              const activo = i === videoActual
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => seleccionarVideo(i)}
                  className={`w-full flex items-center gap-3 py-3 px-2 text-left hover:bg-gray-50 transition-colors ${activo ? 'bg-blue-50/60' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${visto ? 'bg-green-100 text-green-600' : activo ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {visto ? <Check className="w-3.5 h-3.5" /> : <Play className="w-3 h-3" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{i + 1}. {v.titulo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.duracion && <span className="text-xs text-gray-400">{v.duracion}</span>}
                    {activo && <ChevronRight className="w-3.5 h-3.5 text-brand-blue" />}
                  </div>
                </button>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Evaluación */}
      {evaluacion && !certificadoExistente && (
        <Card title="Evaluación final">
          {!mostrarQuiz && !resultadoQuiz && (
            <>
              <p className="text-sm text-gray-600 mb-3">
                Completá el quiz para obtener tu certificado. Puntaje mínimo: {evaluacion.puntajeMinimo}%
              </p>
              {!todosVistos && (
                <div className="flex items-center gap-2 text-sm text-yellow-600 mb-3">
                  <Lock className="w-4 h-4" /> Debés ver todos los videos antes de rendir
                </div>
              )}
              <Button
                disabled={!todosVistos}
                onClick={() => {
                  setRespuestas(new Array(evaluacion.preguntas.length).fill(-1))
                  setMostrarQuiz(true)
                }}
              >
                Rendir evaluación
              </Button>
            </>
          )}

          {mostrarQuiz && !resultadoQuiz && (
            <div className="space-y-6">
              {evaluacion.preguntas.map((p, i) => (
                <div key={i} className="space-y-2">
                  <p className="font-medium text-gray-800 text-sm">{i + 1}. {p.texto}</p>
                  <div className="space-y-1">
                    {p.opciones.map((op, j) => (
                      <label key={j} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name={`p-${i}`}
                          checked={respuestas[i] === j}
                          onChange={() => {
                            const nuevas = [...respuestas]
                            nuevas[i] = j
                            setRespuestas(nuevas)
                          }}
                          className="accent-brand-blue"
                        />
                        {op}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <Button
                  onClick={enviarQuiz}
                  disabled={enviandoQuiz || respuestas.some(r => r === -1)}
                >
                  {enviandoQuiz ? 'Enviando...' : 'Enviar respuestas'}
                </Button>
                <button
                  onClick={() => setMostrarQuiz(false)}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {resultadoQuiz && (
            <div className={`rounded-lg p-4 ${resultadoQuiz.aprobado ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {resultadoQuiz.aprobado ? (
                <>
                  <p className="font-bold text-green-700 text-lg">¡Aprobaste! {resultadoQuiz.calificacion}%</p>
                  <p className="text-green-600 text-sm mt-1">Tu certificado fue generado.</p>
                  {resultadoQuiz.codigo && (
                    <p className="text-xs text-gray-500 mt-2 font-mono">Código: {resultadoQuiz.codigo}</p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-bold text-red-700">No aprobaste — {resultadoQuiz.calificacion}%</p>
                  <p className="text-red-600 text-sm mt-1">Revisá los videos e intentá de nuevo.</p>
                  <button
                    onClick={() => { setResultadoQuiz(null); setMostrarQuiz(false) }}
                    className="mt-3 text-sm text-brand-blue hover:underline"
                  >
                    Intentar de nuevo
                  </button>
                </>
              )}
            </div>
          )}
        </Card>
      )}

      {certificadoExistente && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
          <p className="text-green-700 font-bold text-lg">Colección completada</p>
          <p className="text-green-600 text-sm mt-1">Ya obtuviste tu certificado para esta colección.</p>
        </div>
      )}
    </div>
  )
}
