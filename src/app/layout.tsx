import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Convers — Conversational Commerce CRM",
  description: "CRM conversacional con IA para PyMEs. WhatsApp, Instagram, Facebook y Web en una sola bandeja.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
