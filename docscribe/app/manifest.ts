import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DocScribe — Notas SOAP con IA",
    short_name: "DocScribe",
    description: "Graba la consulta y genera la nota clínica SOAP automáticamente.",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f1f6fa",
    theme_color: "#2da3d3",
    lang: "es",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
