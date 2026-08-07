import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // P-02: /terminos y /privacidad leen docs/legal/*.md en runtime -> Vercel debe
  // empaquetar esos archivos en la funcion serverless.
  outputFileTracingIncludes: {
    '/terminos': ['./docs/legal/**'],
    '/privacidad': ['./docs/legal/**'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      // La accion real de verificar CUIT vive en /taller/formalizacion (pieza A).
      // La ruta /taller/perfil/verificar-cuit nunca existio (404); se redirige por
      // si quedo algun enlace/bookmark viejo.
      {
        source: '/taller/perfil/verificar-cuit',
        destination: '/taller/formalizacion#verificar-cuit',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
