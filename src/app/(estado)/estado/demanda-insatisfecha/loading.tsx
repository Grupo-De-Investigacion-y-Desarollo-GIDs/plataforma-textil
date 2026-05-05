export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-9 bg-gray-200 rounded w-72 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-96" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-card border border-gray-100 p-6 text-center">
            <div className="w-6 h-6 bg-gray-200 rounded mx-auto mb-2" />
            <div className="h-9 bg-gray-200 rounded w-16 mx-auto mb-1" />
            <div className="h-3 bg-gray-100 rounded w-32 mx-auto" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <div className="h-4 bg-gray-100 rounded w-48" />
                <div className="h-4 bg-gray-100 rounded w-16" />
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
