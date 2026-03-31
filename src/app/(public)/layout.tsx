import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-brand-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="font-overpass font-bold text-brand-blue text-sm">PDT</span>
            </div>
            <span className="font-overpass font-bold">Plataforma Digital Textil</span>
          </Link>
          <Link href="/login" className="text-sm hover:text-blue-200 transition-colors font-overpass">
            Iniciar sesión
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
