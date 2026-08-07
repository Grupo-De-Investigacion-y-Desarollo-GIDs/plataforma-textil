import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
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
