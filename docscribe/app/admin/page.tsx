import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cargarConfig, proveedoresDisponibles } from "@/lib/config";
import { AdminPanel, type UsuarioAdmin } from "@/components/admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Si no eres admin la ruta "no existe". La seguridad real está en las funciones SQL (admin_*), esto es solo UX.
  const { data: yo } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  if (!yo?.is_admin) notFound();

  const [{ data: usuarios }, config] = await Promise.all([supabase.rpc("admin_listar_usuarios"), cargarConfig(supabase)]);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-5">
      <header className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard"
          aria-label="Volver"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-soft transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-medium text-slate-900">Administración</h1>
        <span className="h-11 w-11" aria-hidden="true" />
      </header>

      <AdminPanel
        yoId={user.id}
        usuariosIniciales={(usuarios ?? []) as UsuarioAdmin[]}
        configInicial={config}
        disponibles={proveedoresDisponibles()}
      />
    </main>
  );
}
