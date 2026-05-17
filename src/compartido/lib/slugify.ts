import { prisma } from '@/compartido/lib/prisma'

function basicSlugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)
}

export async function generarSlugUnico(titulo: string, excludeId?: string): Promise<string> {
  const baseSlug = basicSlugify(titulo)

  const existing = await prisma.novedad.findFirst({
    where: {
      slug: baseSlug,
      ...(excludeId && { NOT: { id: excludeId } }),
    },
  })

  if (!existing) return baseSlug

  const timestamp = Date.now().toString().slice(-6)
  return `${baseSlug}-${timestamp}`
}
