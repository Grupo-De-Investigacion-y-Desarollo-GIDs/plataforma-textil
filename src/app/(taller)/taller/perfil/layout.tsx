export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import { PerfilHeaderTabs } from './perfil-header-tabs'

// Etapa 2.2-A — "Mi taller" tiene 3 sub-tabs (Datos básicos / Mi gestión
// productiva / Mi vidriera). La cabecera + los sub-tabs viven en este layout.
// Modelo Sergio: la cabecera carga SOLO el nombre del taller (la metadata de
// identidad se distribuyó por contexto a las páginas). El cromo se oculta en
// editar/completar (lo decide el componente cliente vía pathname).
export default async function PerfilLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    select: {
      nombre: true,
    },
  })

  // Sin taller todavía: la página maneja el empty state ("Completar Perfil").
  if (!taller) return <>{children}</>

  return (
    <div className="space-y-6">
      {/* Cabecera = solo nombre + pills (modelo Sergio). La metadata de identidad
          (etapa/ARCA/ubicación) se distribuyó por contexto a las páginas. */}
      <PerfilHeaderTabs nombre={taller.nombre} />
      {children}
    </div>
  )
}
