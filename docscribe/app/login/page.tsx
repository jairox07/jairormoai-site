"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mic, Stethoscope } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "error" | "ok"; texto: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    if (modo === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMensaje({ tipo: "error", texto: "Correo o contraseña incorrectos." });
      else router.replace("/dashboard");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) setMensaje({ tipo: "error", texto: error.message });
      else if (data.session) router.replace("/dashboard");
      else setMensaje({ tipo: "ok", texto: "Revisa tu correo para confirmar la cuenta." });
    }
    setCargando(false);
  }

  async function conGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-white">
      {/* Hero */}
      <div className="relative flex h-[38dvh] min-h-[250px] items-center justify-center overflow-hidden bg-gradient-to-b from-[#7dd3d8] via-[#47b1d2] to-[#2a8dc0]">
        <span className="absolute h-[22rem] w-[22rem] rounded-full border border-white/15" />
        <span className="absolute h-72 w-72 rounded-full border border-white/20" />
        <span className="absolute h-56 w-56 rounded-full border border-white/30" />
        <span className="absolute left-[18%] top-[22%] h-2 w-2 rounded-full bg-white/70" />
        <span className="absolute right-[20%] top-[30%] h-3 w-3 rounded-full bg-white/50" />
        <span className="absolute bottom-[34%] left-[26%] h-1.5 w-1.5 rounded-full bg-white/60" />
        <div className="relative flex h-36 w-36 items-center justify-center rounded-[2.5rem] bg-white/25 shadow-2xl shadow-sky-900/20 ring-1 ring-white/60 backdrop-blur-md">
          <Mic className="h-16 w-16 text-white drop-shadow-md" strokeWidth={1.6} />
        </div>
      </div>

      {/* Hoja inferior */}
      <div className="relative -mt-9 flex-1 rounded-t-[2.5rem] bg-white px-6 pb-10 pt-12 shadow-nav">
        <div className="absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white shadow-soft ring-4 ring-brand-50">
          <Stethoscope className="h-8 w-8 text-brand-500" />
        </div>

        <h1 className="text-center text-2xl font-semibold leading-snug tracking-tight text-slate-900">
          Tu consulta, convertida
          <br />
          en nota SOAP
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-center text-sm text-slate-500">
          Graba, transcribe y estructura el expediente en segundos.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-3">
          <Input
            type="email"
            placeholder="correo@clinica.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            autoComplete={modo === "login" ? "current-password" : "new-password"}
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mensaje && (
            <p role="alert" className={mensaje.tipo === "error" ? "text-sm text-rose-600" : "text-sm text-brand-700"}>
              {mensaje.texto}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={cargando}>
            {cargando && <Loader2 className="animate-spin" />}
            {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-100" /> o <span className="h-px flex-1 bg-slate-100" />
        </div>

        <Button variant="outline" size="lg" className="w-full" onClick={conGoogle} type="button">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 12s4.3 9.7 9.6 9.7c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
          </svg>
          Continuar con Google
        </Button>

        <button
          type="button"
          className="mt-6 block w-full text-center text-sm text-slate-500 underline-offset-4 hover:text-brand-600 hover:underline"
          onClick={() => {
            setModo(modo === "login" ? "signup" : "login");
            setMensaje(null);
          }}
        >
          {modo === "login" ? "¿No tienes cuenta? Regístrate gratis" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </main>
  );
}
