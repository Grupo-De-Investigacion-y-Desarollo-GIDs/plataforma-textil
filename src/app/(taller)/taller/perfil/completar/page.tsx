'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Factory, Users, LayoutGrid, Ruler, Clock, TrendingUp, Settings, Trophy, Shirt } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const STEPS = [
  { key: 'bienvenida', label: 'Inicio', icon: Factory },
  { key: 'maquinaria', label: 'Máq.', icon: Settings },
  { key: 'equipo', label: 'Equipo', icon: Users },
  { key: 'experiencia', label: 'Exp.', icon: TrendingUp },
  { key: 'organizacion', label: 'Org.', icon: LayoutGrid },
  { key: 'espacio', label: 'Espacio', icon: Ruler },
  { key: 'sam', label: 'SAM', icon: Clock },
  { key: 'sam-quiz', label: 'Quiz', icon: Check },
  { key: 'eficiencia', label: 'Efic.', icon: TrendingUp },
  { key: 'resultado', label: 'Result.', icon: Trophy },
  { key: 'gestion', label: 'Gestión', icon: Settings },
  { key: 'procesos', label: 'Procesos', icon: Settings },
  { key: 'prendas', label: 'Prendas', icon: Shirt },
  { key: 'resumen', label: 'Resumen', icon: Trophy },
]

const MAQUINAS = [
  { nombre: 'Recta industrial', icono: '🧵' },
  { nombre: 'Overlock 5 hilos', icono: '🔄' },
  { nombre: 'Fileteadora', icono: '⚡' },
  { nombre: 'Collareta', icono: '🎀' },
  { nombre: 'Cortadora vertical', icono: '✂️' },
  { nombre: 'Plancha industrial', icono: '🔥' },
]

const ROLES_EQUIPO = ['Cortador/a', 'Costurero/a', 'Terminación/Planchado', 'Control calidad', 'Encargado/a', 'Logística']
const AREAS = ['Área de corte', 'Área de confección', 'Área de terminación/planchado', 'Almacén de insumos', 'Área de control de calidad']

interface ProcesoProductivo {
  id: string
  nombre: string
  descripcion: string | null
}

interface TipoPrenda {
  id: string
  nombre: string
}

