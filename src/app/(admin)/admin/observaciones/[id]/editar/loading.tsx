export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-48 bg-gray-200 rounded" />
      <div className="flex items-center justify-between">
        <div className="h-7 w-56 bg-gray-200 rounded" />
        <div className="h-9 w-24 bg-gray-200 rounded-lg" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 max-w-3xl">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-100 rounded-lg" />
          </div>
        ))}
        <div className="space-y-1">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-32 w-full bg-gray-100 rounded-lg" />
        </div>
        <div className="flex gap-3 pt-2">
          <div className="h-10 w-24 bg-gray-200 rounded-lg" />
          <div className="h-10 w-40 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
