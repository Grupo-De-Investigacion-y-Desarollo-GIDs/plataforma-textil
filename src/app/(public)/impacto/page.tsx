import { EmptyState } from '@/compartido/componentes/ui/empty-state'
import { Construction } from 'lucide-react'

export default function ImpactoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <EmptyState
        icon={<Construction className="w-12 h-12 text-gray-400" />}
        titulo="Impacto"
        mensaje="Esta secci\u00f3n estar\u00e1 disponible pr\u00f3ximamente."
      />
    </div>
  )
}
