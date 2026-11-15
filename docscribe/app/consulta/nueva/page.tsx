import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Recorder } from "@/components/recorder";

export default function NuevaConsultaPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pt-5">
      <header className="mb-2 flex items-center justify-between">
        <Link
          href="/dashboard"
          aria-label="Volver"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-soft transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-medium text-slate-900">Nueva consulta</h1>
        <span className="h-11 w-11" aria-hidden="true" />
      </header>
      <Recorder />
    </main>
  );
}
