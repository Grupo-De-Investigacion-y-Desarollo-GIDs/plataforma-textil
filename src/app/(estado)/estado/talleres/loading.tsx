export default function EstadoTalleresLoading() {
  return (
    <div className="max-w-5xl mx-auto py-6 px-4 animate-pulse">
      {/* Header */}
      <div className="h-7 bg-gray-200 rounded w-32 mb-1" />
      <div className="h-4 bg-gray-100 rounded w-80 mb-6" />

      {/* 5 stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="h-3 bg-gray-100 rounded w-16 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-12" />
          </div>
        ))}
      </div>

      {/* ARCA card */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 bg-gray-200 rounded w-36 mb-1" />
            <div className="h-3 bg-gray-100 rounded w-48" />
          </div>
          <div className="h-9 bg-gray-200 rounded w-28" />
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="space-y-3">
          {/* Header de tabla */}
          <div className="flex gap-4 border-b border-gray-200 pb-3">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
          {/* Filas */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <div className="h-4 bg-gray-100 rounded w-36" />
              <div className="h-5 bg-gray-100 rounded w-16" />
              <div className="h-4 bg-gray-100 rounded w-24" />
              <div className="h-4 bg-gray-100 rounded w-8" />
              <div className="h-2 bg-gray-100 rounded flex-1" />
              <div className="h-8 w-8 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
