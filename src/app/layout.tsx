import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "./providers";
import { FeedbackWidgetWrapper } from "@/compartido/componentes/feedback-widget-wrapper";
import { AmbienteBanner } from "@/compartido/componentes/ambiente-banner";
import "./globals.css";

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
        className="antialiased"
      >
        <AmbienteBanner />
        <Providers>
          {children}
          <FeedbackWidgetWrapper />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
