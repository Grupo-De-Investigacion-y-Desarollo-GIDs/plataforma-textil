export default function AuthLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="w-12 h-12 rounded-full bg-gray-200 mx-auto mb-3" />
        <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
      </div>
    </div>
  )
}
