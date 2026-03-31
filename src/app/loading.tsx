export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-brand-blue flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="font-overpass font-bold text-white text-lg">PDT</span>
        </div>
        <p className="text-sm text-gray-500 font-overpass">Cargando...</p>
      </div>
    </div>
  )
}
