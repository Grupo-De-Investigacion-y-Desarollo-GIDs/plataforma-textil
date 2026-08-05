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
};

export default nextConfig;
