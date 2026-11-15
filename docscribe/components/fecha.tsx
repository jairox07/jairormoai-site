"use client";

import { useEffect, useState } from "react";

const FORMATOS = {
  lista: { dateStyle: "medium", timeStyle: "short" },
  dia: { day: "numeric", month: "long" },
  hora: { hour: "2-digit", minute: "2-digit" },
  anio: { year: "numeric" },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

// Las fechas se formatean SOLO en el navegador: el servidor (otro ICU y otra zona horaria)
// escribía "9:21 p.m." y iOS "9:21 pm" -> error de hidratación, y en producción la hora saldría en UTC.
export function Fecha({ iso, formato }: { iso: string; formato: keyof typeof FORMATOS }) {
  const [texto, setTexto] = useState("");

  useEffect(() => {
    setTexto(new Date(iso).toLocaleString("es-MX", FORMATOS[formato]));
  }, [iso, formato]);

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {texto || " "}
    </time>
  );
}
