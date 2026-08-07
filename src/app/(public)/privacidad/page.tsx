import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { leerDocLegal, soloCuerpoLegal } from '@/compartido/lib/legal'

export default async function PrivacidadPage() {
  let md: string
  try {
    md = await leerDocLegal('POLITICA_DE_PRIVACIDAD')
  } catch {
    return (
      <div className="prose max-w-none">
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">Política de Privacidad</h1>
        <p className="text-gray-500">No se pudo cargar el documento. Intentá de nuevo más tarde.</p>
      </div>
    )
  }
  return (
    <div className="prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{soloCuerpoLegal(md)}</ReactMarkdown>
    </div>
  )
}
