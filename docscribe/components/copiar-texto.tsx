"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copiarTexto } from "@/lib/clipboard";

export function CopiarTexto({ texto, etiqueta = "Copiar texto" }: { texto: string; etiqueta?: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={async () => {
        if (await copiarTexto(texto)) {
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2000);
        }
      }}
    >
      {copiado ? <Check /> : <Copy />} {copiado ? "Copiado" : etiqueta}
    </Button>
  );
}
