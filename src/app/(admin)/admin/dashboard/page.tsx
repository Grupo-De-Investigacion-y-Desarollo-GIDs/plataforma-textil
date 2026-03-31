'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { BookOpen, Users, Award, Activity, Settings, BarChart3, FileText, Bell } from 'lucide-react'

interface Stats {
  talleres: number
  marcas: number
  colecciones: number
  certificados: number
}

interface LogEntry {
  id: string
  accion: string
  timestamp: string
  user?: { name: string | null } | null
}

const menuItems = [
  { href: '/admin/colecciones', icon: BookOpen, label: 'Colecciones' },
  { href: '/admin/evaluaciones', icon: FileText, label: 'Evaluaciones' },
  { href: '/admin/certificados', icon: Award, label: 'Certificados' },
  { href: '/admin/usuarios', icon: Users, label: 'Usuarios' },
  { href: '/admin/talleres', icon: Activity, label: 'Talleres' },
  { href: '/admin/marcas', icon: Activity, label: 'Marcas' },
  { href: '/admin/pedidos', icon: FileText, label: 'Pedidos' },
  { href: '/admin/auditorias', icon: FileText, label: 'Auditorías' },
  { href: '/admin/reportes', icon: BarChart3, label: 'Reportes' },
  { href: '/admin/notificaciones', icon: Bell, label: 'Notificaciones' },
  { href: '/admin/logs', icon: Activity, label: 'Logs' },
  { href: '/admin/roles', icon: Users, label: 'Roles' },
  { href: '/admin/faq', icon: FileText, label: 'FAQ' },
  { href: '/admin/procesos', icon: Settings, label: 'Procesos' },
  { href: '/admin/documentos', icon: FileText, label: 'Documentos' },
  { href: '/admin/configuracion', icon: Settings, label: 'Configuración' },
  { href: '/admin/integraciones', icon: Settings, label: 'Integraciones' },
  { href: '/admin/database', icon: Settings, label: 'Base de Datos' },
]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {})
    fetch('/api/admin/logs?limit=5').then(r => r.json()).then((d: { logs?: LogEntry[] }) => setLogs(d.logs || [])).catch(() => {})
  }, [])

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Panel de Administración</h1>
      <p className="text-gray-500 text-sm mb-6">Gestión completa de la plataforma</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard value={String(stats?.talleres || 0)} label="Talleres registrados" variant="success" />
        <StatCard value={String(stats?.marcas || 0)} label="Marcas registradas" variant="success" />
        <StatCard value={String(stats?.colecciones || 0)} label="Colecciones activas" variant="warning" />
        <StatCard value={String(stats?.certificados || 0)} label="Certificados emitidos" variant="muted" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card title="Accesos Rápidos">
          <div className="grid grid-cols-3 gap-2">
            {[
              { href: '/admin/colecciones', icon: BookOpen, label: 'Colecciones' },
              { href: '/admin/usuarios', icon: Users, label: 'Usuarios' },
              { href: '/admin/certificados', icon: Award, label: 'Certificados' },
              { href: '/admin/reportes', icon: BarChart3, label: 'Reportes' },
              { href: '/admin/configuracion', icon: Settings, label: 'Configuración' },
              { href: '/admin/notificaciones', icon: Bell, label: 'Notificaciones' },
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <item.icon className="w-5 h-5 text-brand-blue mx-auto mb-1" />
                  <p className="text-xs font-semibold">{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Actividad Reciente">
          {logs.length === 0 ? (
            <p className="text-sm text-gray-400">Sin actividad reciente</p>
          ) : (
            <ul className="space-y-2">
              {logs.map(log => (
                <li key={log.id} className="text-sm flex items-start gap-2">
                  <span className="text-gray-400 shrink-0">{new Date(log.timestamp).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  <span>{log.user?.name || 'Sistema'}: {log.accion}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Menú Completo</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {menuItems.map(item => (
          <Link key={item.href} href={item.href}>
            <Card className="text-center hover:shadow-card-hover transition-shadow cursor-pointer p-4">
              <item.icon className="w-5 h-5 text-brand-blue mx-auto mb-2" />
              <p className="text-xs font-semibold">{item.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
