export function AmbienteBanner() {
  const env = process.env.VERCEL_ENV
  const branch = process.env.VERCEL_GIT_COMMIT_REF

  // Mostrar banner cuando NO estamos en produccion real (main)
  // El alias plataforma-textil-dev.vercel.app (branch develop) tiene VERCEL_ENV=production
  // pero VERCEL_GIT_COMMIT_REF=develop, asi que usamos la rama como criterio principal
  const isMain = branch === 'main'
  const isLocal = !env

  if (isMain || isLocal) return null

  const isPreview = env === 'preview' || branch === 'develop'
  const label = isPreview ? 'AMBIENTE DE PRUEBAS' : 'DESARROLLO LOCAL'
  const color = isPreview ? 'bg-amber-500' : 'bg-purple-500'

  return (
    <div className={`${color} text-white text-center text-xs font-semibold py-1`}>
      {label} — este no es el ambiente de produccion
    </div>
  )
}
