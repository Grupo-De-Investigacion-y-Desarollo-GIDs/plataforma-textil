export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import { MessageSquare } from 'lucide-react'

const tipoBadge: Record<string, 'error' | 'default' | 'warning' | 'muted'> = {
  bug: 'error',
  mejora: 'default',
  falta: 'warning',
  confusion: 'muted',
}

export default async function AdminFeedbackPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const feedbacks = await prisma.logActividad.findMany({
    where: { accion: 'FEEDBACK' },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { timestamp: 'desc' },
    take: 50,
  })

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-brand-blue" />
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue">Feedback del piloto</h1>
          <p className="text-gray-500 text-sm">Ultimos 50 feedbacks de los usuarios</p>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No hay feedbacks todavia.</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Tipo</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Mensaje</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Rol</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Pagina</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Entidad</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Usuario</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedbacks.map(fb => {
                  const d = fb.detalles as Record<string, string> | null
                  return (
                    <tr key={fb.id}>
                      <td className="py-2 px-3">
                        <Badge variant={tipoBadge[d?.tipo ?? ''] ?? 'muted'}>{d?.tipo ?? '—'}</Badge>
                      </td>
                      <td className="py-2 px-3 max-w-xs truncate">{d?.mensaje ?? '—'}</td>
                      <td className="py-2 px-3">{d?.rol ?? '—'}</td>
                      <td className="py-2 px-3 text-xs text-gray-500 max-w-[150px] truncate">{d?.pagina ?? '—'}</td>
                      <td className="py-2 px-3 text-xs">
                        {d?.entidad ? `${d.entidad} ${(d.entidadId ?? '').slice(0, 8)}...` : '—'}
                      </td>
                      <td className="py-2 px-3 text-xs">{fb.user?.name ?? fb.user?.email ?? '—'}</td>
                      <td className="py-2 px-3 text-xs text-gray-400">{fb.timestamp.toLocaleDateString('es-AR')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
