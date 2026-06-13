import { redirect } from 'next/navigation'

export default async function AdminEditarColeccionRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/contenido/colecciones/${id}`)
}
