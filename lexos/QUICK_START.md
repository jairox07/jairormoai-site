# LexOS — Quick Start (2 minutos)

**🎯 Meta:** Correr LexOS en localhost y ver el Módulo RAG funcionando.

---

## ⚡ TL;DR

```powershell
# 1. Ejecutar script de setup (Windows)
powershell -ExecutionPolicy Bypass -File setup-dev.ps1

# 2. Editar .env (añade tus keys: Supabase, OpenAI, Pinecone)
notepad .env

# 3. Terminal 1: Backend
cd backend && npm run dev

# 4. Terminal 2: Frontend (nueva terminal)
cd frontend && npm run dev

# 5. Abre http://localhost:5173 en el navegador
```

---

## 📋 Requisitos (5 min para obtener)

### 1. Software local
- ✅ [Node.js 18+](https://nodejs.org) — instalar
- ✅ [PostgreSQL 16+](https://www.postgresql.org/download) — instalar y DEJAR CORRIENDO

### 2. Cuentas online GRATIS
| Servicio | Paso | Link |
|----------|------|------|
| **Supabase** | Crear proyecto | https://supabase.com/dashboard |
| **OpenAI** | Crear API key | https://platform.openai.com/api-keys |
| **Pinecone** | Crear índice `lexos-docs` | https://app.pinecone.io |

---

## 🚀 Pasos

### Paso 1: PostgreSQL corriendo

**Windows:**
```powershell
# Verificar que PostgreSQL está corriendo
psql -U postgres -c "SELECT 1"
# Respuesta: 1 = OK
```

**Mac/Linux:**
```bash
brew services start postgresql@16
```

### Paso 2: Obtener credenciales

**Supabase:**
1. Crea proyecto → `Settings` → `API`
2. Copia estos valores:
   ```
   SUPABASE_URL = https://xxxx.supabase.co
   SUPABASE_SERVICE_KEY = eyJhbGc...
   SUPABASE_JWT_SECRET = (copia del dashboard)
   VITE_SUPABASE_ANON_KEY = eyJhbGc...
   ```

**OpenAI:**
1. https://platform.openai.com/api-keys
2. Copia: `sk-...`

**Pinecone:**
1. https://app.pinecone.io
2. Crear index: nombre `lexos-docs`, dimension `3072`
3. Copia: `pcsk_...`

### Paso 3: Archivo `.env`

```bash
# Windows
notepad .env

# Mac/Linux
nano .env
```

**Llena estos valores (copia de arriba):**
```env
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/lexos
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=xxxx
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=pcsk_...
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# El resto se genera automáticamente en setup-dev.ps1
```

### Paso 4: Backend

```powershell
cd backend
npm run dev
# Deberías ver:
# ✅ PostgreSQL: connected
# ✅ LexOS API running on port 4000 [development]

# Test rápido (en otra ventana):
curl http://localhost:4000/health
```

### Paso 5: Frontend

```powershell
# Nueva terminal
cd frontend
npm run dev
# Deberías ver:
# ➜  Local:   http://localhost:5173/
```

### Paso 6: Abrir en navegador

Ir a **http://localhost:5173**

---

## 🧪 Test RAG

El frontend ya muestra la interfaz del módulo RAG (Investigación Legal con IA).

**Para testear desde línea de comandos:**

```bash
# Obtener token (primero crea usuario en Supabase → Auth → Users → Invite)
JWT_TOKEN="<pega_token_aqui>"

# Test 1: Búsqueda semántica
curl -X POST http://localhost:4000/api/rag/query \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "query": "¿Cuáles son los plazos?",
    "queryType": "semantic_search"
  }'

# Test 2: Análisis de riesgos
curl -X POST http://localhost:4000/api/rag/risk \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"documentIds": []}'
```

---

## ❌ Si falla algo

| Problema | Solución |
|----------|----------|
| **"PostgreSQL: connection failed"** | Verifica que PostgreSQL está corriendo: `psql -U postgres -c "SELECT 1"` |
| **Port 4000 en uso** | Cambiar `PORT=4000` a `PORT=4001` en `.env` |
| **Module not found (npm)** | `cd backend && npm install` (sin flags `--legacy-peer-deps`) |
| **TypeError: Cannot find module** | Reiniciar backend (`Ctrl+C` y `npm run dev` de nuevo) |
| **Supabase JWT invalid** | Verifica `SUPABASE_JWT_SECRET` en `.env` contra el dashboard |

---

## 📚 Documentación

- **Setup detallado:** [`SETUP_LOCAL.md`](./SETUP_LOCAL.md)
- **Ejemplos API:** [`API_EXAMPLES.md`](./API_EXAMPLES.md)
- **README completo:** [`README.md`](./README.md)
- **Schema BD:** [`database/migrations/001_initial_schema.sql`](./database/migrations/001_initial_schema.sql)

---

## 🎉 ¿Qué está implementado?

✅ **Backend:**
- Express + TypeScript
- PostgreSQL con RLS (Row-Level Security)
- Supabase Auth (JWT)
- OpenAI Embeddings + Chat
- Pinecone Vector DB (namespace isolation)
- AES-256-GCM encryption
- Audit trail inmutable

✅ **Módulo 4 (RAG):**
- PDF/DOCX parsing
- Text chunking + embedding
- Semantic search
- Risk analysis
- Jurisprudence summarization
- Clause extraction

✅ **Frontend:**
- React 18 + Vite
- Tailwind CSS (dark/light mode)
- 5 query types UI
- Real-time results
- Source attribution

---

## 🚀 Próximos pasos

1. Crear un documento de prueba (PDF/DOCX)
2. Subirlo a través de la UI (próxima fase)
3. Testear las 5 modos de consulta
4. Ver cómo OpenAI+Pinecone sintetiza respuestas

---

**¿Listo? Abre http://localhost:5173 y comienza a investigar. 🎉**

*Para problemas detallados, lee [`SETUP_LOCAL.md`](./SETUP_LOCAL.md) → sección Troubleshooting.*
