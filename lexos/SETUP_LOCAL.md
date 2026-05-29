# LexOS — Setup local para desarrollo

Guía completa para correr LexOS en tu máquina de desarrollo.

## 1️⃣ Requisitos previos

### Software obligatorio
- **Node.js 18+** → [nodejs.org](https://nodejs.org)
- **PostgreSQL 16+** → [postgresql.org](https://www.postgresql.org/download)
- **Git** → [git-scm.com](https://git-scm.com)

### Cuentas SaaS requeridas (GRATIS hasta 5M tokens/mes)
- **Supabase** (Auth) → [supabase.com](https://supabase.com/dashboard) — **Crea proyecto gratuito**
- **OpenAI** (Embeddings + Chat) → [platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys) — **$5 créditos de prueba**
- **Pinecone** (Vector DB) → [app.pinecone.io](https://app.pinecone.io) — **Pod gratuito de 1M vectores**

**Tiempo estimado:** 45 minutos

---

## 2️⃣ Configurar PostgreSQL local

### En Windows (pgAdmin)
```powershell
# 1. Instalar PostgreSQL desde el wizard (contraseña = lexos_password)
# 2. Abrir pgAdmin (generalmente en localhost:5050)
# 3. Click derecho "Servers" → Create → Server
#    Name: LexOS Dev
#    Host: localhost
#    Port: 5432
#    Username: postgres
#    Password: (la que pusiste en la instalación)

# 4. Crear BD
CREATE DATABASE lexos;

# 5. Verificar conexión desde terminal
psql -U postgres -d lexos -c "SELECT 1"
```

### En macOS/Linux
```bash
# Instalar PostgreSQL
brew install postgresql@16

# Iniciar servicio
brew services start postgresql@16

# Crear usuario y BD
createuser -P lexos_user  # Ingresa password: lexos_password
createdb -O lexos_user lexos

# Verificar
psql -U lexos_user -d lexos -c "SELECT 1"
```

---

## 3️⃣ Configurar Supabase (Auth)

### Crear proyecto
1. Ve a https://supabase.com/dashboard
2. Click **"New Project"**
3. **Name:** `lexos-dev`
4. **Password:** (guarda en lugar seguro)
5. **Region:** `eu-west-1` (GDPR)
6. Espera 3 min a que se cree…

### Obtener credenciales
En el dashboard del proyecto → **"Settings" → "API"**

Copia estos valores a un block de notas:
```
SUPABASE_URL = https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY = eyJhbGc...
SUPABASE_JWT_SECRET = (encontrará en JWT Secret)
VITE_SUPABASE_ANON_KEY = eyJhbGc...
```

### (Opcional) Crear usuario test
1. Ve a **"Authentication" → "Users"**
2. Click **"Invite"**
3. Email: `test@lexos.local`
4. Password: `Test123!@#`

---

## 4️⃣ Configurar OpenAI

### Crear API key
1. Ve a https://platform.openai.com/account/api-keys
2. Click **"Create new secret key"**
3. Copia: `sk-...`

**Verifica que tienes crédito:** https://platform.openai.com/account/billing/overview
- Si no, agrega método de pago ($20 inicial es suficiente para desarrollar)

---

## 5️⃣ Configurar Pinecone

### Crear índice
1. Ve a https://app.pinecone.io
2. Click **"Create Index"**
3. **Name:** `lexos-docs`
4. **Dimension:** `3072` (para `text-embedding-3-large`)
5. **Metric:** `cosine`
6. **Environment:** `us-east-1-aws`
7. Espera 2 min…

### Obtener API key
- En el dashboard → **"Settings" → "API Keys"**
- Copia la key (formato: `pcsk_...`)

---

## 6️⃣ Crear archivo `.env`

En la raíz del proyecto (`C:\Users\Jairo Romo\GitClaudeCode\lexos\`):

```bash
# Copiar plantilla
cp .env.example .env

# Abrir y rellenar
notepad .env  # Windows
nano .env     # Mac/Linux
```

**Contenido para desarrollo local:**

```bash
# Server
NODE_ENV=development
PORT=4000
ALLOWED_ORIGINS=http://localhost:5173

# PostgreSQL (local)
DATABASE_URL=postgresql://lexos_user:lexos_password@localhost:5432/lexos

# Supabase (pegar valores de arriba)
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=your-jwt-secret-minimum-32-characters

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
OPENAI_CHAT_MODEL=gpt-4o

# Pinecone
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=lexos-docs
PINECONE_ENVIRONMENT=us-east-1-aws

# Encryption (generar con: openssl rand -hex 32)
# En Windows, usa WSL o https://cryptii.com/pipes/entropy
AES_MASTER_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Storage (MinIO local para dev)
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_BUCKET=lexos-dev
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_REGION=us-east-1

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Frontend
VITE_API_URL=http://localhost:4000/api
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

⚠️ **NUNCA commitear `.env`** — está en `.gitignore`

---

## 7️⃣ Setup PostgreSQL — Migraciones

### En terminal, desde `lexos/backend/`:

```bash
# Instalar dependencias
npm install

# Generar key de encriptación (Windows/Mac/Linux)
# En Windows con WSL2:
wsl -e openssl rand -hex 32

# Crear archivo .env.local para testing (opcional)
# Copiar DATABASE_URL y AES_MASTER_KEY

# Ejecutar migraciones
npm run db:migrate
```

**Verifica la conexión:**
```bash
psql -U lexos_user -d lexos -c "
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  LIMIT 5;
"
```

Deberías ver: `users`, `clients`, `cases`, `documents`, etc.

---

## 8️⃣ Instalar dependencias — Backend & Frontend

```bash
# Backend
cd backend
npm install

# Frontend (en otra terminal)
cd frontend
npm install
```

---

## 9️⃣ Ejecutar en desarrollo

### Terminal 1 — Backend
```bash
cd backend
npm run dev
# Deberías ver:
# LexOS API running on port 4000 [development]
# PostgreSQL: connected
```

**Test rápido:**
```bash
curl http://localhost:4000/health
# Respuesta: {"status":"ok","timestamp":"...","version":"1.0.0"}
```

### Terminal 2 — Frontend
```bash
cd frontend
npm run dev
# Deberías ver:
# Local:   http://localhost:5173/
# Press q + enter to quit
```

Abre en el navegador: **http://localhost:5173**

---

## 🔟 Acceso inicial

### Opción A: Usuario Supabase
1. Ve a Auth → Users en Supabase dashboard
2. **Invite** un usuario: `yourname@example.com`
3. Usa ese email + password en http://localhost:5173/login

### Opción B: Auth local simulado
Para saltarse login en desarrollo (⚠️ solo local):
```typescript
// En frontend/src/store/auth.store.ts descomentar
// const SKIP_AUTH_DEV = true;
```

---

## 🆘 Troubleshooting

### ❌ "PostgreSQL: connection failed"
```bash
# Verifica que PG está corriendo
psql -U postgres -c "SELECT 1"

# Si falla, reinicia el servicio
# Windows: Servicios → PostgreSQL → Reiniciar
# Mac: brew services restart postgresql@16
# Linux: sudo systemctl restart postgresql
```

### ❌ "Cannot find module 'openai'"
```bash
# Reinstalar
cd backend
npm install
npm audit fix
```

### ❌ "Supabase JWT invalid"
- Verifica `SUPABASE_JWT_SECRET` es correcto
- Coincide con Settings → API en Supabase dashboard

### ❌ "Pinecone connection timeout"
- Verifica `PINECONE_API_KEY` es válido
- Espera 2 min — a veces el índice tarda en estar disponible

### ❌ "CORS error en frontend"
- Verifica `ALLOWED_ORIGINS` en `.env` incluye `http://localhost:5173`
- Reinicia backend

---

## 📊 Testing del Módulo RAG

### 1. Subir documento (en desarrollo usamos mock)

```bash
curl -X POST http://localhost:4000/api/rag/documents/test-doc/index \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Consultar
```bash
curl -X POST http://localhost:4000/api/rag/query \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "¿Cuáles son los plazos de este contrato?",
    "queryType": "semantic_search"
  }'
```

---

## 🚀 Próximos pasos

✅ Backend listo
✅ Frontend listo
✅ Módulo 4 (RAG) funcionando

### Por hacer:
- [ ] Módulo 1: Onboarding & portal cliente
- [ ] Módulo 2: Generador de contratos
- [ ] Módulo 3: Gestión de expedientes (Kanban)
- [ ] Módulo 5: Facturación & horas billables
- [ ] Autenticación real (conectar Supabase Auth en UI)
- [ ] Upload seguro de documentos
- [ ] Testes unitarios e integración

---

## 📝 Notas importantes

- **No pushear `.env`** — nunca a Git
- **AES_MASTER_KEY** — si lo pierdes, los datos encriptados no se recuperan
- **PostgreSQL debe estar corriendo** — antes de `npm run dev`
- **Rate limiting desactivado en localhost** — activarse en producción
- **Logging** — usa `console.log()` en dev; en prod usa Pino

---

Cualquier duda: revisa los logs en la terminal de backend.

**¡Listo para codificar! 🎉**
