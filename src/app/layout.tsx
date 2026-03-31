import type { Metadata, Viewport } from "next";
import { Noto_Sans, Overpass } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const overpass = Overpass({
  variable: "--font-overpass",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "PDT - Plataforma Digital Textil",
  description: "Plataforma Digital Textil - Conectando talleres y marcas",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${notoSans.variable} ${overpass.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
