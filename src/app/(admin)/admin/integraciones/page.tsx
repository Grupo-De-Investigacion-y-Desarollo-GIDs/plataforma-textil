'use client'

import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Settings, Globe, Bot, Mail, MessageSquare } from 'lucide-react'

const integraciones = [
  {
    href: '/admin/integraciones/arca',
    icon: Globe,
    nombre: 'ARCA (ex-AFIP)',
    descripcion: 'Verificación automática de CUIT y monotributo',
    estado: 'configurado',
    proximamente: true,
  },
  {
    href: '/admin/integraciones/llm',
    icon: Bot,
    nombre: 'LLM / Chatbot',
    descripcion: 'Asistente virtual con IA para talleres',
    estado: 'pendiente',
    proximamente: true,
  },
  {
    href: '/admin/integraciones/email',
    icon: Mail,
    nombre: 'SendGrid (Email)',
    descripcion: 'Envío de emails transaccionales y masivos',
    estado: 'configurado',
    proximamente: false,
  },
  {
    href: '/admin/integraciones/whatsapp',
    icon: MessageSquare,
    nombre: 'WhatsApp Business',
    descripcion: 'Notificaciones y comunicación por WhatsApp',
    estado: 'pendiente',
    proximamente: true,
  },
]

export default function AdminIntegracionesPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Integraciones API</h1>
      <p className="text-gray-500 text-sm mb-6">Configuración de servicios externos</p>

      <div className="space-y-3">
        {integraciones.map(int => {
          const content = (
            <Card className={`mb-3 ${int.proximamente ? 'opacity-60' : 'hover:shadow-card-hover transition-shadow cursor-pointer'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center shrink-0">
                  <int.icon className="w-6 h-6 text-brand-blue" />
                </div>
                <div className="flex-1">
                  <h2 className="font-overpass font-bold text-brand-blue">{int.nombre}</h2>
                  <p className="text-sm text-gray-500">{int.descripcion}</p>
                </div>
                {int.proximamente ? (
                  <Badge variant="muted">Próximamente</Badge>
                ) : (
                  <>
                    <Badge variant={int.estado === 'configurado' ? 'success' : 'warning'}>
                      {int.estado === 'configurado' ? 'Configurado' : 'Pendiente'}
                    </Badge>
                    <Settings className="w-5 h-5 text-gray-400" />
                  </>
                )}
              </div>
            </Card>
          )

          return int.proximamente ? (
            <div key={int.href}>{content}</div>
          ) : (
            <Link key={int.href} href={int.href}>{content}</Link>
          )
        })}
      </div>
    </div>
  )
}
