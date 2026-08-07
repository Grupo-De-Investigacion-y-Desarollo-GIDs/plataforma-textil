import { notFound } from 'next/navigation'

// Auditorías retirada del menú de Coordinación antes del evento (decisión de Sergio):
// el tab se quitó (institutional.ts) y la ruta se cierra con 404 — mismo criterio que
// denuncias. Para reactivarla: restaurar el contenido previo de este archivo (git
// history) y volver a agregar el tab en `institutional.ts`.
export default function EstadoAuditoriasPage() {
  notFound()
}
