export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-96 bg-gray-100 rounded mt-2" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-36 bg-gray-200 rounded-lg" />
          <div className="h-10 w-44 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="h-4 w-24 bg-gray-100 rounded" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="flex gap-2">
            <div className="h-5 w-24 bg-gray-200 rounded-full" />
            <div className="h-5 w-16 bg-gray-100 rounded" />
          </div>
          <div className="h-5 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-3 w-1/3 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  )
}
