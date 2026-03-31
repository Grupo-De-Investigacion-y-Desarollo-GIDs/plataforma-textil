export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-brand-blue flex items-center justify-center mx-auto mb-4">
            <span className="font-overpass font-bold text-white text-2xl">PDT</span>
          </div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue">Plataforma Digital Textil</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
