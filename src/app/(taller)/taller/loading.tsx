export default function TallerDashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto py-6 px-4 animate-pulse">
      {/* Header con nivel */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-5 bg-gray-100 rounded w-24" />
        </div>
        <div className="h-10 bg-gray-200 rounded-xl w-28" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>

      {/* ProximoNivelCard skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
        <div className="h-3 bg-gray-100 rounded-full w-full mb-2" />
        <div className="h-3 bg-gray-100 rounded w-24 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-5 w-5 bg-gray-100 rounded-full" />
              <div className="h-4 bg-gray-100 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Grid: ordenes + capacitacion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ordenes en curso */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="h-5 bg-gray-200 rounded w-36 mb-4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="h-4 bg-gray-100 rounded w-20" />
              <div className="h-4 bg-gray-100 rounded flex-1" />
              <div className="h-5 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
        {/* Capacitacion */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="h-5 bg-gray-200 rounded w-44 mb-4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="h-4 bg-gray-100 rounded flex-1" />
              <div className="h-3 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
