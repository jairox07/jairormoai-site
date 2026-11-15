"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogOut, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

// Barra inferior con botón central en rombo (estilo app de citas médicas).
export function BottomNav({ bloqueado = false }: { bloqueado?: boolean }) {
  const pathname = usePathname();
  const enInicio = pathname.startsWith("/dashboard");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg md:hidden" aria-label="Navegación principal">
      <div className="grid grid-cols-3 items-end rounded-t-[2rem] bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-nav">
        <Link
          href="/dashboard"
          className={cn("flex flex-col items-center gap-1 py-1 text-xs", enInicio ? "font-medium text-brand-500" : "text-slate-400")}
        >
          <Home className="h-6 w-6" />
          Inicio
        </Link>

        <div className="flex flex-col items-center">
          {bloqueado ? (
            <span
              aria-disabled="true"
              className="-mt-10 flex h-16 w-16 rotate-45 items-center justify-center rounded-[1.4rem] bg-slate-300 text-white ring-8 ring-white"
            >
              <Mic className="h-7 w-7 -rotate-45" />
            </span>
          ) : (
            <Link
              href="/consulta/nueva"
              aria-label="Nueva consulta"
              className="-mt-10 flex h-16 w-16 rotate-45 items-center justify-center rounded-[1.4rem] bg-brand-500 text-white shadow-lg shadow-brand-500/40 ring-8 ring-white transition-transform active:scale-95"
            >
              <Mic className="h-7 w-7 -rotate-45" />
            </Link>
          )}
          <span className="mt-3 text-xs font-medium text-slate-600">Nueva consulta</span>
        </div>

        <form action="/auth/signout" method="post" className="flex justify-center">
          <button type="submit" className="flex flex-col items-center gap-1 py-1 text-xs text-slate-400 transition-colors hover:text-brand-600">
            <LogOut className="h-6 w-6" />
            Salir
          </button>
        </form>
      </div>
    </nav>
  );
}
