export default function MarcaDirectorioLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="h-7 bg-gray-200 rounded w-48 mb-1" />
      <div className="h-4 bg-gray-100 rounded w-72 mb-6" />

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-10 bg-gray-100 rounded-lg" />
          <div className="h-10 bg-gray-100 rounded-lg" />
          <div className="h-10 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="h-5 bg-gray-200 rounded w-36 mb-1" />
                <div className="h-3 bg-gray-100 rounded w-28" />
              </div>
              <div className="h-6 bg-gray-100 rounded-full w-20" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3 w-3 bg-gray-100 rounded-full" />
              <div className="h-3 bg-gray-100 rounded w-32" />
            </div>
            <div className="flex gap-1.5 mb-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-5 bg-gray-100 rounded-full w-16" />
              ))}
            </div>
            <div className="h-9 bg-gray-200 rounded-lg w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