export default function WizardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [tallerId, setTallerId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Catálogos
  const [catalogoProcesos, setCatalogoProcesos] = useState<ProcesoProductivo[]>([])
  const [catalogoPrendas, setCatalogoPrendas] = useState<TipoPrenda[]>([])

  // State for all wizard data
  const [maquinaria, setMaquinaria] = useState<Record<string, number>>({})
  const [tamanoEquipo, setTamanoEquipo] = useState('3-5')
  const [roles, setRoles] = useState<Record<string, number>>({})
  const [experiencia, setExperiencia] = useState('3-5')
  const [polivalencia, setPolivalencia] = useState('parcial')
  const [antiguedad, setAntiguedad] = useState('4')
  const [organizacion, setOrganizacion] = useState('modular')
  const [metrosCuadrados, setMetrosCuadrados] = useState('80')
  const [areas, setAreas] = useState<string[]>(['Área de corte', 'Área de confección'])
  const [prendaPrincipal, setPrendaPrincipal] = useState('Jean')
  const [sam, setSam] = useState('28')
  const [samQuizResp, setSamQuizResp] = useState('')
  const [horasDia, setHorasDia] = useState('8')
  const [cambiosModelo, setCambiosModelo] = useState('2-3')
  const [paradas, setParadas] = useState('a-veces')
  const [validacionCapacidad, setValidacionCapacidad] = useState('')
  const [horario, setHorario] = useState('extendido')
  const [horasExtra, setHorasExtra] = useState('a-veces')
  const [registro, setRegistro] = useState('excel')
  const [escalabilidad, setEscalabilidad] = useState('contratar')
  const [procesosSeleccionados, setProcesosSeleccionados] = useState<string[]>([])
  const [prendasSeleccionadas, setPrendasSeleccionadas] = useState<string[]>([])

  // Load catálogos y datos existentes
  useEffect(() => {
    fetch('/api/catalogos')
      .then(r => r.ok ? r.json() : { procesos: [], prendas: [] })
      .then(data => {
        setCatalogoProcesos(data.procesos ?? [])
        setCatalogoPrendas(data.prendas ?? [])
      })
      .catch(() => {})

    fetch('/api/talleres/me')
      .then(r => r.ok ? r.json() : null)
      .then(t => {
        if (!t) return
        setTallerId(t.id)
        if (t.prendaPrincipal) setPrendaPrincipal(t.prendaPrincipal)
        if (t.organizacion) setOrganizacion(t.organizacion)
        if (t.metrosCuadrados) setMetrosCuadrados(String(t.metrosCuadrados))
        if (t.areas?.length) setAreas(t.areas)
        if (t.sam) setSam(String(t.sam))
        if (t.experienciaPromedio) setExperiencia(t.experienciaPromedio)
        if (t.polivalencia) setPolivalencia(t.polivalencia)
        if (t.horario) setHorario(t.horario)
        if (t.registroProduccion) setRegistro(t.registroProduccion)
        if (t.escalabilidad) setEscalabilidad(t.escalabilidad)
        if (t.paradasFrecuencia) setParadas(t.paradasFrecuencia)
        if (t.trabajadoresRegistrados) setTamanoEquipo(
          t.trabajadoresRegistrados <= 2 ? '1-2' : t.trabajadoresRegistrados <= 5 ? '3-5' : t.trabajadoresRegistrados <= 10 ? '6-10' : t.trabajadoresRegistrados <= 20 ? '11-20' : '+20'
        )
        if (t.maquinaria?.length) {
          const maq: Record<string, number> = {}
          for (const m of t.maquinaria) maq[m.nombre] = m.cantidad
          setMaquinaria(maq)
        }
        if (t.procesos?.length) {
          setProcesosSeleccionados(t.procesos.map((tp: { procesoId: string }) => tp.procesoId))
        }
        if (t.prendas?.length) {
          setPrendasSeleccionadas(t.prendas.map((tp: { prendaId: string }) => tp.prendaId))
        }
      })
      .catch(() => {})
  }, [])

  // Calculate capacity and scores (used in handleSave and render)
  const numMaquinas = Object.values(maquinaria).reduce((a, b) => a + b, 0) || 6
  const eficiencia = paradas === 'nunca' ? 0.6 : paradas === 'a-veces' ? 0.52 : 0.4
  const samNum = parseInt(sam) || 28
  const horasNum = parseInt(horasDia) || 8
  const capacidadDiaria = Math.round(((horasNum * 60) / samNum) * eficiencia * numMaquinas)
  const capacidadMensual = capacidadDiaria * 22

  const scoreEquipo = experiencia === '5+' ? 90 : experiencia === '3-5' ? 75 : experiencia === '1-3' ? 50 : 30
  const scoreOrg = organizacion === 'linea' ? 80 : organizacion === 'modular' ? 70 : 55
  const scoreMaq = Math.min(Object.values(maquinaria).reduce((a, b) => a + b, 0) * 12, 100)
  const scoreGestion = registro === 'software' ? 90 : registro === 'excel' ? 65 : registro === 'papel' ? 40 : 20
  const scoreEscalabilidad = escalabilidad === 'turno' || escalabilidad === 'tercerizar' ? 85 : escalabilidad === 'contratar' ? 75 : escalabilidad === 'horas-extra' ? 55 : 30
  const scoreGeneral = Math.round((scoreEquipo + scoreOrg + scoreMaq + scoreGestion + scoreEscalabilidad) / 5)

  const buildPayload = useCallback(() => {
    const numMaq = Object.values(maquinaria).reduce((a, b) => a + b, 0)
    const totalRoles = Object.values(roles).reduce((a, b) => a + b, 0)
    const samVal = parseInt(sam) || 28
    const efic = paradas === 'nunca' ? 0.6 : paradas === 'a-veces' ? 0.52 : 0.4
    const capMensual = Math.round(((8 * 60) / samVal) * efic * (numMaq || 6)) * 22
    return {
      sam: parseInt(sam) || undefined,
      prendaPrincipal: prendaPrincipal || undefined,
      organizacion: organizacion || undefined,
      metrosCuadrados: parseInt(metrosCuadrados) || undefined,
      areas,
      experienciaPromedio: experiencia || undefined,
      polivalencia: polivalencia || undefined,
      horario: horario || undefined,
      registroProduccion: registro || undefined,
      escalabilidad: escalabilidad || undefined,
      paradasFrecuencia: paradas || undefined,
      capacidadMensual: capMensual || undefined,
      trabajadoresRegistrados: totalRoles || (tamanoEquipo === '1-2' ? 2 : tamanoEquipo === '3-5' ? 4 : tamanoEquipo === '6-10' ? 8 : tamanoEquipo === '11-20' ? 15 : 25),
      maquinaria: Object.entries(maquinaria)
        .filter(([, c]) => c > 0)
        .map(([nombre, cantidad]) => ({ nombre, cantidad, tipo: numMaq > 0 ? 'confeccion' : undefined })),
      procesosIds: procesosSeleccionados,
      prendasIds: prendasSeleccionadas,
    }
  }, [maquinaria, sam, prendaPrincipal, organizacion, metrosCuadrados, areas, experiencia, polivalencia, horario, registro, escalabilidad, paradas, roles, tamanoEquipo, procesosSeleccionados, prendasSeleccionadas])

  async function handleSave(redirectTo: string) {
    if (!tallerId) {
      router.push(redirectTo)
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/talleres/${tallerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildPayload(), puntaje: scoreGeneral }),
      })
      if (!res.ok) throw new Error('Error del servidor')
      router.push(redirectTo)
    } catch {
      alert('Error al guardar. Intentá de nuevo.')
      setSaving(false)
    }
  }

  const progreso = Math.round((step / (STEPS.length - 1)) * 100)

  function next() { if (step < STEPS.length - 1) setStep(step + 1) }
  function prev() { if (step > 0) setStep(step - 1) }
  function toggleArea(a: string) { setAreas(areas.includes(a) ? areas.filter(x => x !== a) : [...areas, a]) }
  function toggleProceso(id: string) { setProcesosSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]) }
  function togglePrenda(id: string) { setPrendasSeleccionadas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]) }

  function RadioOption({ value, current, onChange, label, desc }: { value: string; current: string; onChange: (v: string) => void; label: string; desc?: string }) {
    return (
      <label className={`block p-3 rounded-lg border cursor-pointer transition-colors ${current === value ? 'border-brand-blue bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
        <div className="flex items-center gap-2">
          <input type="radio" checked={current === value} onChange={() => onChange(value)} className="accent-[var(--color-brand-blue)]" />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        {desc && <p className="text-xs text-gray-500 ml-6">{desc}</p>}
      </label>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Progress bar */}
      <div className="mb-2 flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${progreso}%` }} />
        </div>
        <span className="text-xs text-gray-500">{progreso}%</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        {step > 0 && step < STEPS.length - 1 ? `Módulo ${Math.ceil(step / 2)} de 7: ${STEPS[step].label}` : ''}
      </p>

      {/* Step indicators */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button key={s.key} type="button" onClick={() => i <= step && setStep(i)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded text-xs shrink-0 transition-colors ${i === step ? 'text-brand-blue font-bold' : i < step ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i < step ? 'bg-green-100 text-green-600' : i === step ? 'bg-brand-blue text-white' : 'bg-gray-100'}`}>
              {i < step ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            <span className="hidden sm:block">{s.label}</span>
          </button>
        ))}
      </div>

      {/* STEP 0: Bienvenida */}
      {step === 0 && (
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-brand-blue/10 flex items-center justify-center mx-auto mb-4">
            <Factory className="w-10 h-10 text-brand-blue" />
          </div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-2">Perfil Productivo</h1>
          <p className="text-gray-600 mb-6">Vamos a completar tu perfil productivo</p>
          <Card className="text-left mb-6">
            <p className="text-sm mb-2"><span className="font-semibold">Duración:</span> ~15 minutos</p>
            <p className="text-sm font-semibold mb-1">Vas a aprender:</p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
              <li>Cómo calcular tu capacidad REAL</li>
              <li>Qué es el SAM y por qué importa</li>
              <li>Cómo mejorar tu eficiencia</li>
            </ul>
            <p className="text-sm font-semibold mt-3 mb-1">Al terminar vas a tener:</p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
              <li>Tu capacidad calculada con fórmula de industria</li>
              <li>Un score que te compara con otros talleres</li>
              <li>Recomendaciones personalizadas</li>
            </ul>
          </Card>
          <Card className="bg-blue-50/50 text-sm text-gray-600 mb-6">
            Podés pausar y retomar después. Al terminar el wizard, tu perfil se guarda en la plataforma.
          </Card>
          <Button onClick={next} size="lg">Empezar</Button>
          <button type="button" onClick={() => handleSave('/taller')} disabled={saving} className="block mx-auto mt-3 text-sm text-gray-500 hover:underline">
            {saving ? 'Guardando...' : 'Completar más tarde'}
          </button>
        </div>
      )}

      {/* STEP 1: Maquinaria */}
      {step === 1 && (
        <div>
          <h2 className="font-overpass font-bold text-xl text-brand-blue mb-2">¿Qué máquinas de confección tenés?</h2>
          <p className="text-sm text-gray-500 mb-4">Hacé click en cada tipo y poné la cantidad:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {MAQUINAS.map(m => (
              <Card key={m.nombre} className={`text-center p-3 cursor-pointer transition-all ${(maquinaria[m.nombre] || 0) > 0 ? 'ring-2 ring-brand-blue' : ''}`}>
                <span className="text-2xl">{m.icono}</span>
                <p className="text-xs font-semibold mt-1">{m.nombre}</p>
                <input type="number" min="0" value={maquinaria[m.nombre] || 0}
                  onChange={e => setMaquinaria({ ...maquinaria, [m.nombre]: parseInt(e.target.value) || 0 })}
                  className="w-16 text-center border rounded mt-2 py-1 text-sm" />
              </Card>
            ))}
          </div>
          <Card className="bg-blue-50/50 text-sm">
            <p className="font-semibold">¿Por qué importa esto?</p>
            <p className="text-gray-600">Cada máquina contribuye a tu capacidad productiva. Con esta información calculamos tu potencial REAL.</p>
            <p className="text-gray-500 mt-1">El 70% de talleres tiene entre 3-8 máquinas.</p>
          </Card>
        </div>
      )}

      {/* STEP 2: Equipo */}
      {step === 2 && (
        <div>
          <h2 className="font-overpass font-bold text-xl text-brand-blue mb-4">Contanos sobre tu equipo de trabajo</h2>
          <p className="text-sm font-semibold mb-2">¿Cuántas personas trabajan en producción?</p>
          <div className="flex gap-2 mb-4">
            {['1-2', '3-5', '6-10', '11-20', '+20'].map(v => (
              <button key={v} type="button" onClick={() => setTamanoEquipo(v)}
                className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${tamanoEquipo === v ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white border-gray-300 hover:border-brand-blue'}`}>
                {v}
              </button>
            ))}
          </div>
          <p className="text-sm font-semibold mb-2">¿Qué roles tenés en tu equipo?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ROLES_EQUIPO.map(r => (
              <Card key={r} className="p-3">
                <p className="text-xs font-semibold mb-1">{r}</p>
                <input type="number" min="0" value={roles[r] || 0}
                  onChange={e => setRoles({ ...roles, [r]: parseInt(e.target.value) || 0 })}
                  className="w-16 border rounded py-1 text-center text-sm" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Experiencia */}
      {step === 3 && (
        <div>
          <h2 className="font-overpass font-bold text-xl text-brand-blue mb-4">¿Cuánta experiencia tiene tu equipo?</h2>
          <Card className="bg-blue-50/50 text-sm mb-4">
            La experiencia impacta directamente en velocidad y calidad. Un equipo experimentado puede producir hasta 30% más que uno nuevo.
          </Card>
          <p className="text-sm font-semibold mb-2">Experiencia promedio del equipo:</p>
          <div className="space-y-2 mb-4">
            {[{ v: '<1', l: 'Menos de 1 año (Novato)' }, { v: '1-3', l: '1-3 años (Junior)' }, { v: '3-5', l: '3-5 años (Intermedio)' }, { v: '5+', l: 'Más de 5 años (Experto)' }].map(o => (
              <RadioOption key={o.v} value={o.v} current={experiencia} onChange={setExperiencia} label={o.l} />
            ))}
          </div>
          <p className="text-sm font-semibold mb-2">¿Tu equipo puede rotar entre diferentes tareas?</p>
          <div className="space-y-2 mb-4">
            <RadioOption value="nada" current={polivalencia} onChange={setPolivalencia} label="No, cada uno hace SOLO su tarea" desc="Especialización total" />
            <RadioOption value="parcial" current={polivalencia} onChange={setPolivalencia} label="Algunos pueden hacer varias tareas" desc="Polivalencia parcial" />
            <RadioOption value="total" current={polivalencia} onChange={setPolivalencia} label="Sí, todos pueden hacer de todo" desc="Polivalencia total" />
          </div>
          <Input label="¿Cuánto tiempo lleva tu empleado más antiguo? (años)" type="number" value={antiguedad} onChange={e => setAntiguedad(e.target.value)} />
        </div>
      )}

      {/* STEP 4: Organización */}
      {step === 4 && (
        <div>
          <h2 className="font-overpass font-bold text-xl text-brand-blue mb-4">¿Cómo organizan el trabajo?</h2>
          <Card className="bg-blue-50/50 text-sm mb-4">
            <p className="font-semibold mb-1">Tipos de organización productiva:</p>
            <p><strong>En línea:</strong> Cada persona hace UNA operación. Más rápido para grandes volúmenes.</p>
            <p><strong>Modular:</strong> Grupos pequeños hacen varias operaciones. Balance velocidad/flexibilidad.</p>
            <p><strong>Prenda completa:</strong> Cada persona hace toda la prenda. Mayor control de calidad.</p>
          </Card>
          <div className="space-y-2">
            <RadioOption value="linea" current={organizacion} onChange={setOrganizacion} label="En línea" desc="Cada uno hace una operación específica" />
            <RadioOption value="modular" current={organizacion} onChange={setOrganizacion} label="Modular" desc="Grupos hacen varias operaciones juntas" />
            <RadioOption value="completa" current={organizacion} onChange={setOrganizacion} label="Prenda completa" desc="Cada persona hace la prenda de principio a fin" />
          </div>
        </div>
      )}

      {/* STEP 5: Espacio */}
      {step === 5 && (
        <div>
          <h2 className="font-overpass font-bold text-xl text-brand-blue mb-4">¿Cómo es tu espacio de trabajo?</h2>
          <Input label="Metros cuadrados del área de producción" type="number" value={metrosCuadrados} onChange={e => setMetrosCuadrados(e.target.value)} />
          <Card className="bg-blue-50/50 text-sm my-4">
            {parseInt(metrosCuadrados) > 0 && <p>{metrosCuadrados} m² con {tamanoEquipo} personas. Recomendado: 10-15 m² por persona (mínimo).</p>}
          </Card>
          <p className="text-sm font-semibold mb-2">¿Tenés áreas separadas para cada proceso?</p>
          <div className="space-y-2">
            {AREAS.map(a => (
              <label key={a} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={areas.includes(a)} onChange={() => toggleArea(a)} className="accent-[var(--color-brand-blue)]" />
                <span className="text-sm">{a}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* STEP 6: SAM */}
      {step === 6 && (
        <div>
          <h2 className="font-overpass font-bold text-xl text-brand-blue mb-4">¿Cuánto tardás en hacer una prenda?</h2>
          <Card className="bg-blue-50/50 text-sm mb-4">
            <p className="font-semibold">¿Qué es el SAM?</p>
            <p className="mb-2">SAM = &quot;Standard Allowed Minutes&quot;. Es el tiempo estándar para confeccionar una prenda.</p>
            <p className="font-semibold mt-2">Ejemplos típicos en Argentina:</p>
            <ul className="mt-1 space-y-0.5">
              <li>Remera básica: 10-15 min</li>
              <li>Jean con bolsillos: 25-35 min</li>
              <li>Camisa: 20-30 min</li>
              <li>Campera: 40-60 min</li>
            </ul>
          </Card>
          <Input label="¿Qué prenda hacés más?" value={prendaPrincipal} onChange={e => setPrendaPrincipal(e.target.value)} />
          <div className="mt-3">
            <Input label="¿Cuántos minutos tardás en promedio? (SAM)" type="number" value={sam} onChange={e => setSam(e.target.value)} />
          </div>
          {parseInt(sam) > 0 && (
            <Card className="bg-green-50 text-sm mt-3">
              Tu tiempo ({sam} min) para {prendaPrincipal} está en el rango esperado.
            </Card>
          )}
        </div>
      )}

      {/* STEP 7: SAM Quiz */}
      {step === 7 && (
        <div>
          <h2 className="font-overpass font-bold text-xl text-brand-blue mb-4">Verificamos que entendiste el concepto</h2>
          <p className="text-sm font-semibold mb-3">¿Qué significa SAM?</p>
          <div className="space-y-2 mb-4">
            <RadioOption value="salario" current={samQuizResp} onChange={setSamQuizResp} label="Salario Anual Mínimo" />
            <RadioOption value="correcto" current={samQuizResp} onChange={setSamQuizResp} label="Minutos estándar para confeccionar una prenda" />
            <RadioOption value="sistema" current={samQuizResp} onChange={setSamQuizResp} label="Sistema de Acceso a Maquinaria" />
          </div>
          {samQuizResp === 'correcto' && (
            <Card className="bg-green-50 text-sm">
              <p className="font-semibold text-green-700">¡Correcto!</p>
              <p>SAM (Standard Allowed Minutes) es el tiempo estándar para confeccionar una prenda.</p>
              <p className="mt-1 font-mono text-xs">Capacidad = Minutos disponibles ÷ SAM × Eficiencia</p>
            </Card>
          )}
          {samQuizResp && samQuizResp !== 'correcto' && (
            <Card className="bg-red-50 text-sm">
              <p className="font-semibold text-red-700">No es correcto. SAM significa &quot;Standard Allowed Minutes&quot;.</p>
            </Card>
          )}
        </div>
      )}

      {/* STEP 8: Eficiencia */}
      {step === 8 && (
        <div>
          <h2 className="font-overpass font-bold text-xl text-brand-blue mb-4">Calculemos tu eficiencia real</h2>
          <Card className="bg-blue-50/50 text-sm mb-4">
            Tener 10 máquinas NO significa producir 10x. La eficiencia real en Argentina promedia 50%.
          </Card>
          <Input label="¿Cuántas horas por día trabaja tu taller?" type="number" value={horasDia} onChange={e => setHorasDia(e.target.value)} />
          <div className="mt-3">
            <Input label="Cambios de modelo/color por día" value={cambiosModelo} onChange={e => setCambiosModelo(e.target.value)} placeholder="2-3" />
          </div>
          <p className="text-sm font-semibold mt-3 mb-2">¿Tenés paradas frecuentes?</p>
          <div className="space-y-2">
            <RadioOption value="nunca" current={paradas} onChange={setParadas} label="Casi nunca" desc="Menos de 30 min/día" />
            <RadioOption value="a-veces" current={paradas} onChange={setParadas} label="A veces" desc="30-60 min/día" />
            <RadioOption value="frecuente" current={paradas} onChange={setParadas} label="Frecuentemente" desc="Más de 1 hora/día" />
          </div>
        </div>
      )}

      {/* STEP 9: Resultado Capacidad */}
      {step === 9 && (
        <div className="text-center">
          <h2 className="font-overpass font-bold text-xl text-brand-blue mb-4">Tu Capacidad Calculada</h2>
          <Card className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Basado en tus datos:</p>
            <div className="text-sm text-gray-600 space-y-0.5 mb-4">
              <p>{numMaquinas} máquinas • {tamanoEquipo} operarios • SAM: {sam} min • {horasDia}h/día</p>
            </div>
            <p className="text-xs font-mono text-gray-500 mb-4">({horasNum * 60} min ÷ {samNum} min) × {Math.round(eficiencia * 100)}% × {numMaquinas} máq</p>
            <div className="bg-brand-blue/5 rounded-xl p-6">
              <p className="font-overpass font-bold text-4xl text-brand-blue">{capacidadDiaria} prendas/día</p>
              <p className="font-overpass font-bold text-xl text-gray-600 mt-1">≈ {capacidadMensual.toLocaleString()} prendas/mes</p>
              <p className="text-sm text-gray-500 mt-2">Eficiencia estimada: {Math.round(eficiencia * 100)}%</p>
            </div>
          </Card>
          <Card className="bg-blue-50/50 text-sm text-left mb-4">
            <p className="font-semibold">¿Cómo mejorar?</p>
            <p>Si mejorás tu eficiencia de {Math.round(eficiencia * 100)}% a {Math.round(eficiencia * 100) + 8}%: +{Math.round(capacidadDiaria * 0.15)} prendas/día</p>
          </Card>
          <p className="text-sm font-semibold mb-2">¿Este número te parece correcto?</p>
          <div className="space-y-2 text-left">
            <RadioOption value="correcto" current={validacionCapacidad} onChange={setValidacionCapacidad} label="Sí, es bastante preciso" />
            <RadioOption value="mas" current={validacionCapacidad} onChange={setValidacionCapacidad} label="Produzco un poco más" />
            <RadioOption value="menos" current={validacionCapacidad} onChange={setValidacionCapacidad} label="Produzco un poco menos" />
          </div>
        </div>
      )}

      {/* STEP 10: Gestión */}
      {step === 10 && (
        <div>
          <h2 className="font-overpass font-bold text-xl text-brand-blue mb-4">Gestión y Escalabilidad</h2>
          <p className="text-sm font-semibold mb-2">¿Cómo es tu horario de trabajo?</p>
          <div className="space-y-2 mb-4">
            <RadioOption value="unico" current={horario} onChange={setHorario} label="Turno único (8 horas fijas)" />
            <RadioOption value="extendido" current={horario} onChange={setHorario} label="Turno extendido (10-12h cuando hay demanda)" />
            <RadioOption value="doble" current={horario} onChange={setHorario} label="Doble turno" />
          </div>
          <p className="text-sm font-semibold mb-2">¿Llevan registro de producción diaria?</p>
          <div className="space-y-2 mb-4">
            <RadioOption value="no" current={registro} onChange={setRegistro} label="No llevamos registro" />
            <RadioOption value="papel" current={registro} onChange={setRegistro} label="Anotamos en papel/cuaderno" />
            <RadioOption value="excel" current={registro} onChange={setRegistro} label="Usamos planilla Excel o similar" />
            <RadioOption value="software" current={registro} onChange={setRegistro} label="Tenemos sistema/software" />
          </div>
          <p className="text-sm font-semibold mb-2">Si te piden el DOBLE de producción, ¿cómo responderías?</p>
          <div className="space-y-2">
            <RadioOption value="no-puedo" current={escalabilidad} onChange={setEscalabilidad} label="No podría, estoy al máximo" />
            <RadioOption value="horas-extra" current={escalabilidad} onChange={setEscalabilidad} label="Con horas extras del equipo actual" />
            <RadioOption value="contratar" current={escalabilidad} onChange={setEscalabilidad} label="Contratar más gente temporalmente" />
            <RadioOption value="turno" current={escalabilidad} onChange={setEscalabilidad} label="Agregar un turno adicional" />
            <RadioOption value="tercerizar" current={escalabilidad} onChange={setEscalabilidad} label="Tercerizar a otro taller" />
          </div>
        </div>
      )}

      {/* STEP 11: Procesos productivos */}
      {step === 11 && (
        <div>
          <h2 className="font-overpass font-bold text-xl text-brand-blue mb-2">¿Qué procesos realizás?</h2>
          <p className="text-sm text-gray-500 mb-4">Seleccioná todos los procesos que tu taller puede ofrecer a las marcas.</p>
          {catalogoProcesos.length === 0 ? (
            <Card className="text-center py-8 text-gray-500 text-sm">Cargando procesos...</Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {catalogoProcesos.map(p => {
                const seleccionado = procesosSeleccionados.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProceso(p.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${seleccionado ? 'border-brand-blue bg-blue-50/60 ring-1 ring-brand-blue' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm">{p.nombre}</p>
                      {seleccionado && <Check className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />}
                    </div>
                    {p.descripcion && <p className="text-xs text-gray-500 mt-1">{p.descripcion}</p>}
                  </button>
                )
              })}
            </div>
          )}
          {procesosSeleccionados.length > 0 && (
            <p className="text-xs text-brand-blue font-semibold mt-3">{procesosSeleccionados.length} proceso{procesosSeleccionados.length !== 1 ? 's' : ''} seleccionado{procesosSeleccionados.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      )}

      {/* STEP 12: Tipos de prenda */}
      {step === 12 && (
        <div>
          <h2 className="font-overpass font-bold text-xl text-brand-blue mb-2">¿Qué prendas fabricás?</h2>
          <p className="text-sm text-gray-500 mb-4">Seleccioná los tipos de prenda en los que tu taller está especializado.</p>
          {catalogoPrendas.length === 0 ? (
            <Card className="text-center py-8 text-gray-500 text-sm">Cargando prendas...</Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {catalogoPrendas.map(pr => {
                const seleccionada = prendasSeleccionadas.includes(pr.id)
                return (
                  <button
                    key={pr.id}
                    type="button"
                    onClick={() => togglePrenda(pr.id)}
                    className={`p-4 rounded-xl border text-center transition-all ${seleccionada ? 'border-brand-blue bg-blue-50/60 ring-1 ring-brand-blue' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Shirt className={`w-6 h-6 mx-auto mb-1 ${seleccionada ? 'text-brand-blue' : 'text-gray-400'}`} />
                    <p className="font-semibold text-sm">{pr.nombre}</p>
                    {seleccionada && <Check className="w-3.5 h-3.5 text-brand-blue mx-auto mt-1" />}
                  </button>
                )
              })}
            </div>
          )}
          {prendasSeleccionadas.length > 0 && (
            <p className="text-xs text-brand-blue font-semibold mt-3">{prendasSeleccionadas.length} prenda{prendasSeleccionadas.length !== 1 ? 's' : ''} seleccionada{prendasSeleccionadas.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      )}

      {/* STEP 13: Resumen */}
      {step === 13 && (
        <div className="text-center">
          <h2 className="font-overpass font-bold text-2xl text-brand-blue mb-4">¡Perfil Completado!</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <div className="text-center">
                <p className="font-overpass font-bold text-5xl text-brand-blue">{scoreGeneral}%</p>
                <p className="text-sm text-gray-500 mt-1">Score General</p>
                <p className="text-xs text-gray-400">Top {100 - scoreGeneral}% de talleres</p>
              </div>
            </Card>
            <Card>
              <p className="font-semibold text-sm mb-2">Capacidad</p>
              <p className="text-sm">Diaria: {capacidadDiaria} prendas</p>
              <p className="text-sm">Mensual: {capacidadMensual.toLocaleString()} prendas</p>
              <p className="text-sm mt-2 font-semibold">Especialidad</p>
              <p className="text-sm">{prendaPrincipal} — Confección {organizacion}</p>
            </Card>
          </div>

          {procesosSeleccionados.length > 0 && (
            <Card title="Procesos seleccionados" className="mb-4 text-left">
              <div className="flex flex-wrap gap-2">
                {catalogoProcesos.filter(p => procesosSeleccionados.includes(p.id)).map(p => (
                  <Badge key={p.id} variant="outline">{p.nombre}</Badge>
                ))}
              </div>
            </Card>
          )}

          {prendasSeleccionadas.length > 0 && (
            <Card title="Prendas seleccionadas" className="mb-4 text-left">
              <div className="flex flex-wrap gap-2">
                {catalogoPrendas.filter(pr => prendasSeleccionadas.includes(pr.id)).map(pr => (
                  <Badge key={pr.id} variant="default">{pr.nombre}</Badge>
                ))}
              </div>
            </Card>
          )}

          <Card title="Indicadores de Madurez" className="mb-6 text-left">
            {[{ label: 'Equipo', pct: scoreEquipo }, { label: 'Organización', pct: scoreOrg }, { label: 'Maquinaria', pct: scoreMaq }, { label: 'Gestión', pct: scoreGestion }, { label: 'Escalabilidad', pct: scoreEscalabilidad }].map(i => (
              <div key={i.label} className="flex items-center gap-3 mb-2">
                <span className="w-24 text-xs font-semibold">{i.label}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-brand-blue rounded-full" style={{ width: `${i.pct}%` }} /></div>
                <span className="w-10 text-xs text-gray-500">{i.pct}%</span>
              </div>
            ))}
          </Card>

          <Card title="Badges Desbloqueados" className="mb-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {['Perfil técnico', 'Equipo identificado', 'Organización mapeada', 'SAM calculado', 'Capacidad calculada', 'Gestión evaluada'].map(b => (
                <Badge key={b} variant="success" className="text-xs">{b}</Badge>
              ))}
            </div>
          </Card>

          <div className="flex gap-3 justify-center">
            <Button onClick={() => handleSave('/taller/perfil')} variant="secondary" disabled={saving}>
              {saving ? 'Guardando...' : 'Ver mi perfil'}
            </Button>
            <Button onClick={() => handleSave('/taller/aprender')} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar e ir a Academia'}
            </Button>
          </div>
        </div>
      )}

      {/* Navigation */}
      {step > 0 && step < 13 && (
        <div className="flex justify-between mt-6">
          <Button variant="secondary" onClick={prev} icon={<ArrowLeft className="w-4 h-4" />}>Atrás</Button>
          <Button onClick={next} icon={<ArrowRight className="w-4 h-4" />}>Siguiente</Button>
        </div>
      )}
    </div>
  )
}
