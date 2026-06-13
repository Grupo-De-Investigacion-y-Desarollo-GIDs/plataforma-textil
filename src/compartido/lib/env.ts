/**
 * Devuelve true si debe mostrarse la pill "Ambiente piloto".
 * - false en produccion (main)
 * - false en local (sin VERCEL_ENV)
 * - true en preview/dev (otros branches)
 */
export function getShowPilotPill(): boolean {
  const isMain = process.env.VERCEL_GIT_COMMIT_REF === 'main'
  const isLocal = !process.env.VERCEL_ENV
  return !isMain && !isLocal
}
