import { Factory } from 'lucide-react'

// Placeholder institucional para la card del directorio cuando el taller no subió
// foto (Etapa 2.3-A: la foto es OPCIONAL en el piloto — no excluye del directorio).
// Reemplaza al ícono gris suelto por una placa con identidad PDT, consistente entre
// el directorio público y el de marca. Si post-piloto la foto pasa a obligatoria
// (FOTO_OBLIGATORIA=true), este placeholder deja de mostrarse para esos talleres.
export function TallerFotoPlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-brand-bg-light">
      <Factory className="w-8 h-8 text-brand-blue/40" />
      <span className="font-overpass font-bold text-[10px] uppercase tracking-wide text-brand-blue/50">
        Plataforma Digital Textil
      </span>
    </div>
  )
}
