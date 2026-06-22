export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import { nivelAEtapa } from '@/compartido/lib/formalizacion'
import { PerfilHeaderTabs } from './perfil-header-tabs'

// Etapa 2.1 — "Mi taller" se reparte en dos sub-tabs (Mi vidriera / Mi gestión
// productiva). La cabecera común y las sub-tabs viven en este layout, sobre
// ambas páginas. Los datos de cabecera (nombre + etapa + ARCA) se cargan acá
// una sola vez; el cromo se oculta solo en editar/completar (lo decide el
// componente cliente vía pathname).
export default async function PerfilLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true,
      nombre: true,
      nivel: true,
      verificadoAfip: true,
      provincia: true,
      partido: true,
      ubicacionDetalle: true,
      sam: true,
      user: { select: { email: true, phone: true } },
    },
  })

  // Sin taller todavía: la página maneja el empty state ("Completar Perfil").
  if (!taller) return <>{children}</>

  return (
    <div className="space-y-6">
      <PerfilHeaderTabs
        nombre={taller.nombre}
        etapa={nivelAEtapa(taller.nivel)}
        verificadoAfip={taller.verificadoAfip}
        provincia={taller.provincia}
        partido={taller.partido}
        ubicacionDetalle={taller.ubicacionDetalle}
        email={taller.user.email}
        phone={taller.user.phone}
        tallerId={taller.id}
        samCompletado={Boolean(taller.sam)}
      />
      {children}
    </div>
  )
}
