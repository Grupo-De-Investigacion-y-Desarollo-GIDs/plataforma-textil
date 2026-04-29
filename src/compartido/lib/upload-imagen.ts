export async function uploadImagen(
  file: File,
  contexto: 'portfolio' | 'pedido' | 'cotizacion',
  entityId: string,
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('contexto', contexto)
  formData.append('entityId', entityId)

  const res = await fetch('/api/upload/imagenes', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const data = await res.json()
    const msg = typeof data.error === 'string' ? data.error : data.error?.message
    throw new Error(msg ?? 'Error al subir imagen')
  }

  const { url } = await res.json()
  return url
}
