import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend", display: "swap" });

export const metadata: Metadata = {
  title: "DocScribe",
  description: "Graba tu consulta y obtén una nota clínica SOAP en segundos.",
  applicationName: "DocScribe",
  appleWebApp: { capable: true, title: "DocScribe", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#2da3d3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={lexend.variable}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
