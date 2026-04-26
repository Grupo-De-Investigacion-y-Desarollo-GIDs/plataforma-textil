export function AmbienteBanner() {
  const env = process.env.VERCEL_ENV

  if (env === 'production' || !env) return null

  const label = env === 'preview' ? 'AMBIENTE DE PRUEBAS' : 'DESARROLLO LOCAL'
  const color = env === 'preview' ? 'bg-amber-500' : 'bg-purple-500'

  return (
    <div className={`${color} text-white text-center text-xs font-semibold py-1`}>
      {label} — este no es el ambiente de produccion
    </div>
  )
}
