import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { modoActivo } from '@/compartido/lib/roles'
import { corregirYVerificarCuit, mensajeErrorArca } from '@/compartido/lib/arca'
import { apiHandler } from '@/compartido/lib/api-errors'

// POST /api/arca/corregir-cuit/[id] — Piezas A y B del circuito CUIT V4.
// Corrige el CUIT de un taller y lo verifica contra ARCA; solo persiste si valida.
//
// Auth DUAL (una sola implementación): lo puede usar el DUEÑO del taller (self-service, Pieza A)
// o un usuario ESTADO/ADMIN (override de COORD, Pieza B). El gating "solo si verificadoAfip=false"
// vive en el helper `corregirYVerificarCuit` (rechaza con YA_VERIFICADO antes de llamar a ARCA).
//
// Contrato de respuesta (el cliente lee `exitosa` y `mensaje`):
//   200 { exitosa:true }                              -> validó, persistió, reactivó
//   200 { exitosa:false, mensaje, codigo }            -> ARCA rechazó (inexistente/inactivo/...)
//   400 { exitosa:false, mensaje }                    -> CUIT mal formado
//   401/403/404 { exitosa:false, mensaje }            -> auth / ownership / taller inexistente
//   409 { exitosa:false, mensaje, codigo }            -> YA_VERIFICADO | CUIT_EN_USO
export const POST = apiHandler(async (req: NextRequest, { params }) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ exitosa: false, mensaje: 'Necesitás iniciar sesión.' }, { status: 401 })
  }

  const { id } = (await params!) as { id: string }

  const taller = await prisma.taller.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (!taller) {
    return NextResponse.json({ exitosa: false, mensaje: 'Taller no encontrado.' }, { status: 404 })
  }

  const esDueno = taller.userId === session.user.id
  const rol = modoActivo(session.user)
  const esEstadoAdmin = rol === 'ESTADO' || rol === 'ADMIN'
  if (!esDueno && !esEstadoAdmin) {
    return NextResponse.json({ exitosa: false, mensaje: 'No tenés permiso sobre este taller.' }, { status: 403 })
  }

  const body = (await req.json().catch(() => ({}))) as { cuit?: unknown }
  const cuitRaw = typeof body.cuit === 'string' ? body.cuit.trim() : ''
  const cuit = cuitRaw.replace(/-/g, '')
  if (!/^\d{11}$/.test(cuit)) {
    return NextResponse.json(
      { exitosa: false, mensaje: 'El CUIT debe tener 11 dígitos (sin guiones).' },
      { status: 400 },
    )
  }

  const resultado = await corregirYVerificarCuit(id, cuit, session.user.id)

  if (resultado.exitosa) {
    return NextResponse.json({ exitosa: true })
  }

  // Códigos de dominio propios -> 409 con mensaje a medida (sin filtrar datos de otro taller).
  if (resultado.error === 'YA_VERIFICADO') {
    return NextResponse.json(
      { exitosa: false, mensaje: 'Tu CUIT ya está verificado.', codigo: 'YA_VERIFICADO' },
      { status: 409 },
    )
  }
  if (resultado.error === 'CUIT_EN_USO') {
    return NextResponse.json(
      { exitosa: false, mensaje: 'Este CUIT ya está registrado en otra cuenta.', codigo: 'CUIT_EN_USO' },
      { status: 409 },
    )
  }
  if (resultado.error === 'TALLER_NO_ENCONTRADO') {
    return NextResponse.json({ exitosa: false, mensaje: 'Taller no encontrado.' }, { status: 404 })
  }

  // Verdicto de ARCA (CUIT_INEXISTENTE / CUIT_INACTIVO / CUIT_SIN_ACTIVIDAD / ARCA_NO_RESPONDE):
  // no es un error del sistema, es el resultado a mostrarle al usuario. 200 con el mensaje ARCA.
  return NextResponse.json({
    exitosa: false,
    mensaje: resultado.error ? mensajeErrorArca(resultado.error) : 'No se pudo verificar el CUIT.',
    codigo: resultado.error,
  })
})
