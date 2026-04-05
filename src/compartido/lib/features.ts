import { prisma } from './prisma'

/**
 * Lee un feature flag de ConfiguracionSistema.
 * Sin cache — cada llamada consulta la DB.
 * Para el piloto (<100 requests/min) esto es despreciable.
 * Si se necesita cache real, usar Vercel KV o unstable_cache de Next.js.
 */
export async function getFeatureFlag(clave: string): Promise<boolean> {
  const config = await prisma.configuracionSistema.findUnique({
    where: { clave },
  })
  return config?.valor === 'true'
}

export async function getFeatureFlags(grupo: string): Promise<Record<string, boolean>> {
  const configs = await prisma.configuracionSistema.findMany({
    where: { grupo },
  })
  return Object.fromEntries(configs.map(c => [c.clave, c.valor === 'true']))
}
