# DocScribe (MVP)

PWA móvil-first: el médico graba la consulta → Whisper la transcribe → un LLM genera la nota SOAP → se guarda en Supabase.

## Estructura

```
app/
  login/page.tsx            Login/Signup (email+password y Google)
  auth/callback/route.ts    Retorno OAuth / confirmación de email
  auth/signout/route.ts     Cerrar sesión
  dashboard/page.tsx        Contador "consultas restantes" + historial + FAB "Nueva Consulta"
  consulta/nueva/page.tsx   Pantalla de grabación
  consulta/[id]/page.tsx    Ver una nota guardada
  api/transcribe/route.ts   STT (Whisper)
  api/soap/route.ts         LLM → nota SOAP + guardado atómico vía RPC
  manifest.ts, icon.svg     PWA
components/
  recorder.tsx              MediaRecorder + Web Audio API (medidor), timer, estados de carga
  soap-result.tsx           4 tarjetas SOAP, copiar al portapapeles, exportar PDF (jsPDF)
  ui/                       Componentes shadcn (button, card, input)
lib/
  ai.ts                     System prompt + llamadas Whisper / Gemini / OpenAI (con modo demo)
  supabase/                 Clientes browser/server (@supabase/ssr)
supabase/schema.sql         Tablas, RLS, trigger de perfil, función registrar_consulta()
middleware.ts               Refresco de sesión y protección de rutas
```

## Puesta en marcha

1. Crea un proyecto en Supabase y ejecuta `supabase/schema.sql` en el SQL Editor.
2. Auth → Providers: activa Email y Google (Client ID/Secret de Google Cloud).
   Auth → URL Configuration: agrega `http://localhost:3000/auth/callback` (y el dominio de producción) a Redirect URLs.
3. `cp .env.example .env.local` y llena las variables. Sin `OPENAI_API_KEY`/`GEMINI_API_KEY` la app funciona en **modo demo** (transcripción y nota simuladas).
4. `npm install && npm run dev`, abre http://localhost:3000 (el micrófono requiere HTTPS o localhost).

## Modo 100% local (sin API keys) + prueba en el celular

Proveedores (variables en `.env.local`): `STT_PROVIDER` = openai | local | mock y `LLM_PROVIDER` = gemini | openai | ollama | mock. Sin definirlos se elige solo: OpenAI/Gemini si hay key, si no local (`STT_LOCAL_URL`, `OLLAMA_MODEL`), si no demo.

Tres terminales:

```bash
npm run stt        # faster-whisper local en :8787 (usa el venv de whisperx)
npm run dev:lan    # Next en 0.0.0.0:3000
npm run tunnel     # ngrok -> URL https pública
```

Y Ollama corriendo con el modelo de `OLLAMA_MODEL` (`qwen2.5:7b` ≈ 35 s por nota con el modelo ya cargado; `qwen2.5:3b` ≈ 16 s; la primera llamada tarda más por la carga).

El micrófono del navegador exige HTTPS (o localhost). Por eso el celular debe abrir la URL `https://…ngrok-free.dev`, no `http://192.168.x.x:3000`. Cierra el túnel (Ctrl+C) al terminar: mientras esté abierto, cualquiera con la URL puede ver la pantalla de login.

## Administración (`/admin`)

Solo para usuarios con `is_admin = true` (los demás ven un 404). Muestra conteos de usuarios y consultas, **nunca el contenido clínico**.

- **Usuarios:** cambiar plan Free/Pro, reiniciar el contador del mes, suspender/reactivar (una cuenta suspendida no puede crear consultas) y dar o quitar admin. Un admin no puede quitarse el acceso a sí mismo.
- **Funcionalidades:** interruptor general de "Nuevas consultas" (modo mantenimiento), activar/desactivar el envío del PDF por correo y el límite mensual del plan Free.
- **Proveedores:** elegir proveedor de transcripción y de notas entre los que tienen credenciales en el servidor, y el modelo de Ollama. Las API keys **no** se guardan en la base: siguen siendo variables de entorno.

La seguridad está en la base de datos (funciones `admin_*` que verifican `is_admin()`), no en la interfaz. Primer admin: `update public.users set is_admin = true where email = 'tu@correo.com';`. Sin incluir a propósito: borrar cuentas (requiere la llave de servicio de Supabase), facturación y auditoría.

## Sesiones largas, borrado y correo

- **Duración:** hasta 120 min por consulta (24 kbps ≈ 10.8 MB/h). La pantalla del celular se mantiene encendida mientras se graba (Wake Lock). En local la transcripción va a ~4.5× tiempo real (1 h ≈ 13 min). Ollama ajusta `num_ctx` al largo del texto; para consultas de más de ~45 min un 7B pierde calidad, usa Gemini/OpenAI.
- **Vercel:** su límite de body es 4.5 MB (~25 min). Pon `MAX_AUDIO_MB=4` o sube el audio directo a Supabase Storage.
- **Borrar:** ícono de papelera en cada consulta del dashboard, con confirmación. Borrar no devuelve cuota del mes.
- **Correo:** botón "Enviar a mi correo" y opción "al terminar cada consulta" (se recuerda en el dispositivo). Requiere `RESEND_API_KEY`. Solo se envía al correo del usuario autenticado. Sin dominio verificado en Resend, solo llega al correo de tu cuenta de Resend. El correo normal no va cifrado: define con tu aviso de privacidad si se permite mandar notas clínicas por esta vía.

## Sincronización en tiempo real

`components/dashboard-live.tsx` se suscribe a `INSERT` en `consultas` (publicación `supabase_realtime`, filtrada por `user_id`, con RLS). Una nota grabada en el celular aparece sola en el dashboard abierto en la computadora.

## Notas de diseño

- **Cuota freemium**: `registrar_consulta()` (security definer) bloquea la fila del usuario, reinicia el contador al cambiar de mes, rechaza con `LIMITE_ALCANZADO` si `free` ≥ 20, inserta la consulta e incrementa el contador en una sola transacción. El cliente no tiene permiso de UPDATE sobre `users`, así que no puede cambiarse a `pro`.
- **Tamaño de audio**: grabación a 24 kbps, máx. 20 min (~3.6 MB), bajo el límite de 4.5 MB por request de Vercel. Para consultas más largas, sube el audio directo a Supabase Storage y pasa la ruta a la API.
- **Datos clínicos**: transcripciones y notas son datos de salud sensibles. Antes de producción: aviso de privacidad y consentimiento del paciente (LFPDPPP / NOM-024 en México; HIPAA + BAA con proveedores en EE. UU.), y revisar la retención de datos de OpenAI/Google.
- La nota generada es un borrador: el médico debe revisarla antes de usarla.
